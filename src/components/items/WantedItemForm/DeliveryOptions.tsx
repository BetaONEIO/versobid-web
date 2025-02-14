import React, { useState } from 'react';
import { ShippingOption } from '../../../types/item';

interface DeliveryOptionsProps {
  options: ShippingOption[];
  onChange: (options: ShippingOption[]) => void;
}

export const DeliveryOptions: React.FC<DeliveryOptionsProps> = ({ options, onChange }) => {
  const [selectedOptions, setSelectedOptions] = useState<{
    shipping: boolean;
    collection: boolean;
  }>({
    shipping: options.some(opt => opt.type === 'shipping'),
    collection: options.some(opt => opt.type === 'seller-pickup')
  });

  const handleOptionChange = (type: 'shipping' | 'collection', checked: boolean) => {
    setSelectedOptions(prev => ({ ...prev, [type]: checked }));
    
    let newOptions = [...options];
    
    if (checked) {
      // Add the option if it doesn't exist
      if (type === 'shipping' && !options.some(opt => opt.type === 'shipping')) {
        newOptions.push({
          type: 'shipping',
          cost: 0
        });
      } else if (type === 'collection' && !options.some(opt => opt.type === 'seller-pickup')) {
        newOptions.push({
          type: 'seller-pickup',
          location: {
            postcode: '',
            town: '',
            maxDistance: 15
          }
        });
      }
    } else {
      // Remove the option
      newOptions = newOptions.filter(opt => 
        type === 'shipping' ? opt.type !== 'shipping' : opt.type !== 'seller-pickup'
      );
    }
    
    onChange(newOptions);
  };

  const updateShippingCost = (cost: number) => {
    const newOptions = options.map(opt => 
      opt.type === 'shipping' ? { ...opt, cost } : opt
    );
    onChange(newOptions);
  };

  const shippingOption = options.find(opt => opt.type === 'shipping');

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delivery Preferences</h3>
      
      <div className="space-y-4">
        {/* Shipping Option */}
        <div className="flex flex-col space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedOptions.shipping}
              onChange={(e) => handleOptionChange('shipping', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ship to me
            </span>
          </label>
          
          {selectedOptions.shipping && (
            <div className="ml-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                I'm happy to pay up to:
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">£</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={shippingOption?.cost || ''}
                  onChange={(e) => updateShippingCost(Number(e.target.value))}
                  className="mt-1 block w-full pl-7 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Collection Option */}
        <div className="flex flex-col space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedOptions.collection}
              onChange={(e) => handleOptionChange('collection', e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Collection
            </span>
          </label>
          
          {selectedOptions.collection && (
            <div className="ml-6">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                I am happy to collect the item
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};