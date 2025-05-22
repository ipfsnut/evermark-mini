import { useReadContract, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall, readContract } from "thirdweb";
import { client } from "../lib/thirdweb";
import { CHAIN, CONTRACTS, AUCTION_ABI } from "../lib/contracts";
import { useState, useEffect, useMemo, useCallback } from "react";
import { toEther, toWei } from "thirdweb/utils";

export interface AuctionDetails {
  auctionId: string;
  tokenId: bigint;
  nftContract: string;
  seller: string;
  startingPrice: bigint;
  reservePrice: bigint;
  currentBid: bigint;
  highestBidder: string;
  startTime: bigint;
  endTime: bigint;
  finalized: boolean;
}

export function useAuctions() {
  const [auctions, setAuctions] = useState<AuctionDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Memoize the contract instance
  const auctionContract = useMemo(() => getContract({
    client,
    chain: CHAIN,
    address: CONTRACTS.AUCTION,
    abi: AUCTION_ABI,
  }), []);
  
  // Get active auctions
  const { data: activeAuctionIds, isLoading: isLoadingIds } = useReadContract({
    contract: auctionContract,
    method: "getActiveAuctions",
    params: [],
  });
  
  // Fetch details for each auction
  useEffect(() => {
    let isMounted = true;

    const fetchAuctionDetails = async () => {
      if (isLoadingIds || !isMounted) {
        return;
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // If no auctions are found from the contract or we're still loading
        if (!activeAuctionIds || activeAuctionIds.length === 0) {
          console.log("No active auctions found from contract");
          if (isMounted) {
            setAuctions([]);
            setIsLoading(false);
          }
          return;
        }
        
        const fetchedAuctions: AuctionDetails[] = [];
        
        // Process real auction data
        for (const auctionId of activeAuctionIds) {
          if (!isMounted) break;
          
          try {
            const details = await readContract({
              contract: auctionContract,
              method: "getAuctionDetails",
              params: [auctionId],
            });
            
            fetchedAuctions.push({
              auctionId: auctionId.toString(),
              ...details,
            } as AuctionDetails);
          } catch (err) {
            console.error(`Error fetching auction ${auctionId}:`, err);
          }
        }
        
        if (isMounted) {
          setAuctions(fetchedAuctions);
        }
      } catch (err: any) {
        console.error("Error fetching auctions:", err);
        if (isMounted) {
          setError(err.message || "Failed to fetch auctions");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    
    fetchAuctionDetails();

    return () => {
      isMounted = false;
    };
  }, [activeAuctionIds, isLoadingIds, auctionContract]);
  
  return {
    auctions,
    isLoading,
    error,
  };
}

export function useAuctionDetails(auctionId: string) {
  const [auction, setAuction] = useState<AuctionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  
  // Memoize the contract instance
  const auctionContract = useMemo(() => getContract({
    client,
    chain: CHAIN,
    address: CONTRACTS.AUCTION,
    abi: AUCTION_ABI,
  }), []);
  
  // Get auction details
  const { data: auctionData, isLoading: isLoadingAuction } = useReadContract({
    contract: auctionContract,
    method: "getAuctionDetails",
    params: [BigInt(auctionId)],
  });
  
  // Update auction data
  useEffect(() => {
    if (!isLoadingAuction && auctionData) {
      setAuction({
        auctionId,
        ...auctionData,
      } as AuctionDetails);
      setIsLoading(false);
      setError(null);
    } else if (!isLoadingAuction && !auctionData) {
      // If no auction is found, set error and null auction
      setError("Auction not found");
      setAuction(null);
      setIsLoading(false);
    }
  }, [auctionData, isLoadingAuction, auctionId]);
  
  // Calculate time remaining - memoize the update function
  const updateTimeRemaining = useCallback(() => {
    if (!auction) return;
    
    const now = Math.floor(Date.now() / 1000);
    const endTime = Number(auction.endTime);
    const remaining = endTime - now;
    
    if (remaining <= 0) {
      setTimeRemaining("Auction ended");
      return;
    }
    
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    
    if (days > 0) {
      setTimeRemaining(`${days}d ${hours}h remaining`);
    } else if (hours > 0) {
      setTimeRemaining(`${hours}h ${minutes}m remaining`);
    } else {
      setTimeRemaining(`${minutes}m remaining`);
    }
  }, [auction]);

  useEffect(() => {
    if (!auction) return;
    
    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [auction, updateTimeRemaining]);
  
  const { mutate: sendTransaction } = useSendTransaction();
  
  // Function to place bid - memoized to prevent recreation
  const placeBid = useCallback(async (bidAmount: string) => {
    if (!auction) {
      return { success: false, error: "Auction not found" };
    }
    
    const bidAmountWei = toWei(bidAmount);
    const minBid = auction.currentBid > BigInt(0) 
      ? auction.currentBid + toWei("0.01") // Minimum increment
      : auction.startingPrice;
    
    if (bidAmountWei < minBid) {
      return { success: false, error: `Bid must be at least ${toEther(minBid)} ETH` };
    }
    
    // Check if auction has ended
    const now = Math.floor(Date.now() / 1000);
    if (Number(auction.endTime) <= now) {
      return { success: false, error: "Auction has ended" };
    }
    
    try {
      const transaction = prepareContractCall({
        contract: auctionContract,
        method: "placeBid",
        params: [BigInt(auctionId)] as const,
        value: bidAmountWei,
      });
      
      await sendTransaction(transaction as any);
      
      return { success: true, message: `Successfully placed bid of ${bidAmount} ETH!` };
    } catch (err: any) {
      console.error("Error placing bid:", err);
      return { success: false, error: err.message || "Failed to place bid" };
    }
  }, [auction, auctionContract, auctionId, sendTransaction]);
  
  return {
    auction,
    isLoading,
    error,
    timeRemaining,
    placeBid,
    isAuctionEnded: auction ? Math.floor(Date.now() / 1000) >= Number(auction.endTime) : false,
    hasActiveBid: auction ? auction.currentBid > BigInt(0) : false,
  };
}