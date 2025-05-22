import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActiveAccount } from "thirdweb/react";
import { PlusIcon, LinkIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react';
import { useEvermarkCreation } from '../hooks/useEvermarkCreation';

const CreateEvermarkPage: React.FC = () => {
  const account = useActiveAccount();
  const navigate = useNavigate();
  const { createEvermark, isCreating, error, success } = useEvermarkCreation();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    sourceUrl: '',
    author: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const result = await createEvermark({
        title: formData.title,
        description: formData.description,
        sourceUrl: formData.sourceUrl,
        author: formData.author
      });
      
      if (result.success) {
        // Reset form
        setFormData({
          title: '',
          description: '',
          sourceUrl: '',
          author: ''
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/my-evermarks');
        }, 2000);
      }
    } catch (error) {
      console.error('Error creating evermark:', error);
    }
  };

  if (!account) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Please connect your wallet to create an Evermark</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {/* Header */}
        <div className="flex items-center mb-6">
          <PlusIcon className="h-8 w-8 text-purple-600 mr-3" />
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-900">Create New Evermark</h1>
            <p className="text-gray-600">Preserve valuable content on the blockchain</p>
          </div>
        </div>
        
        {/* Status Messages */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircleIcon className="h-5 w-5 text-red-600 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Source URL */}
          <div>
            <label htmlFor="sourceUrl" className="block text-sm font-medium text-gray-700 mb-2">
              Source URL
            </label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="url"
                id="sourceUrl"
                name="sourceUrl"
                value={formData.sourceUrl}
                onChange={handleInputChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com/article"
              />
            </div>
          </div>

          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter the title"
            />
          </div>

          {/* Author */}
          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
              Author
            </label>
            <input
              type="text"
              id="author"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Content author"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              placeholder="Why is this content worth preserving?"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isCreating || !formData.title}
            className="w-full flex items-center justify-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <PlusIcon className="h-4 w-4 mr-2" />
                Create Evermark
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEvermarkPage;
