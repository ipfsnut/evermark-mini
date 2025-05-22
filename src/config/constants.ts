// src/config/constants.ts
import { defineChain } from "thirdweb";
import { base } from "thirdweb/chains";

export const CHAIN = base;

// Contract addresses - update these with your actual deployed addresses
export const CONTRACT_ADDRESSES = {
  // UI uses "evermark" terminology, but these point to "bookmark" contracts
  BOOKMARK_NFT: process.env.VITE_BOOKMARK_NFT_ADDRESS as string,
  BOOKMARK_VOTING: process.env.VITE_BOOKMARK_VOTING_ADDRESS as string,
  BOOKMARK_REWARDS: process.env.VITE_BOOKMARK_REWARDS_ADDRESS as string,
  BOOKMARK_AUCTION: process.env.VITE_BOOKMARK_AUCTION_ADDRESS as string,
  BOOKMARK_LEADERBOARD: process.env.VITE_BOOKMARK_LEADERBOARD_ADDRESS as string,
  CARD_CATALOG: process.env.VITE_CARD_CATALOG_ADDRESS as string,
  NSI_TOKEN: process.env.VITE_NSI_TOKEN_ADDRESS as string,
  
  // Keep these for backward compatibility in the UI layer
  EVERMARK_NFT: process.env.VITE_BOOKMARK_NFT_ADDRESS as string,
  VOTING: process.env.VITE_BOOKMARK_VOTING_ADDRESS as string,
  REWARDS: process.env.VITE_BOOKMARK_REWARDS_ADDRESS as string,
  AUCTION: process.env.VITE_BOOKMARK_AUCTION_ADDRESS as string,
  LEADERBOARD: process.env.VITE_BOOKMARK_LEADERBOARD_ADDRESS as string,
};

// Auth constants
export const AUTH_CONSTANTS = {
  SESSION_TOKEN_KEY: 'evermark_session_token',
  SESSION_DURATION_DAYS: 7,
};

// IPFS configuration
export const IPFS_CONFIG = {
  PINATA_API_KEY: process.env.VITE_PINATA_API_KEY as string,
  PINATA_SECRET_KEY: process.env.VITE_PINATA_SECRET_KEY as string,
  GATEWAY_URL: process.env.VITE_PINATA_GATEWAY || 'https://gateway.pinata.cloud',
};

// Network configuration
export const NETWORK_CONFIG = {
  RPC_URL: process.env.VITE_RPC_URL || 'https://mainnet.base.org',
  CHAIN_ID: 8453, // Base Mainnet
};