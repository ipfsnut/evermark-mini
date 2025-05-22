import React from 'react';
import { TrophyIcon } from 'lucide-react';

const LeaderboardPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <TrophyIcon className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h1 className="text-2xl font-serif font-bold text-gray-900">Leaderboard</h1>
        <p className="text-gray-600">Top-voted content in the community</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600">The leaderboard will show the most popular Evermarks</p>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;