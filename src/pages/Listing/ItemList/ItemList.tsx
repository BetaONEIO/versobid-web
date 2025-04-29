import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";

import { SearchBar } from "../../../components/ui/SearchBar";
import { useListings } from "../../../hooks/useListings";

import { useUser } from "../../../contexts/UserContext";
import { useNotification } from "../../../contexts/NotificationContext";

import { formatCurrency } from "../../../utils/formatters";
import { ebayService } from "../../../services/ebay/ebayService";
import { SearchResult } from "../../../types/search";

import { MockList } from "./mockList";

const ItemList: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");
  // const { listings, loading, error } = useListings(); // berhubungan dengan backend di dalamnya - listing untuk replace mock data
  const { loading, error } = useListings(); // berhubungan dengan backend di dalamnya
  const { role } = useUser();
  const { addNotification } = useNotification();
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const performSearch = async () => {
      if (searchQuery) {
        setSearching(true);
        try {
          // berhubungan dengan backend untuk get search item
          const results = await ebayService.searchItems(searchQuery);
          setSearchResults(results);

          if (results.length === 0) {
            addNotification("info", "No results found for your search");
          }
        } catch (err) {
          console.error("Search error:", err);
          addNotification(
            "error",
            "Failed to perform search. Please try again."
          );
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    };

    performSearch();
  }, [searchQuery, addNotification]);

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
              : role === "buyer"
              ? "My Listings"
              : "Current active items"}
          </h1>

          {role === "buyer" && (
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

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchQuery ? (
            searchResults.length > 0 ? (
              // Show eBay search results
              searchResults.map((result, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                >
                  {result.imageUrl && (
                    <div className="h-48 bg-gray-100 dark:bg-gray-700">
                      <img
                        src={result.imageUrl}
                        alt={result.title}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const img = e.target as HTMLImageElement;
                          img.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">
                      {result.title}
                    </h3>
                    {result.price && (
                      <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(result.price)}
                      </p>
                    )}
                    {result.condition && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Condition: {result.condition}
                      </p>
                    )}
                    {result.shortDescription && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                        {result.shortDescription}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">
                  No results found for "{searchQuery}"
                </p>
              </div>
            )
          ) : (
            // Show user's listings
            MockList.map((listing) => (
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
                  <div className="flex flex-col justify-between items-start">
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Budget:
                      </span>
                      <span className="ml-2 text-lg font-bold text-indigo-600 dark:text-indigo-400">
                        {formatCurrency(listing.minPrice)} -{" "}
                        {formatCurrency(listing.maxPrice)}
                      </span>
                    </div>
                    {listing.sellerUsername && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Posted by: {listing.sellerUsername}
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

export default ItemList;