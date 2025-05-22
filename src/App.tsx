// src/App.tsx
import { sdk } from "@farcaster/frame-sdk";
import { useEffect } from "react";
import { Routes, Route } from 'react-router-dom';
import { useActiveAccount } from "thirdweb/react";

// Import pages
import HomePage from './pages/HomePage';
import CreateEvermarkPage from './pages/CreateEvermarkPage';
import EvermarkDetailPage from './pages/EvermarkDetailPage';
import MyEvermarksPage from './pages/MyEvermarksPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import AuctionPage from './pages/AuctionPage';

// Import components
import { WalletConnect } from './components/ConnectButton';
import { Layout } from './components/layout/Layout';

function App() {
  const account = useActiveAccount();
  const isConnected = !!account;

  useEffect(() => {
    sdk.actions.ready();
  }, []);

  return (
    <Layout>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/evermark/:id" element={<EvermarkDetailPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/auctions" element={<AuctionPage />} />
        
        {/* Protected Routes */}
        {isConnected ? (
          <>
            <Route path="/create" element={<CreateEvermarkPage />} />
            <Route path="/my-evermarks" element={<MyEvermarksPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </>
        ) : (
          <>
            <Route path="/create" element={<ConnectPrompt />} />
            <Route path="/my-evermarks" element={<ConnectPrompt />} />
            <Route path="/profile" element={<ConnectPrompt />} />
          </>
        )}
        
        {/* Fallback */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

// Simple connect prompt component
function ConnectPrompt() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] bg-gray-50 rounded-lg">
      <h2 className="text-xl font-serif mb-4">Connect Your Wallet</h2>
      <p className="text-gray-600 mb-6">Please connect your wallet to access this feature</p>
      <WalletConnect />
    </div>
  );
}

// 404 page component
function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <h2 className="text-2xl font-serif mb-4">Page Not Found</h2>
      <p className="text-gray-600">The page you're looking for doesn't exist.</p>
    </div>
  );
}

export default App;