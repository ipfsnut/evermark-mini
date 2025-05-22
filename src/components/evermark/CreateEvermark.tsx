import React, { useState } from "react";
import { useSendTransaction } from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { client } from "../../lib/thirdweb";
import { CONTRACTS, EVERMARK_NFT_ABI, CHAIN } from "../../lib/contracts";

export function CreateEvermark() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  
  // Get contract instance
  const contract = getContract({
    client,
    chain: CHAIN,
    address: CONTRACTS.EVERMARK_NFT,
    abi: EVERMARK_NFT_ABI,
  });
  
  // Send transaction hook
  const { mutate: sendTransaction, isPending } = useSendTransaction();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare metadata
      const metadata = {
        name: title,
        description,
        external_url: sourceUrl,
      };
      
      // Prepare contract call
      const transaction = prepareContractCall({
        contract,
        method: "function mint(address to, string memory uri) public",
        params: [/* user address */, JSON.stringify(metadata)],
      });
      
      // Send transaction
      sendTransaction(transaction);
      
      // Reset form on success
      setTitle("");
      setDescription("");
      setSourceUrl("");
      
    } catch (err) {
      console.error("Error creating evermark:", err);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block mb-1">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      
      <div>
        <label className="block mb-1">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 border rounded"
          rows={4}
        />
      </div>
      
      <div>
        <label className="block mb-1">Source URL</label>
        <input
          type="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>
      
      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 bg-purple-600 text-white rounded disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Create Evermark"}
      </button>
    </form>
  );
}