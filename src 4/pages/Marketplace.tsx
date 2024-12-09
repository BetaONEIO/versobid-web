import React from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../stores/store';
import ItemCard from '../components/ItemCard';
import RecentAuctions from '../components/RecentAuctions';
import { useUserContext } from '../context/UserContext';

export default function Marketplace() {
  const navigate = useNavigate();
  const { items } = useStore();
  const { userRole } = useUserContext();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Marketplace</h1>
        {userRole === 'buyer' && (
          <button
            onClick={() => navigate('/create-item')}
            className="flex items-center px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md hover:bg-indigo-700 dark:hover:bg-indigo-600"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Wanted Item
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {items.filter(item => item.status === 'open').map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                userRole={userRole}
                onBid={() => {
                  // Handle bid
                }}
              />
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
          <RecentAuctions />
        </div>
      </div>
    </div>
  );
}