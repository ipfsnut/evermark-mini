import React from 'react';
import { Link } from 'react-router-dom';
import { BookmarkIcon, UserIcon, CalendarIcon, ExternalLinkIcon } from 'lucide-react';
import { Evermark } from '../../hooks/useEvermarks';

interface EvermarkCardProps {
  evermark: Evermark;
  isCompact?: boolean;
}

export function EvermarkCard({ evermark, isCompact = false }: EvermarkCardProps) {
  const { id, title, author, description, creator, creationTime } = evermark;
  
  // Format relative time
  const getRelativeTime = (timestamp: number) => {
    const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
    const daysDiff = Math.round((timestamp - Date.now()) / (1000 * 60 * 60 * 24));
    return rtf.format(daysDiff, 'day');
  };
  
  if (isCompact) {
    return (
      <Link to={`/evermark/${id}`} className="block">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:border-purple-300 transition-colors p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-gray-900 truncate" title={title}>
              {title}
            </h3>
            <span className="text-xs text-gray-500">{getRelativeTime(creationTime)}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <UserIcon className="h-3 w-3 mr-1" />
            <span>{author}</span>
          </div>
        </div>
      </Link>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-serif font-semibold text-gray-900 mb-2">
            <Link to={`/evermark/${id}`} className="hover:text-purple-600 transition-colors">
              {title}
            </Link>
          </h3>
          <div className="bg-purple-100 rounded-full p-2">
            <BookmarkIcon className="h-5 w-5 text-purple-600" />
          </div>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <UserIcon className="h-4 w-4 mr-1" />
          <span className="mr-4">{author}</span>
          <CalendarIcon className="h-4 w-4 mr-1" />
          <span>{getRelativeTime(creationTime)}</span>
        </div>
        
        <p className="text-gray-700 mb-4 line-clamp-3">
          {description}
        </p>
        
        <div className="flex justify-between items-center">
          <Link 
            to={`/evermark/${id}`}
            className="text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            View Details
          </Link>
          
          <div className="text-xs text-gray-500 flex items-center">
            <span className="hidden sm:inline">ID: {id}</span>
          </div>
        </div>
      </div>
    </div>
  );
}