import React, { useState } from "react";
import { useReadContract, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { formatEther, parseEther } from "thirdweb/utils";
import { client } from "../../lib/thirdweb";
import { CONTRACTS, CHAIN } from "../../lib/contracts";

// You'll need to import the AUCTION_ABI from your contracts
const AUCTION_ABI = [
  // Copy ABI from original project
] as const;

export function AuctionCard({ auctionId }: { auctionId: string }) {
  const [bidAmount, setBidAmount] = useState("");
  
  // Get contract instance
  const contract = getContract({
    client,
    chain: CHAIN,
    address: CONTRACTS.AUCTION,
    abi: AUCTION_ABI,
  });
  
  // Read auction details
  const { data: auctionDetails, isLoading } = useReadContract({
    contract,
    method: "function getAuctionDetails(uint256 auctionId) view returns (uint256 tokenId, address seller, uint256 startingPrice, uint256 currentBid, uint256 endTime)",
    params: [BigInt(auctionId)],
  });
  
  // Send transaction hook
  const { mutate: sendTransaction, isPending: isBidding } = useSendTransaction();
  
  const handleBid = async () => {
    if (!bidAmount) return;
    
    try {
      // Prepare bid transaction
      const transaction = prepareContractCall({
        contract,
        method: "function placeBid(uint256 auctionId) public payable",
        params: [BigInt(auctionId)],
        value: parseEther(bidAmount),
      });
      
      // Send transaction
      sendTransaction(transaction);
      
      setBidAmount("");
    } catch (err) {
      console.error("Error placing bid:", err);
    }
  };
  
  if (isLoading) {
    return <div>Loading auction details...</div>;
  }
  
  if (!auctionDetails) {
    return <div>Auction not found</div>;
  }
  
  const [tokenId, seller, startingPrice, currentBid, endTime] = auctionDetails;
  
  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-2">Auction for Evermark #{tokenId.toString()}</h3>
      
      <div className="mb-4 space-y-2">
        <p>Current Bid: {formatEther(currentBid)} ETH</p>
        <p>Seller: {seller.slice(0, 6)}...{seller.slice(-4)}</p>
        <p>Ends: {new Date(Number(endTime) * 1000).toLocaleString()}</p>
      </div>
      
      <div className="flex space-x-2">
        <input
          type="text"
          value={bidAmount}
          onChange={(e) => setBidAmount(e.target.value)}
          className="p-2 border rounded"
          placeholder="Bid amount (ETH)"
        />
        
        <button
          onClick={handleBid}
          disabled={isBidding || !bidAmount}
          className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
        >
          {isBidding ? "Bidding..." : "Place Bid"}
        </button>
      </div>
    </div>
  );
}