import React, { useState } from 'react';
import { googleShoppingService } from '../../services/shopping/googleShoppingService';
import { SearchResult } from '../../types/search';
import { formatCurrency } from '../../utils/formatters';

export const GoogleShoppingTest: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    results: SearchResult[];
    priceAnalysis?: any;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await googleShoppingService.searchProducts(query);
      setResults(searchResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search products');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="flex-1 px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-md">
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-6">
          {/* Price Analysis */}
          {results.priceAnalysis && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900 rounded-md">
              <h2 className="font-semibold mb-2 text-gray-900 dark:text-white">Price Analysis</h2>
              <p className="text-gray-700 dark:text-gray-300">
                Suggested Range: {formatCurrency(results.priceAnalysis.suggestedRange.minPrice)} - {formatCurrency(results.priceAnalysis.suggestedRange.maxPrice)}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Market Price: {formatCurrency(results.priceAnalysis.suggestedRange.marketPrice)}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Confidence: {results.priceAnalysis.confidence}
              </p>
              <p className="text-gray-700 dark:text-gray-300">
                Based on {results.priceAnalysis.basedOn} items
              </p>
            </div>
          )}

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.results.map((result, index) => (
              <div key={index} className="border rounded-lg overflow-hidden bg-white dark:bg-gray-800">
                {result.imageUrl && (
                  <div className="h-48 bg-gray-100 dark:bg-gray-700">
                    <img 
                      src={result.imageUrl} 
                      alt={result.title}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">{result.title}</h3>
                  {result.price && (
                    <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};