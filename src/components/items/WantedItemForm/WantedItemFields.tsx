import React, { useState, useRef } from 'react';
import { ItemFormData } from '../../../types/item';
import { categories } from '../../../utils/constants';
import { googleShoppingService } from '../../../services/shopping/googleShoppingService';
import { SearchResult } from '../../../types/search';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useUser } from '../../../contexts/UserContext';
import { useNotification } from '../../../contexts/NotificationContext';
import { storageService } from '../../../services/storage/storageService';

interface WantedItemFieldsProps {
  formData: ItemFormData;
  onChange: (field: keyof ItemFormData, value: string | number | any[]) => void;
}

export const WantedItemFields: React.FC<WantedItemFieldsProps> = ({ formData, onChange }) => {
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [priceAnalysis, setPriceAnalysis] = useState<any>(null);
  const [searchAttempted, setSearchAttempted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');

  const handleTitleChange = async (value: string) => {
    onChange('title', value);
    if (value.length >= 3) {
      setLoading(true);
      try {
        const results = await googleShoppingService.searchProducts(value);
        setSuggestions(results.results || []);
        setPriceAnalysis(results.priceAnalysis);
        setShowSuggestions(true);
        setSearchAttempted(true);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setLoading(false);
      }
    } else {
      setShowSuggestions(false);
      setSearchAttempted(false);
    }
  };

  const handleSuggestionSelect = (suggestion: SearchResult) => {
    onChange('title', suggestion.title);
    if (suggestion.price) {
      const price = suggestion.price;
      onChange('minPrice', Math.floor(price * 0.9));
      onChange('maxPrice', Math.ceil(price * 1.1));
    }
    if (suggestion.shortDescription) {
      onChange('description', suggestion.shortDescription);
    }
    setShowSuggestions(false);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !auth.user?.id) return;

    if (file.size > 5 * 1024 * 1024) {
      addNotification('error', 'Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);
    setUploadingImage(true);

    try {
      const url = await storageService.uploadImage(file, auth.user.id);
      setImageUrl(url);
      onChange('imageUrl', url);
      addNotification('success', 'Image uploaded successfully');
    } catch (error) {
      addNotification('error', 'Failed to upload image');
      setSelectedImage(null);
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <>
      <div className="relative">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          What are you looking for?
        </label>
        <input
          id="title"
          type="text"
          required
          value={formData.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          placeholder="Start typing to see suggestions..."
        />
        {loading && (
          <div className="absolute right-3 top-9">
            <div className="animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
          </div>
        )}
        
        {/* No Results Message */}
        {searchAttempted && !loading && suggestions.length === 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg p-4">
            <p className="text-gray-600 dark:text-gray-300 text-center">
              Sorry, we can't find that item, but you can still post it!
            </p>
          </div>
        )}

        {/* Search Results */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg">
            <ul className="max-h-60 overflow-auto divide-y divide-gray-200 dark:divide-gray-700">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleSuggestionSelect(suggestion)}
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
                          £{suggestion.price.toFixed(2)}
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
        )}
      </div>

      {/* Image Upload Section */}
      <div className="mt-4">
        <div className="flex items-center space-x-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Upload an Image
          </label>
          <div className="relative group">
            <QuestionMarkCircleIcon className="h-5 w-5 text-gray-400 hover:text-gray-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              If you have an image of the item you're looking for, it may help our sellers identify it
            </div>
          </div>
        </div>
        <div className="mt-1 flex items-center space-x-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 disabled:opacity-50"
          >
            {uploadingImage ? 'Uploading...' : 'Choose Image'}
          </button>
          {selectedImage && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {selectedImage.name}
            </span>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>
        {imageUrl && (
          <div className="mt-2">
            <img
              src={imageUrl}
              alt="Uploaded preview"
              className="h-32 w-32 object-contain rounded-lg border border-gray-200 dark:border-gray-700"
            />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Additional Details
        </label>
        <textarea
          id="description"
          rows={4}
          required
          value={formData.description}
          onChange={(e) => onChange('description', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          placeholder="Specify condition, brand preferences, or any other requirements"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <select
          id="category"
          required
          value={formData.category}
          onChange={(e) => onChange('category', e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {priceAnalysis && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100">Market Price Analysis</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
            Suggested price range: £{priceAnalysis.suggestedRange.minPrice} - £{priceAnalysis.suggestedRange.maxPrice}
          </p>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Based on {priceAnalysis.basedOn} similar items
          </p>
        </div>
      )}
    </>
  );
};