import React from 'react';
import { DollarSignIcon } from 'lucide-react';

const AuctionPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <DollarSignIcon className="mx-auto h-12 w-12 text-green-500 mb-4" />
        <h1 className="text-2xl font-serif font-bold text-gray-900">Auctions</h1>
        <p className="text-gray-600">Buy and sell unique Evermarks</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Auctions</h3>
          <p className="text-gray-600">Auction functionality coming soon</p>
        </div>
      </div>
    </div>
  );
};

export default AuctionPage;