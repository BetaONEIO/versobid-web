import React from 'react';
import { SearchResult } from '../../types/search';
import { formatCurrency } from '../../utils/formatters';

interface SearchSuggestionsProps {
  suggestions: SearchResult[];
  onSelect: (suggestion: SearchResult) => void;
  loading: boolean;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  onSelect,
  loading
}) => {
  if (loading) {
    return (
      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg">
        <div className="p-4 text-center">
          <div className="animate-spin inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
          <span className="ml-2 text-gray-600 dark:text-gray-300">Searching...</span>
        </div>
      </div>
    );
  }

  if (!suggestions.length) {
    return null;
  }

  return (
    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg">
      <ul className="max-h-60 overflow-auto divide-y divide-gray-200 dark:divide-gray-700">
        {suggestions.map((suggestion, index) => (
          <li
            key={index}
            className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
            onClick={() => onSelect(suggestion)}
          >
            <div className="flex items-start space-x-4">
              {suggestion.imageUrl && (
                <div className="flex-shrink-0">
                  <img
                    src={suggestion.imageUrl}
                    alt={suggestion.title}
                    className="w-16 h-16 object-contain rounded bg-white"
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2">
                  {suggestion.title}
                </p>
                {suggestion.price !== undefined && (
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(suggestion.price)}
                  </p>
                )}
                {suggestion.brand && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Brand: {suggestion.brand}
                  </p>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};