```tsx
import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useNotification } from '../../contexts/NotificationContext';
import { storageService } from '../../services/storage/storageService';
import { supabase } from '../../lib/supabase';

interface AddCustomResultProps {
  searchQuery: string;
  onClose: () => void;
}

export const AddCustomResult: React.FC<AddCustomResultProps> = ({ searchQuery, onClose }) => {
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const [title, setTitle] = useState(searchQuery);
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('new');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user?.id) return;

    try {
      setUploading(true);

      let imageUrl = '';
      if (selectedImage) {
        imageUrl = await storageService.uploadImage(selectedImage, auth.user.id);
      }

      const { error } = await supabase
        .from('user_added_results')
        .insert({
          user_id: auth.user.id,
          title,
          price: parseFloat(price),
          condition,
          brand,
          description,
          image_url: imageUrl,
          search_query: searchQuery,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      addNotification('success', 'Thank you for adding this item!');
      onClose();
    } catch (error) {
      console.error('Error adding custom result:', error);
      addNotification('error', 'Failed to add item');
    } finally {
      setUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      addNotification('error', 'Image must be less than 5MB');
      return;
    }

    setSelectedImage(file);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">Add New Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Condition</label>
          <select
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value="new">New</option>
            <option value="like-new">Like New</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="poor">Poor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Brand</label>
          <input
            type="text"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border rounded-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {uploading ? 'Adding...' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
};
```