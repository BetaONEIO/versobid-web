import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface ItemFormData {
  title: string;
  description: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  duration: number;
}

const categories = [
  'Electronics',
  'Collectibles',
  'Fashion',
  'Home & Garden',
  'Sports',
  'Art',
  'Books',
  'Other'
];

export const AddItemForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ItemFormData>({
    title: '',
    description: '',
    category: categories[0],
    minPrice: 0,
    maxPrice: 0,
    duration: 7,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Calculate median price for sellers
    const medianPrice = (formData.minPrice + formData.maxPrice) / 2;
    // Here you would typically make an API call to save the item
    console.log('Submitting item:', { ...formData, medianPrice });
    // Navigate back to bids page after submission
    navigate('/bids');
  };

  const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: number) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      // Ensure maxPrice is never less than minPrice
      if (field === 'maxPrice' && value < prev.minPrice) {
        newData.maxPrice = prev.minPrice;
      }
      // Ensure minPrice is never more than maxPrice
      if (field === 'minPrice' && value > prev.maxPrice) {
        newData.minPrice = prev.maxPrice;
      }
      return newData;
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Add New Item</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            type="text"
            id="title"
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Category
          </label>
          <select
            id="category"
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Desired Price Range ($)
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="minPrice" className="block text-sm text-gray-500 dark:text-gray-400">
                Minimum Price
              </label>
              <input
                type="number"
                id="minPrice"
                min="0"
                step="0.01"
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                value={formData.minPrice}
                onChange={(e) => handlePriceChange('minPrice', Number(e.target.value))}
              />
            </div>
            <div>
              <label htmlFor="maxPrice" className="block text-sm text-gray-500 dark:text-gray-400">
                Maximum Price
              </label>
              <input
                type="number"
                id="maxPrice"
                min={formData.minPrice}
                step="0.01"
                required
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
                value={formData.maxPrice}
                onChange={(e) => handlePriceChange('maxPrice', Number(e.target.value))}
              />
            </div>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            Sellers will see the median of your price range
          </p>
        </div>

        <div>
          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Auction Duration (days)
          </label>
          <select
            id="duration"
            required
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
          >
            <option value={3}>3 days</option>
            <option value={5}>5 days</option>
            <option value={7}>7 days</option>
            <option value={10}>10 days</option>
            <option value={14}>14 days</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/bids')}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Add Item
          </button>
        </div>
      </form>
    </div>
  );
};