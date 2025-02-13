import React from 'react';
import { ShippingOption, ShippingType, PickupLocation } from '../../../types/item';

interface ItemShippingFieldsProps {
  options: ShippingOption[];
  onChange: (options: ShippingOption[]) => void;
}

export const ItemShippingFields: React.FC<ItemShippingFieldsProps> = ({ options, onChange }) => {
  const addOption = (type: ShippingType) => {
    const newOption: ShippingOption = {
      type,
      location: type !== 'shipping' ? {
        postcode: '',
        town: '',
        maxDistance: type === 'seller-pickup' ? 15 : undefined
      } : undefined
    };
    onChange([...options, newOption]);
  };

  const updateShippingOption = (index: number, updates: Partial<ShippingOption>) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], ...updates };
    onChange(newOptions);
  };

  const updateLocation = (index: number, field: keyof PickupLocation, value: string | number) => {
    const option = options[index];
    const location = option.location || { postcode: '', town: '' };
    updateShippingOption(index, {
      location: { ...location, [field]: value }
    });
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Shipping Options</h3>
      
      {options.map((option, index) => (
        <div key={index} className="border p-4 rounded-md dark:border-gray-700">
          {option.type === 'shipping' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Shipping Cost ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={option.cost || ''}
                onChange={(e) => updateShippingOption(index, { cost: Number(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Postcode
                  </label>
                  <input
                    type="text"
                    value={option.location?.postcode || ''}
                    onChange={(e) => updateLocation(index, 'postcode', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Town
                  </label>
                  <input
                    type="text"
                    value={option.location?.town || ''}
                    onChange={(e) => updateLocation(index, 'town', e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => addOption('shipping')}
          className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200"
        >
          Add Shipping Option
        </button>
        <button
          type="button"
          onClick={() => addOption('seller-pickup')}
          className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-100 rounded-md hover:bg-indigo-200"
        >
          Add Pickup Option
        </button>
      </div>
    </div>
  );
};