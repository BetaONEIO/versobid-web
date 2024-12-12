import React from 'react';
import { ItemFormData, ShippingOption } from '../../../types/item';

interface ItemShippingFieldsProps {
  formData: ItemFormData;
  onShippingChange: (shipping_options: ShippingOption[]) => void;
}

export const ItemShippingFields: React.FC<ItemShippingFieldsProps> = ({ formData, onShippingChange }) => {
  const addShippingOption = (type: 'shipping' | 'pickup') => {
    const newOption: ShippingOption = type === 'shipping' 
      ? { type: 'shipping', cost: 0 }
      : { type: 'pickup', location: '' };
    
    onShippingChange([...formData.shipping_options, newOption]);
  };

  const updateShippingOption = (index: number, updates: Partial<ShippingOption>) => {
    const newShipping = [...formData.shipping_options];
    newShipping[index] = { ...newShipping[index], ...updates };
    onShippingChange(newShipping);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Shipping Options</h3>
      
      {formData.shipping_options.map((option: ShippingOption, index: number) => (
        <div key={index} className="border p-4 rounded-md">
          {option.type === 'shipping' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Shipping Cost ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={option.cost}
                onChange={(e) => updateShippingOption(index, { cost: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Pickup Location
              </label>
              <input
                type="text"
                value={option.location}
                onChange={(e) => updateShippingOption(index, { location: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600"
              />
            </div>
          )}
        </div>
      ))}

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => addShippingOption('shipping')}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Add Shipping Option
        </button>
        <button
          type="button"
          onClick={() => addShippingOption('pickup')}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Add Pickup Option
        </button>
      </div>
    </div>
  );
};