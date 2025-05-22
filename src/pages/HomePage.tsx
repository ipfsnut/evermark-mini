// src/pages/HomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useActiveAccount } from "thirdweb/react";
import { PlusIcon, BookOpenIcon, TrendingUpIcon } from 'lucide-react';

const HomePage: React.FC = () => {
  const account = useActiveAccount();
  const isConnected = !!account;

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-16 bg-white rounded-lg shadow-sm">
        <BookOpenIcon className="mx-auto h-16 w-16 text-purple-600 mb-6" />
        <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4">
          Welcome to Evermark
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Preserve and curate your favorite content on the blockchain
        </p>
        
        {isConnected ? (
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/create"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              Create Evermark
            </Link>
            <Link
              to="/my-evermarks"
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <BookOpenIcon className="w-5 h-5 mr-2" />
              My Collection
            </Link>
          </div>
        ) : (
          <div className="text-gray-500">
            Connect your wallet to get started
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <BookOpenIcon className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Evermarks</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <TrendingUpIcon className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Active Voters</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-purple-600 font-bold">$</span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">$0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-serif font-bold text-gray-900 mb-4">Recent Activity</h2>
        <div className="text-center py-8 text-gray-500">
          <BookOpenIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <p>No activity yet. Create your first Evermark to get started!</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;