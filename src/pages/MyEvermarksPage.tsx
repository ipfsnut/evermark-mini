import React from 'react';
import { useActiveAccount } from "thirdweb/react";
import { BookmarkIcon, PlusIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import { useUserEvermarks } from '../hooks/useEvermarks';

const MyEvermarksPage: React.FC = () => {
  const account = useActiveAccount();
  const { evermarks, isLoading, error } = useUserEvermarks(account?.address);

  return (
    <PageContainer title="My Collection">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-gray-600">Your personal library of Evermarks</p>
          <Link
            to="/create"
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Add New
          </Link>
        </div>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        ) : error ? (
          <div className="bg-white rounded-lg shadow-sm p-6 border border-red-200">
            <div className="text-center py-4">
              <p className="text-red-600">Error: {error}</p>
            </div>
          </div>
        ) : evermarks.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="text-center py-12">
              <BookmarkIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Evermarks Yet</h3>
              <p className="text-gray-600">Start building your collection by creating your first Evermark</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {evermarks.map(evermark => (
              <Link 
                key={evermark.id} 
                to={`/evermark/${evermark.id}`}
                className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow"
              >
                <h3 className="font-medium text-gray-900 mb-2">{evermark.title}</h3>
                <p className="text-sm text-gray-600 mb-4">by {evermark.author}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(evermark.creationTime).toLocaleDateString()}
                  </span>
                  <BookmarkIcon className="h-4 w-4 text-purple-600" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default MyEvermarksPage;
