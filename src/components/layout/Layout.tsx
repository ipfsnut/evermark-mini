// src/components/layout/Layout.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useActiveAccount } from "thirdweb/react";
import { WalletConnect } from '../ConnectButton';
import { 
  HomeIcon, 
  PlusIcon, 
  BookmarkIcon, 
  UserIcon, 
  TrophyIcon,
  DollarSignIcon 
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const account = useActiveAccount();
  const isConnected = !!account;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-xl font-serif font-bold">Evermark</span>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                to="/" 
                className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors"
              >
                <HomeIcon className="w-4 h-4" />
                <span>Home</span>
              </Link>
              
              <Link 
                to="/leaderboard"
                className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors"
              >
                <TrophyIcon className="w-4 h-4" />
                <span>Leaderboard</span>
              </Link>
              
              <Link 
                to="/auctions"
                className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors"
              >
                <DollarSignIcon className="w-4 h-4" />
                <span>Auctions</span>
              </Link>

              {isConnected && (
                <>
                  <Link 
                    to="/create"
                    className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    <PlusIcon className="w-4 h-4" />
                    <span>Create</span>
                  </Link>
                  
                  <Link 
                    to="/my-evermarks"
                    className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    <BookmarkIcon className="w-4 h-4" />
                    <span>My Collection</span>
                  </Link>
                  
                  <Link 
                    to="/profile"
                    className="flex items-center space-x-1 text-gray-700 hover:text-purple-600 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                </>
              )}
            </nav>

            {/* Wallet Connection */}
            <div className="flex items-center">
              <WalletConnect />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2024 Evermark. Built on Base.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}