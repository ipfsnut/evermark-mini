// src/components/evermark/CreateEvermark.tsx - FIXED ABI VERSION
import React, { useState } from "react";
import { useSendTransaction, useActiveAccount } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { client } from "../../lib/thirdweb";
import { CONTRACT_ADDRESSES, CHAIN } from "../../config/constants";
import { EVERMARK_NFT_ABI } from "../../lib/contracts"; // Import from the original contracts file
import { 
  PlusIcon, 
  LinkIcon, 
  AlertCircleIcon, 
  CheckCircleIcon,
  UploadIcon 
} from 'lucide-react';

interface CreateEvermarkProps {
  onSuccess?: (evermark: any) => void;
  onError?: (error: string) => void;
}

export function CreateEvermark({ onSuccess, onError }: CreateEvermarkProps) {
  const account = useActiveAccount();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [author, setAuthor] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Get contract instance with proper ABI
  const contract = getContract({
    client,
    chain: CHAIN,
    address: CONTRACT_ADDRESSES.BOOKMARK_NFT,
    abi: EVERMARK_NFT_ABI, // This comes from the original contracts file
  });
  
  const { mutate: sendTransaction } = useSendTransaction();
  
  const uploadToIPFS = async (metadata: any): Promise<string> => {
    try {
      // For now, return a mock IPFS URI
      // In production, this would upload to actual IPFS
      const mockHash = `Qm${Math.random().toString(36).substring(2, 48)}`;
      return `ipfs://${mockHash}`;
    } catch (error) {
      throw new Error("Failed to upload metadata to IPFS");
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      const errorMsg = "Please connect your wallet";
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }
    
    if (!title.trim()) {
      const errorMsg = "Title is required";
      setError(errorMsg);
      onError?.(errorMsg);
      return;
    }
    
    setIsCreating(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Prepare metadata object
      const metadata = {
        name: title,
        description: description || "",
        external_url: sourceUrl || "",
        image: "", // Could add image upload later
        attributes: [
          {
            trait_type: "Content Type",
            value: "Website"
          },
          {
            trait_type: "Creator",
            value: author || "Unknown"
          }
        ]
      };
      
      // Upload metadata to IPFS
      const metadataURI = await uploadToIPFS(metadata);
      
      // Prepare contract call using the correct method name from the ABI
      const transaction = prepareContractCall({
        contract,
        method: "mintBookmark", // This should match the ABI exactly
        params: [
          metadataURI,
          title,
          author || "Unknown"
        ],
      });
      
      // Send transaction
      const result = await sendTransaction(transaction);
      
      // Create evermark object for callback
      const createdEvermark = {
        id: `temp-${Date.now()}`, // Temporary ID until we get the real token ID
        title,
        author: author || "Unknown",
        description,
        sourceUrl,
        metadataURI,
        transactionHash: result
      };
      
      setSuccess("Evermark created successfully!");
      onSuccess?.(createdEvermark);
      
      // Reset form
      setTitle("");
      setDescription("");
      setSourceUrl("");
      setAuthor("");
      
    } catch (err: any) {
      console.error("Error creating evermark:", err);
      const errorMsg = err.message || "Failed to create Evermark";
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsCreating(false);
    }
  };
  
  // ... rest of the component remains the same
  
  if (!account) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-8">
          <PlusIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Your Wallet</h3>
          <p className="text-gray-600">Please connect your wallet to create an Evermark</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
          <PlusIcon className="h-6 w-6 text-purple-600" />
        </div>
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Create New Evermark</h1>
          <p className="text-gray-600">Preserve valuable content on the blockchain</p>
        </div>
      </div>
      
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
          </div>
        </div>
      )}
      
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
            onClick={() => {/* handleAutoDetect */}}
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
    </div>
  );
}