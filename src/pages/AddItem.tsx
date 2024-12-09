import React from 'react';
import { AddItemForm } from '../components/items/AddItemForm';

export const AddItem: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <AddItemForm />
    </div>
  );
};