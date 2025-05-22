import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrophyIcon, BookOpenIcon, UserIcon, CalendarIcon } from 'lucide-react';
import { getContract, readContract } from "thirdweb";
import { client } from "../lib/thirdweb";
import { CHAIN, CONTRACTS, LEADERBOARD_ABI, VOTING_ABI, EVERMARK_NFT_ABI } from "../lib/contracts";
import { useReadContract } from "thirdweb/react";

interface BookmarkRank {
  tokenId: bigint;
  votes: bigint;
  rank: bigint;
  title?: string;
  author?: string;
  creator?: string;
}

const LeaderboardPage: React.FC = () => {
  const [topBookmarks, setTopBookmarks] = useState<BookmarkRank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Get current cycle from voting contract
  const votingContract = getContract({
    client,
    chain: CHAIN,
    address: CONTRACTS.VOTING,
    abi: VOTING_ABI,
  });
  
  const { data: currentCycle } = useReadContract({
    contract: votingContract,
    method: "getCurrentCycle",
    params: [],
  });
  
  // Get previous week for finalized leaderboard
  const previousWeek = currentCycle ? Number(currentCycle) - 1 : 0;
  
  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (previousWeek <= 0) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        const leaderboardContract = getContract({
          client,
          chain: CHAIN,
          address: CONTRACTS.LEADERBOARD,
          abi: LEADERBOARD_ABI,
        });
        
        // Get top bookmarks for the previous week
        const leaderboardData = await readContract({
          contract: leaderboardContract,
          method: "getWeeklyTopBookmarks",
          params: [BigInt(previousWeek), BigInt(10)], // Get top 10
        });
        
        // Enhance with metadata
        const evermarkContract = getContract({
          client,
          chain: CHAIN,
          address: CONTRACTS.EVERMARK_NFT,
          abi: EVERMARK_NFT_ABI,
        });
        
        const enhancedData = await Promise.all(
          leaderboardData.map(async (bookmark: BookmarkRank) => {
            try {
              // Get metadata
              const [title, author] = await readContract({
                contract: evermarkContract,
                method: "getBookmarkMetadata",
                params: [bookmark.tokenId],
              });
              
              // Get creator
              const creator = await readContract({
                contract: evermarkContract,
                method: "getBookmarkCreator",
                params: [bookmark.tokenId],
              });
              
              return {
                ...bookmark,
                title,
                author,
                creator
              };
            } catch (err) {
              console.error(`Error fetching metadata for token ${bookmark.tokenId}:`, err);
              return bookmark;
            }
          })
        );
        
        setTopBookmarks(enhancedData);
      } catch (err: any) {
        console.error("Error fetching leaderboard:", err);
        setError(err.message || "Failed to load leaderboard");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchLeaderboard();
  }, [previousWeek]);
  
  return (
    <div className="space-y-6">
      <div className="text-center">
        <TrophyIcon className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-serif font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-600">Top-voted content in the community</p>
        {previousWeek > 0 && (
          <p className="mt-2 text-sm text-purple-600">Week {previousWeek} Results</p>
        )}
      </div>

      {isLoading ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      ) : error ? (
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <p className="text-red-600">{error}</p>
        </div>
      ) : topBookmarks.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="text-center py-12">
            <TrophyIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Leaderboard Data Yet</h3>
            <p className="text-gray-600">Vote for Evermarks to see them here!</p>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 px-4 py-3 border-b border-gray-200">
            <h2 className="font-medium text-gray-900">Top Voted Evermarks</h2>
          </div>
          
          <div className="divide-y divide-gray-200">
            {topBookmarks.map((bookmark, index) => (
              <Link 
                key={bookmark.tokenId.toString()} 
                to={`/evermark/${bookmark.tokenId.toString()}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="p-4 flex items-center">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                    <span className="font-bold text-yellow-700">{index + 1}</span>
                  </div>
                  <div className="flex-grow min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">{bookmark.title || `Evermark #${bookmark.tokenId}`}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <UserIcon className="h-3 w-3 mr-1" />
                      <span className="truncate">{bookmark.author || "Unknown"}</span>
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-4 text-right">
                    <p className="font-bold text-purple-600">{bookmark.votes.toString()} votes</p>
                    <p className="text-xs text-gray-500">Rank #{bookmark.rank.toString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;