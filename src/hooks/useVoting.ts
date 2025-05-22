import { useReadContract, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { client } from "../lib/thirdweb";
import { CHAIN, CONTRACTS, VOTING_ABI, CARD_CATALOG_ABI } from "../lib/contracts";
import { useState, useEffect } from "react";
import { toEther, toWei } from "thirdweb/utils";

// Make sure we're properly fetching voting data
export function useActiveVoters() {
  const [activeVoters, setActiveVoters] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  
  const catalogContract = getContract({
    client,
    chain: CHAIN,
    address: CONTRACTS.CARD_CATALOG,
    abi: CARD_CATALOG_ABI,
  });
  
  // Get total supply of wrapped tokens as a proxy for active voters
  const { data: totalWrapped } = useReadContract({
    contract: catalogContract,
    method: "totalSupply",
    params: [],
  });
  
  useEffect(() => {
    if (totalWrapped !== undefined) {
      // Set the real number of wrapped tokens (active voters)
      setActiveVoters(Number(totalWrapped));
      setIsLoading(false);
    }
  }, [totalWrapped]);
  
  return { activeVoters, isLoading };
}

export function useVoting(evermarkId: string, userAddress?: string) {
  const [isVoting, setIsVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const votingContract = getContract({
    client,
    chain: CHAIN,
    address: CONTRACTS.VOTING,
    abi: VOTING_ABI,
  });
  
  const catalogContract = getContract({
    client,
    chain: CHAIN,
    address: CONTRACTS.CARD_CATALOG,
    abi: CARD_CATALOG_ABI,
  });
  
  // Get total votes for this Evermark
  const { data: totalVotes, isLoading: isLoadingTotalVotes } = useReadContract({
    contract: votingContract,
    method: "getBookmarkVotes",
    params: [BigInt(evermarkId)],
  });
  
  // Get user votes for this Evermark
  const userVotesQuery = userAddress ? useReadContract({
    contract: votingContract,
    method: "getUserVotesForBookmark",
    params: [userAddress, BigInt(evermarkId)] as const,
  }) : { data: undefined, isLoading: false };
  
  const userVotes = userVotesQuery.data;
  const isLoadingUserVotes = 'isLoading' in userVotesQuery ? userVotesQuery.isLoading : false;
  
  // Get user's available voting power
  const votingPowerQuery = userAddress ? useReadContract({
    contract: catalogContract,
    method: "getAvailableVotingPower",
    params: [userAddress] as const,
  }) : { data: undefined, isLoading: false };
  
  const availableVotingPower = votingPowerQuery.data;
  const isLoadingVotingPower = 'isLoading' in votingPowerQuery ? votingPowerQuery.isLoading : false;
  
  const { mutate: sendTransaction } = useSendTransaction();
  
  // Function to delegate votes
  const delegateVotes = async (amount: string) => {
    if (!userAddress) {
      setError("Please connect your wallet");
      return { success: false, error: "Please connect your wallet" };
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid vote amount");
      return { success: false, error: "Please enter a valid vote amount" };
    }
    
    const voteAmountWei = toWei(amount);
    
    // Check if user has enough voting power
    if (availableVotingPower && voteAmountWei > availableVotingPower) {
      const errorMsg = `Insufficient voting power. Available: ${toEther(availableVotingPower)} NSI`;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    setIsVoting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const transaction = prepareContractCall({
        contract: votingContract,
        method: "delegateVotes",
        params: [BigInt(evermarkId), voteAmountWei] as const,
      });
      
      await sendTransaction(transaction as any);
      
      const successMsg = `Successfully delegated ${amount} NSI to this Evermark!`;
      setSuccess(successMsg);
      return { success: true, message: successMsg };
    } catch (err: any) {
      console.error("Error delegating votes:", err);
      const errorMsg = err.message || "Failed to delegate votes";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsVoting(false);
    }
  };
  
  // Function to undelegate votes
  const undelegateVotes = async (amount: string) => {
    if (!userAddress || !userVotes || userVotes === BigInt(0)) {
      const errorMsg = "No votes to withdraw";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      const errorMsg = "Please enter a valid amount to withdraw";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    const withdrawAmountWei = toWei(amount);
    
    if (withdrawAmountWei > userVotes) {
      const errorMsg = `Cannot withdraw more than delegated. Your delegation: ${toEther(userVotes)} NSI`;
      setError(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    setIsVoting(true);
    setError(null);
    setSuccess(null);
    
    try {
      const transaction = prepareContractCall({
        contract: votingContract,
        method: "undelegateVotes",
        params: [BigInt(evermarkId), withdrawAmountWei] as const,
      });
      
      await sendTransaction(transaction as any);
      
      const successMsg = `Successfully withdrew ${amount} NSI from this Evermark!`;
      setSuccess(successMsg);
      return { success: true, message: successMsg };
    } catch (err: any) {
      console.error("Error undelegating votes:", err);
      const errorMsg = err.message || "Failed to undelegate votes";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsVoting(false);
    }
  };
  
  // Clear messages after 5 seconds
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };
  
  return {
    totalVotes,
    userVotes,
    availableVotingPower,
    isLoadingTotalVotes,
    isLoadingUserVotes,
    isLoadingVotingPower,
    isVoting,
    error,
    success,
    delegateVotes,
    undelegateVotes,
    clearMessages,
  };
}