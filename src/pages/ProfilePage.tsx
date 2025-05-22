import React from 'react';
import { useActiveAccount } from "thirdweb/react";
import { UserIcon, WalletIcon } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const account = useActiveAccount();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Profile</h1>
        <p className="text-gray-600">Manage your account and preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-6">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mr-4">
            <UserIcon className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">User Profile</h2>
            {account && (
              <div className="flex items-center text-sm text-gray-600 mt-1">
                <WalletIcon className="w-4 h-4 mr-1" />
                <span>{account.address.slice(0, 6)}...{account.address.slice(-4)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">Total Evermarks</h3>
            <p className="text-2xl font-bold text-purple-600">0</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">Voting Power</h3>
            <p className="text-2xl font-bold text-green-600">0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;