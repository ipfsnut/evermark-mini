import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import { client } from "../lib/thirdweb";
import { CHAIN, CONTRACTS, LEADERBOARD_ABI, VOTING_ABI } from "../lib/contracts";
import { useState, useEffect } from "react";
import { Evermark } from "./useEvermarks";

export interface LeaderboardEntry {
  evermark: Evermark;
  votes: bigint;
  rank: number;
}

export function useLeaderboard(weekNumber?: number) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get current week by using voting cycle instead of epochs
  const { data: currentCycle } = useReadContract({
    contract: getContract({
      client,
      chain: CHAIN,
      address: CONTRACTS.VOTING,
      abi: VOTING_ABI,
    }),
    method: "getCurrentCycle",
    params: [],
  });
  
  // Use the voting cycle or a reasonable fallback
  const week = weekNumber || (currentCycle ? Number(currentCycle) : 1);
  
  useEffect(() => {
    // Since voting functionality isn't built yet, we'll just return empty data
    console.log("Leaderboard using week:", week);
    setEntries([]);
    setIsLoading(false);
  }, [week]);
  
  return {
    entries,
    isLoading,
    error,
    isFinalized: false,  // Default to false until voting is implemented
    weekNumber: week,
  };
}