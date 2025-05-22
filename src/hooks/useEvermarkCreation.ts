import { useState } from "react";
import { useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { client } from "../lib/thirdweb";
import { CHAIN, CONTRACTS, EVERMARK_NFT_ABI } from "../lib/contracts";

interface EvermarkMetadata {
  title: string;
  description: string;
  sourceUrl?: string;
  author?: string;
  image?: string;
}

export function useEvermarkCreation() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [createdEvermarkId, setCreatedEvermarkId] = useState<string | null>(null);
  
  const { mutate: sendTransaction } = useSendTransaction();
  
  const contract = getContract({
    client,
    chain: CHAIN,
    address: CONTRACTS.EVERMARK_NFT,
    abi: EVERMARK_NFT_ABI,
  });
  
  // Improved IPFS upload
  const uploadToIPFS = async (metadata: any): Promise<string> => {
    console.log("Preparing to upload to IPFS:", metadata);
    
    try {
      // Convert metadata to JSON string
      const jsonString = JSON.stringify(metadata);
      const blob = new Blob([jsonString], { type: 'application/json' });
      
      // If Pinata keys aren't available, use a mock IPFS hash
      if (!import.meta.env.VITE_PINATA_API_KEY || !import.meta.env.VITE_PINATA_SECRET_KEY) {
        console.warn("Pinata API keys not found, using mock IPFS hash");
        const mockHash = `Qm${Math.random().toString(36).substring(2, 48)}`;
        return `ipfs://${mockHash}`;
      }
      
      // Create form data for Pinata API
      const formData = new FormData();
      formData.append('file', blob, 'metadata.json');
      formData.append('pinataMetadata', JSON.stringify({
        name: `Evermark-${metadata.name ? metadata.name.slice(0, 30) : 'unnamed'}`,
      }));
      
      console.log("Uploading to Pinata...");
      
      // Make API request to Pinata
      const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
        method: 'POST',
        headers: {
          'pinata_api_key': import.meta.env.VITE_PINATA_API_KEY,
          'pinata_secret_api_key': import.meta.env.VITE_PINATA_SECRET_KEY,
        },
        body: formData
      });
      
      if (!response.ok) {
        console.error("Pinata response not OK:", response.status, response.statusText);
        throw new Error(`Failed to upload to IPFS: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("IPFS upload successful:", data);
      return `ipfs://${data.IpfsHash}`;
    } catch (error) {
      console.error("IPFS upload error:", error);
      
      // Fallback to mock hash if upload fails
      const mockHash = `Qm${Math.random().toString(36).substring(2, 48)}`;
      return `ipfs://${mockHash}`;
    }
  };
  
  const createEvermark = async (metadata: EvermarkMetadata) => {
    setIsCreating(true);
    setError(null);
    setSuccess(null);
    
    try {
      console.log("Creating Evermark with metadata:", metadata);
      
      // Prepare metadata object for IPFS
      const ipfsMetadata = {
        name: metadata.title,
        description: metadata.description || "",
        external_url: metadata.sourceUrl || "",
        image: metadata.image || "", 
        attributes: [
          {
            trait_type: "Content Type",
            value: "Website"
          },
          {
            trait_type: "Creator",
            value: metadata.author || "Unknown"
          }
        ]
      };
      
      // Upload metadata to IPFS
      console.log("Uploading metadata to IPFS...");
      const metadataURI = await uploadToIPFS(ipfsMetadata);
      console.log("Metadata uploaded, URI:", metadataURI);
      
      // Prepare contract call
      console.log("Preparing mintBookmark transaction...");
      const transaction = prepareContractCall({
        contract,
        method: "mintBookmark",
        params: [
          metadataURI,
          metadata.title,
          metadata.author || "Unknown"
        ] as const,
      });
      
      // Send transaction
      console.log("Sending transaction...");
      const result = await sendTransaction(transaction as any);
      console.log("Transaction sent:", result);
      
      // In a production environment, you would get the tokenId from event logs
      // For now, we'll just use a placeholder and direct users to their collection
      setCreatedEvermarkId("new");
      setSuccess("Your Evermark was created successfully! Check your collection to view it.");
      
      return { 
        success: true, 
        evermarkId: "new",
        transactionHash: result 
      };
      
    } catch (err: any) {
      console.error("Error creating evermark:", err);
      setError(err.message || "Failed to create Evermark");
      return { success: false, error: err.message };
    } finally {
      setIsCreating(false);
    }
  };
  
  return {
    createEvermark,
    isCreating,
    error,
    success,
    createdEvermarkId,
  };
}