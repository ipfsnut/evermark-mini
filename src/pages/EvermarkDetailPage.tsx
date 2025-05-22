import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, BookOpenIcon } from 'lucide-react';

const EvermarkDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <Link 
          to="/" 
          className="inline-flex items-center text-sm text-gray-600 hover:text-purple-600 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-1" />
          Back to Home
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="text-center py-12">
          <BookOpenIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h1 className="text-xl font-serif font-bold text-gray-900 mb-2">
            Evermark Detail Page
          </h1>
          <p className="text-gray-600">Evermark ID: {id}</p>
          <p className="text-sm text-gray-500 mt-2">Detail view coming soon...</p>
        </div>
      </div>
    </div>
  );
};

export default EvermarkDetailPage;