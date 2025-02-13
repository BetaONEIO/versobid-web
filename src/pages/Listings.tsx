import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { SearchBar } from '../components/ui/SearchBar';
import { useListings } from '../hooks/useListings';
import { useUser } from '../contexts/UserContext';
import { formatCurrency } from '../utils/formatters';
import { googleShoppingService } from '../services/shopping/googleShoppingService';
import { SearchResult } from '../types/search';

export const Listings: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search');
  const { listings, loading, error } = useListings();
  const { role } = useUser();
  const [searchResults, setSearchResults] = useState<{
    results: SearchResult[];
    priceAnalysis?: any;
  } | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery) {
        setSearching(true);
        try {
          const results = await googleShoppingService.searchProducts(searchQuery);
          setSearchResults(results);
        } catch (err) {
          console.error('Search error:', err);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults(null);
      }
    };

    performSearch();
  }, [searchQuery]);

  if (loading || searching) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900 p-4 rounded-lg">
          <p className="text-red-600 dark:text-red-200">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <SearchBar />
      </div>

      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col space-y-4">
          <h1 className="text-2xl font-bold">
            {searchQuery 
              ? `Search Results for "${searchQuery}"` 
              : role === 'buyer' 
                ? 'My Listings'
                : 'Current active items'}
          </h1>
          
          {role === 'buyer' && (
            <div>
              <Link
                to="/items/add"
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                Add New Item
              </Link>
            </div>
          )}
        </div>

        {/* Price Analysis */}
        {searchResults?.priceAnalysis && (
          <div className="mb-8 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Market Price Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Suggested Range:</p>
                <p className="font-medium">
                  {formatCurrency(searchResults.priceAnalysis.suggestedRange.minPrice)} - {formatCurrency(searchResults.priceAnalysis.suggestedRange.maxPrice)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Average Market Price:</p>
                <p className="font-medium">{formatCurrency(searchResults.priceAnalysis.suggestedRange.marketPrice)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Based on:</p>
                <p className="font-medium">{searchResults.priceAnalysis.basedOn} similar items</p>
              </div>
            </div>
          </div>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults ? (
            // Show search results
            searchResults.results.map((result, index) => (
              <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                {result.imageUrl && (
                  <div className="h-48 bg-gray-100 dark:bg-gray-700">
                    <img 
                      src={result.imageUrl} 
                      alt={result.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{result.title}</h3>
                  {result.price && (
                    <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                      {formatCurrency(result.price)}
                    </p>
                  )}
                  {result.brand && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Brand: {result.brand}
                    </p>
                  )}
                  {result.condition && (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Condition: {result.condition}
                    </p>
                  )}
                  {result.shortDescription && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                      {result.shortDescription}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            // Show user's listings
            listings.map((listing) => (
              <Link 
                key={listing.id} 
                to={`/listings/${listing.id}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold">{listing.title}</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {listing.category}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                    {listing.description}
                  </p>
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Budget:</span>
                      <span className="ml-2 text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(listing.minPrice)} - {formatCurrency(listing.maxPrice)}
                      </span>
                    </div>
                    {listing.seller_username && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Posted by: {listing.seller_username}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
};