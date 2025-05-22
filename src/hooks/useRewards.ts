import { useReadContract, useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { client } from "../lib/thirdweb";
import { CHAIN, CONTRACTS, REWARDS_ABI } from "../lib/contracts";
import { useState } from "react";
import { toEther } from "thirdweb/utils";

export function useRewards(userAddress?: string) {
  const [isClaimingRewards, setIsClaimingRewards] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const rewardsContract = getContract({
    client,
    chain: CHAIN,
    address: CONTRACTS.REWARDS,
    abi: REWARDS_ABI,
  });
  
  // Create a conditional hook for pending rewards
  const pendingRewardsQuery = userAddress 
    ? useReadContract({
        contract: rewardsContract,
        method: "getPendingRewards",
        params: [userAddress] as const,
      })
    : { data: undefined, isLoading: false };
  
  // Extract data and loading state
  const pendingRewards = pendingRewardsQuery.data;
  const isLoadingRewards = 'isLoading' in pendingRewardsQuery 
    ? pendingRewardsQuery.isLoading 
    : false;
  
  const { mutate: sendTransaction } = useSendTransaction();
  
  // Function to claim rewards
  const claimRewards = async () => {
    if (!userAddress) {
      setError("Please connect your wallet");
      return { success: false, error: "Please connect your wallet" };
    }
    
    if (!pendingRewards || pendingRewards === BigInt(0)) {
      setError("No rewards to claim");
      return { success: false, error: "No rewards to claim" };
    }
    
    setIsClaimingRewards(true);
    setError(null);
    setSuccess(null);
    
    try {
      const transaction = prepareContractCall({
        contract: rewardsContract,
        method: "claimRewards",
        params: [] as const,
      });
      
      await sendTransaction(transaction as any);
      
      const successMsg = `Successfully claimed ${toEther(pendingRewards)} tokens!`;
      setSuccess(successMsg);
      return { success: true, message: successMsg };
    } catch (err: any) {
      console.error("Error claiming rewards:", err);
      const errorMsg = err.message || "Failed to claim rewards";
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsClaimingRewards(false);
    }
  };
  
  // Clear messages after 5 seconds
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };
  
  return {
    pendingRewards,
    isLoadingRewards,
    isClaimingRewards,
    error,
    success,
    claimRewards,
    clearMessages,
  };
}