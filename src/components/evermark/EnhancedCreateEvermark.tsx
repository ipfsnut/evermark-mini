import React, { useState } from "react";
import { useWallet } from "../../hooks/useWallet";
import { useEvermarkCreation } from "../../hooks/useEvermarkCreation";
import { 
  PlusIcon, 
  LinkIcon, 
  AlertCircleIcon, 
  CheckCircleIcon,
  UploadIcon,
} from 'lucide-react';
import { useNavigate } from "react-router-dom";
import PageContainer from '../layout/PageContainer';

export function EnhancedCreateEvermark() {
  const navigate = useNavigate();
  const { isConnected } = useWallet();
  const { createEvermark, isCreating, error, success, createdEvermarkId } = useEvermarkCreation();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [author, setAuthor] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }
    
    const result = await createEvermark({
      title,
      description,
      sourceUrl,
      author
    });
    
    if (result.success && result.evermarkId) {
      // Redirect to the collection page after 2 seconds
      setTimeout(() => {
        navigate("/my-evermarks");
      }, 2000);
    }
  };
  
  const handleAutoDetect = async () => {
    if (!sourceUrl) return;
    
    // This would be an actual implementation that scrapes metadata
    // For now, just simulate a delay
    setTimeout(() => {
      if (sourceUrl.includes("example.com")) {
        setTitle("Example Article Title");
        setAuthor("John Doe");
        setDescription("This is an automatically detected description from the provided URL.");
      } else {
        setTitle("Detected Title from " + new URL(sourceUrl).hostname);
        setAuthor("Unknown Author");
      }
    }, 500);
  };
  
  if (!isConnected) {
    return (
      <PageContainer title="Create New Evermark">
        <div className="text-center py-8">
          <PlusIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600">Please connect your wallet to create an Evermark</p>
        </div>
      </PageContainer>
    );
  }
  
  return (
    <PageContainer title="Create New Evermark">
      {/* Status Messages */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircleIcon className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
          <div>
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
          <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
          <div>
            <p className="text-green-700 font-medium">Success!</p>
            <p className="text-green-600 text-sm">{success}</p>
            {createdEvermarkId && (
              <p className="text-green-600 text-sm mt-1">
                Redirecting to your collection...
              </p>
            )}
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Source URL with Auto-Detect */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
            <LinkIcon className="h-4 w-4 mr-2" />
            Source URL (Optional)
          </h3>
          
          <div className="flex gap-3">
            <input
              type="url"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://example.com/article"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={handleAutoDetect}
              disabled={!sourceUrl || isCreating}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Auto-Detect
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-600">
            Enter a URL to auto-detect title, author, and description
          </p>
        </div>
        
        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter the title of this content"
            />
          </div>
          
          {/* Author */}
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <input
              id="author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Who created this content?"
            />
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Briefly describe why this content is worth preserving"
            />
          </div>
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isCreating || !title.trim()}
            className="w-full flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Evermark...
              </>
            ) : (
              <>
                <UploadIcon className="h-5 w-5 mr-2" />
                Create Evermark
              </>
            )}
          </button>
        </form>
      </div>
      
      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="text-sm font-medium text-blue-900 mb-2">Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use descriptive titles that capture the essence of your content</li>
          <li>• Include the original author's name when preserving others' work</li>
          <li>• Add a description explaining why this content is valuable</li>
          <li>• Your Evermark will be permanently stored on the blockchain</li>
        </ul>
      </div>
    </PageContainer>
  );
}