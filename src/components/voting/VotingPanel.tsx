import React, { useState } from "react";
import { useReadContract, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { client } from "../../lib/thirdweb";
import { CONTRACTS, VOTING_ABI, CHAIN } from "../../lib/contracts";

export function VotingPanel({ evermarkId }: { evermarkId: string }) {
  const [voteAmount, setVoteAmount] = useState("");
  
  // Get contract instance
  const contract = getContract({
    client,
    chain: CHAIN,
    address: CONTRACTS.VOTING,
    abi: VOTING_ABI,
  });
  
  // Read current votes
  const { data: currentVotes, isLoading: isLoadingVotes } = useReadContract({
    contract,
    method: "function getVotes(uint256 tokenId) view returns (uint256)",
    params: [BigInt(evermarkId)],
  });
  
  // Send transaction hook
  const { mutate: sendTransaction, isPending: isVoting } = useSendTransaction();
  
  const handleVote = async () => {
    if (!voteAmount) return;
    
    try {
      // Prepare vote transaction
      const transaction = prepareContractCall({
        contract,
        method: "function vote(uint256 tokenId, uint256 amount) public",
        params: [BigInt(evermarkId), BigInt(voteAmount)],
      });
      
      // Send transaction
      sendTransaction(transaction);
      
      setVoteAmount("");
    } catch (err) {
      console.error("Error voting:", err);
    }
  };
  
  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-bold mb-2">Vote on this Evermark</h3>
      
      <div className="mb-4">
        <p>Current Votes: {isLoadingVotes ? "Loading..." : currentVotes?.toString() || "0"}</p>
      </div>
      
      <div className="flex space-x-2">
        <input
          type="number"
          value={voteAmount}
          onChange={(e) => setVoteAmount(e.target.value)}
          className="p-2 border rounded"
          placeholder="Amount to vote"
        />
        
        <button
          onClick={handleVote}
          disabled={isVoting || !voteAmount}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {isVoting ? "Voting..." : "Vote"}
        </button>
      </div>
    </div>
  );
}