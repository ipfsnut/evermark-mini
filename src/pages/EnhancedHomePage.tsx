import React from 'react';
import { Link } from 'react-router-dom';
import { useActiveAccount } from "thirdweb/react";
import { PlusIcon, BookOpenIcon, TrendingUpIcon, ExternalLinkIcon } from 'lucide-react';
import { useEvermarks } from '../hooks/useEvermarks';
import { useReadContract } from "thirdweb/react";
import { getContract } from "thirdweb";
import { client } from "../lib/thirdweb";
import { CHAIN, CONTRACTS, VOTING_ABI, CARD_CATALOG_ABI } from "../lib/contracts";
import { useAuctions } from '../hooks/useAuctions';
import { formatDistanceToNow, format } from 'date-fns';
import PageContainer from '../components/layout/PageContainer';

const EnhancedHomePage: React.FC = () => {
  const account = useActiveAccount();
  const isConnected = !!account;
  const { evermarks, isLoading } = useEvermarks();
  const { auctions } = useAuctions();
  
  // Get voting stats
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

  // Get total voting power (active voters)
  const catalogContract = getContract({
    client,
    chain: CHAIN,
    address: CONTRACTS.CARD_CATALOG,
    abi: CARD_CATALOG_ABI,
  });
  
  const { data: totalSupply } = useReadContract({
    contract: catalogContract,
    method: "totalSupply",
    params: [],
  });

  // Calculate current week dates for leaderboard
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Set to Sunday
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 6); // Set to Saturday
  
  const weekDisplay = `${format(startOfWeek, 'MMM d')} - ${format(endOfWeek, 'MMM d')}`;

  return (
    <PageContainer fullWidth>
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
                <p className="text-2xl font-bold text-gray-900">
                  {isLoading ? "..." : evermarks.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <TrendingUpIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Current Cycle</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currentCycle ? currentCycle.toString() : "0"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center">
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-purple-600 font-bold">$</span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Auctions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {auctions ? auctions.length : "0"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Evermarks */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-serif font-bold text-gray-900 mb-4">Recent Evermarks</h2>
          
          {isLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          ) : evermarks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>No Evermarks yet. Create your first one to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {evermarks.slice(0, 5).map(evermark => (
                <Link 
                  key={evermark.id} 
                  to={`/evermark/${evermark.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">{evermark.title}</h3>
                      <div className="text-sm text-gray-600 flex items-center gap-2">
                        <span>by {evermark.author}</span>
                        <span className="text-gray-400">•</span>
                        <span>{formatDistanceToNow(new Date(evermark.creationTime), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {evermark.metadataURI && evermark.metadataURI.startsWith('ipfs://') && (
                        <a 
                          href={evermark.metadataURI.replace('ipfs://', 'https://gateway.pinata.cloud/ipfs/')}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 p-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLinkIcon className="h-4 w-4" />
                        </a>
                      )}
                      <BookOpenIcon className="h-5 w-5 text-purple-600" />
                    </div>
                  </div>
                </Link>
              ))}
              
              {evermarks.length > 5 && (
                <div className="text-center pt-2">
                  <Link 
                    to="/explore" 
                    className="inline-flex items-center text-purple-600 hover:text-purple-700"
                  >
                    View All
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};

export default EnhancedHomePage;