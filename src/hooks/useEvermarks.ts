import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchEvermarks = async () => {
      try {
        setIsLoading(true);
        
        // Get contract instance
        const contract = getContract({
          client,
          chain: CHAIN,
          address: CONTRACTS.EVERMARK_NFT,
          abi: EVERMARK_NFT_ABI,
        });
        
        // Get total supply
        const totalSupply = await readContract({
          contract,
          method: "totalSupply",
          params: [],
        });
        
        // If no tokens have been minted yet
        if (Number(totalSupply) === 0) {
          setEvermarks([]);
          setIsLoading(false);
          return;
        }
        
        // Fetch the most recent tokens (up to 10)
        const fetchedEvermarks: Evermark[] = [];
        const startId = Number(totalSupply);
        const endId = Math.max(1, startId - 10); // Get up to 10 most recent tokens
        
        for (let i = startId; i >= endId; i--) {
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
        
        setEvermarks(fetchedEvermarks);
      } catch (err: any) {
        console.error("Error fetching evermarks:", err);
        setError(err.message || "Failed to load evermarks");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEvermarks();
  }, []);

  return { evermarks, isLoading, error };
}

export function useEvermarkDetail(id: string) {
  const [evermark, setEvermark] = useState<Evermark | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvermarkDetail = async () => {
      if (!id) {
        setError("Invalid Evermark ID");
        setIsLoading(false);
        return;
      }

      // Handle the "new" ID placeholder case
      if (id === "new") {
        setError("Your Evermark is being created. Please check your collection once the transaction is confirmed.");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const contract = getContract({
          client,
          chain: CHAIN,
          address: CONTRACTS.EVERMARK_NFT,
          abi: EVERMARK_NFT_ABI,
        });

        // Safely convert id to BigInt
        let tokenId;
        try {
          tokenId = BigInt(id);
        } catch (e) {
          setError(`Invalid Evermark ID format: ${id}`);
          setIsLoading(false);
          return;
        }

        // Check if token exists first
        const exists = await readContract({
          contract,
          method: "exists",
          params: [tokenId],
        });

        if (!exists) {
          setError("Evermark not found");
          setIsLoading(false);
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
      } catch (err: any) {
        console.error("Error fetching Evermark:", err);
        setError(err.message || "Failed to load Evermark details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvermarkDetail();
  }, [id]);

  return { evermark, isLoading, error };
}

export function useUserEvermarks(userAddress?: string) {
  const [evermarks, setEvermarks] = useState<Evermark[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserEvermarks = async () => {
      if (!userAddress) {
        setEvermarks([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const contract = getContract({
          client,
          chain: CHAIN,
          address: CONTRACTS.EVERMARK_NFT,
          abi: EVERMARK_NFT_ABI,
        });

        // Get balance of user
        const balance = await readContract({
          contract,
          method: "balanceOf",
          params: [userAddress],
        });

        if (Number(balance) === 0) {
          setEvermarks([]);
          setIsLoading(false);
          return;
        }

        // Get total supply to know the range we need to check
        const totalSupply = await readContract({
          contract,
          method: "totalSupply",
          params: [],
        });

        const userEvermarks: Evermark[] = [];

        // IMPORTANT: Modified approach to handle user's tokens efficiently
        // Loop through all token IDs and check ownership
        for (let i = 1; i <= Number(totalSupply); i++) {
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

              console.log(`Found token ${i} owned by user`);

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

        setEvermarks(userEvermarks);
      } catch (err: any) {
        console.error("Error fetching user evermarks:", err);
        setError(err.message || "Failed to load your Evermarks");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserEvermarks();
  }, [userAddress]);

  return { evermarks, isLoading, error };
}
