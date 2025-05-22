import React from 'react';
import { useActiveAccount } from "thirdweb/react";
import { BookmarkIcon, PlusIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyEvermarksPage: React.FC = () => {
  const account = useActiveAccount();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">My Collection</h1>
          <p className="text-gray-600">Your personal library of Evermarks</p>
        </div>
        <Link
          to="/create"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PlusIcon className="w-4 h-4 mr-2" />
          Add New
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <BookmarkIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Evermarks Yet</h3>
          <p className="text-gray-600">Start building your collection by creating your first Evermark</p>
        </div>
      </div>
    </div>
  );
};

export default MyEvermarksPage;