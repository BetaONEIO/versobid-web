import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { googleShoppingService } from '../../services/shopping/googleShoppingService';
import { SearchSuggestions } from './SearchSuggestions';
import { SearchResult } from '../../types/search';
import { debounce } from '../../utils/debounce';

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchProducts = debounce(async (searchQuery: string) => {
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const results = await googleShoppingService.searchProducts(
        searchQuery.trim()
      );
      setSuggestions(results?.results || []);
    } catch (error) {
      console.error('Search error:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, 300);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (!showSuggestions) {
      setShowSuggestions(true);
    }

    searchProducts(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedQuery = query.trim();

    if (trimmedQuery) {
      navigate(`/listings?search=${encodeURIComponent(trimmedQuery)}`);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion: SearchResult) => {
    setQuery(suggestion.title);
    navigate(`/listings?search=${encodeURIComponent(suggestion.title)}`);
    setShowSuggestions(false);
  };

  const handleClearSearch = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} className="relative max-w-lg w-full mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search items..."
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 pl-4 pr-20 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            {query && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
                aria-label="Clear search"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400" />
              </button>
            )}
            <button
              type="submit"
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </form>

      {showSuggestions && (
        <SearchSuggestions
          suggestions={suggestions}
          onSelect={handleSuggestionSelect}
          loading={loading}
          searchQuery={query}
        />
      )}
    </div>
  );
};