import React, { useState } from 'react';
import { googleShoppingService } from '../../services/shopping/googleShoppingService';
import { SearchResult } from '../../types/search';

export const ShoppingTest: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
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
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Shopping Integration Test</h1>
      
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="flex-1 px-4 py-2 border rounded-md"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {results && (
        <div className="space-y-6">
          {/* Price Analysis */}
          {results.priceAnalysis && (
            <div className="p-4 bg-blue-50 rounded-md">
              <h2 className="font-semibold mb-2">Price Analysis</h2>
              <p>Suggested Range: ${results.priceAnalysis.suggestedRange.minPrice} - ${results.priceAnalysis.suggestedRange.maxPrice}</p>
              <p>Market Price: ${results.priceAnalysis.suggestedRange.marketPrice}</p>
              <p>Confidence: {results.priceAnalysis.confidence}</p>
              <p>Based on {results.priceAnalysis.basedOn} items</p>
            </div>
          )}

          {/* Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.results.map((result: SearchResult, index: number) => (
              <div key={index} className="border rounded-lg overflow-hidden bg-white">
                {result.imageUrl && (
                  <img 
                    src={result.imageUrl} 
                    alt={result.title}
                    className="w-full h-48 object-contain bg-gray-50"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold mb-2">{result.title}</h3>
                  {result.price && (
                    <p className="text-lg font-bold text-indigo-600">
                      ${result.price.toFixed(2)}
                    </p>
                  )}
                  {result.brand && (
                    <p className="text-sm text-gray-600">Brand: {result.brand}</p>
                  )}
                  {result.condition && (
                    <p className="text-sm text-gray-600">Condition: {result.condition}</p>
                  )}
                  {result.shortDescription && (
                    <p className="text-sm text-gray-600 mt-2">{result.shortDescription}</p>
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