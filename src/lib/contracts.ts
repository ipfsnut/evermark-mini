import { defineChain } from "thirdweb";
import { base } from "thirdweb/chains";

export const CHAIN = base;

export const CONTRACTS = {
  EVERMARK_NFT: import.meta.env.VITE_EVERMARK_NFT_ADDRESS as string,
  VOTING: import.meta.env.VITE_VOTING_ADDRESS as string,
  REWARDS: import.meta.env.VITE_REWARDS_ADDRESS as string,
  AUCTION: import.meta.env.VITE_AUCTION_ADDRESS as string,
  LEADERBOARD: import.meta.env.VITE_LEADERBOARD_ADDRESS as string,
};

// Import ABIs from original project - create these files in src/lib/abis/
export const EVERMARK_NFT_ABI = [
  // Copy ABI from original project
] as const;

export const VOTING_ABI = [
  // Copy ABI from original project
] as const;
