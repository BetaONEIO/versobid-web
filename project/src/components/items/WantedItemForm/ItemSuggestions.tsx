import React, { useState, useEffect } from 'react';
import { searchItems } from '../../../services/search/searchService';
import { debounce } from '../../../utils/debounce';

interface ItemSuggestion {
  title: string;
  imageUrl?: string;
  price?: number;
}

interface ItemSuggestionsProps {
  searchTerm: string;
  onSelect: (suggestion: ItemSuggestion) => void;
}

export const ItemSuggestions: React.FC<ItemSuggestionsProps> = ({ searchTerm, onSelect }) => {
  const [suggestions, setSuggestions] = useState<ItemSuggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!searchTerm || searchTerm.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const results = await searchItems(searchTerm);
        setSuggestions(results);
      } catch (error) {
        console.error('Failed to fetch suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const debouncedFetch = debounce(fetchSuggestions, 300);
    debouncedFetch();

    return () => {
      debouncedFetch.cancel();
    };
  }, [searchTerm]);

  if (!searchTerm || searchTerm.length < 3) return null;

  return (
    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg">
      {loading ? (
        <div className="p-4 text-gray-500 dark:text-gray-400">Loading suggestions...</div>
      ) : suggestions.length > 0 ? (
        <ul className="max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
              onClick={() => onSelect(suggestion)}
            >
              {suggestion.imageUrl && (
                <img
                  src={suggestion.imageUrl}
                  alt={suggestion.title}
                  className="w-12 h-12 object-cover rounded mr-3"
                />
              )}
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {suggestion.title}
                </div>
                {suggestion.price && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    ${suggestion.price.toFixed(2)}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-4 text-gray-500 dark:text-gray-400">No suggestions found</div>
      )}
    </div>
  );
};