import React from 'react';
import { WantedItemForm } from '../components/items/WantedItemForm';

export const AddItem: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <WantedItemForm />
    </div>
  );
};