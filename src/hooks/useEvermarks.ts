import { useState, useEffect, useMemo } from 'react';
import { getContract, readContract } from "thirdweb";
import { client } from "../lib/thirdweb";
import { CHAIN, CONTRACTS, EVERMARK_NFT_ABI } from "../lib/contracts";

export interface Evermark {
  id: string;
  title: string;
  author: string;
  description?: string;
  sourceUrl?: string;
  metadataURI: string;
  creator: string;
  creationTime: number;
  votes?: number;
}

export function useEvermarks() {
  const [evermarks, setEvermarks] = useState<Evermark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize contract instance to prevent recreation
  const contract = useMemo(() => getContract({
    client,
    chain: CHAIN,
    address: CONTRACTS.EVERMARK_NFT,
    abi: EVERMARK_NFT_ABI,
  }), []);

  useEffect(() => {
    let isMounted = true; // Prevent state updates if component unmounts

    const fetchEvermarks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get total supply
        const totalSupply = await readContract({
          contract,
          method: "totalSupply",
          params: [],
        });
        
        // If no tokens have been minted yet
        if (Number(totalSupply) === 0) {
          if (isMounted) {
            setEvermarks([]);
            setIsLoading(false);
          }
          return;
        }
        
        // Fetch the most recent tokens (up to 10)
        const fetchedEvermarks: Evermark[] = [];
        const startId = Number(totalSupply);
        const endId = Math.max(1, startId - 10); // Get up to 10 most recent tokens
        
        for (let i = startId; i >= endId; i--) {
          if (!isMounted) break; // Exit early if component unmounted
          
          try {
            // Check if token exists
            const exists = await readContract({
              contract,
              method: "exists",
              params: [BigInt(i)],
            });
            
            if (!exists) continue;
            
            // Get metadata
            const [title, author, metadataURI] = await readContract({
              contract,
              method: "getBookmarkMetadata",
              params: [BigInt(i)],
            });
            
            // Get creator
            const creator = await readContract({
              contract,
              method: "getBookmarkCreator",
              params: [BigInt(i)],
            });
            
            // Get creation time
            const creationTime = await readContract({
              contract,
              method: "getBookmarkCreationTime",
              params: [BigInt(i)],
            });
            
            // Add to evermarks
            fetchedEvermarks.push({
              id: i.toString(),
              title,
              author,
              metadataURI,
              creator,
              creationTime: Number(creationTime) * 1000, // Convert to milliseconds
              description: "", // We don't have this from the contract
              sourceUrl: "" // We don't have this from the contract
            });
          } catch (err) {
            console.error(`Error fetching token ${i}:`, err);
          }
        }
        
        if (isMounted) {
          setEvermarks(fetchedEvermarks);
        }
      } catch (err: any) {
        console.error("Error fetching evermarks:", err);
        if (isMounted) {
          setError(err.message || "Failed to load evermarks");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchEvermarks();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [contract]); // Only depend on the memoized contract

  return { evermarks, isLoading, error };
}

export function useEvermarkDetail(id: string) {
  const [evermark, setEvermark] = useState<Evermark | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize contract instance
  const contract = useMemo(() => getContract({
    client,
    chain: CHAIN,
    address: CONTRACTS.EVERMARK_NFT,
    abi: EVERMARK_NFT_ABI,
  }), []);

  useEffect(() => {
    let isMounted = true;

    const fetchEvermarkDetail = async () => {
      if (!id) {
        if (isMounted) {
          setError("Invalid Evermark ID");
          setIsLoading(false);
        }
        return;
      }

      // Handle the "new" ID placeholder case
      if (id === "new") {
        if (isMounted) {
          setError("Your Evermark is being created. Please check your collection once the transaction is confirmed.");
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Safely convert id to BigInt
        let tokenId;
        try {
          tokenId = BigInt(id);
        } catch (e) {
          if (isMounted) {
            setError(`Invalid Evermark ID format: ${id}`);
            setIsLoading(false);
          }
          return;
        }

        // Check if token exists first
        const exists = await readContract({
          contract,
          method: "exists",
          params: [tokenId],
        });

        if (!exists) {
          if (isMounted) {
            setError("Evermark not found");
            setIsLoading(false);
          }
          return;
        }

        // Get metadata
        const [title, author, metadataURI] = await readContract({
          contract,
          method: "getBookmarkMetadata",
          params: [tokenId],
        });

        // Get creator
        const creator = await readContract({
          contract,
          method: "getBookmarkCreator",
          params: [tokenId],
        });

        // Get creation time
        const creationTime = await readContract({
          contract,
          method: "getBookmarkCreationTime",
          params: [tokenId],
        });

        // If metadata URI is IPFS, fetch additional data
        let description = "";
        let sourceUrl = "";
        
        if (metadataURI && metadataURI.startsWith('ipfs://')) {
          try {
            const ipfsHash = metadataURI.replace('ipfs://', '');
            const ipfsGatewayUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
            const response = await fetch(ipfsGatewayUrl);
            
            if (response.ok) {
              const ipfsData = await response.json();
              description = ipfsData.description || "";
              sourceUrl = ipfsData.external_url || "";
            }
          } catch (ipfsError) {
            console.error("Error fetching IPFS metadata:", ipfsError);
          }
        }

        if (isMounted) {
          setEvermark({
            id,
            title,
            author,
            description,
            sourceUrl,
            metadataURI,
            creator,
            creationTime: Number(creationTime) * 1000,
          });
        }
      } catch (err: any) {
        console.error("Error fetching Evermark:", err);
        if (isMounted) {
          setError(err.message || "Failed to load Evermark details");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchEvermarkDetail();

    return () => {
      isMounted = false;
    };
  }, [id, contract]); // Dependencies: id and memoized contract

  return { evermark, isLoading, error };
}

export function useUserEvermarks(userAddress?: string) {
  const [evermarks, setEvermarks] = useState<Evermark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoize contract instance
  const contract = useMemo(() => getContract({
    client,
    chain: CHAIN,
    address: CONTRACTS.EVERMARK_NFT,
    abi: EVERMARK_NFT_ABI,
  }), []);

  useEffect(() => {
    let isMounted = true;

    const fetchUserEvermarks = async () => {
      if (!userAddress) {
        if (isMounted) {
          setEvermarks([]);
          setIsLoading(false);
        }
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Get balance of user
        const balance = await readContract({
          contract,
          method: "balanceOf",
          params: [userAddress],
        });

        if (Number(balance) === 0) {
          if (isMounted) {
            setEvermarks([]);
            setIsLoading(false);
          }
          return;
        }

        // Get total supply to know the range we need to check
        const totalSupply = await readContract({
          contract,
          method: "totalSupply",
          params: [],
        });

        const userEvermarks: Evermark[] = [];

        // Loop through all token IDs and check ownership
        for (let i = 1; i <= Number(totalSupply) && isMounted; i++) {
          try {
            // Check if token exists
            const exists = await readContract({
              contract,
              method: "exists",
              params: [BigInt(i)],
            });

            if (!exists) continue;

            try {
              // Get token owner
              const owner = await readContract({
                contract,
                method: "ownerOf",
                params: [BigInt(i)],
              });

              // Skip if not owned by user
              if (owner.toLowerCase() !== userAddress.toLowerCase()) continue;

              // Get metadata
              const [title, author, metadataURI] = await readContract({
                contract,
                method: "getBookmarkMetadata",
                params: [BigInt(i)],
              });

              // Get creator
              const creator = await readContract({
                contract,
                method: "getBookmarkCreator",
                params: [BigInt(i)],
              });

              // Get creation time
              const creationTime = await readContract({
                contract,
                method: "getBookmarkCreationTime",
                params: [BigInt(i)],
              });

              // Add to user's evermarks
              userEvermarks.push({
                id: i.toString(),
                title,
                author,
                metadataURI,
                creator,
                creationTime: Number(creationTime) * 1000,
              });

              // If we found all of the user's tokens, we can stop
              if (userEvermarks.length >= Number(balance)) {
                break;
              }
            } catch (err) {
              console.error(`Error checking ownership for token ${i}:`, err);
              // Continue to next token
            }
          } catch (err) {
            console.error(`Error checking if token ${i} exists:`, err);
          }
        }

        if (isMounted) {
          setEvermarks(userEvermarks);
        }
      } catch (err: any) {
        console.error("Error fetching user evermarks:", err);
        if (isMounted) {
          setError(err.message || "Failed to load your Evermarks");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchUserEvermarks();

    return () => {
      isMounted = false;
    };
  }, [userAddress, contract]); // Dependencies: userAddress and memoized contract

  return { evermarks, isLoading, error };
}