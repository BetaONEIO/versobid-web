import React, { useState } from 'react';
import { ShippingType } from '../../../types/item';

interface DeliveryOptionsProps {
  options: ShippingType;
  onChange: (options: ShippingType) => void;
}

export const DeliveryOptions: React.FC<DeliveryOptionsProps> = ({ options, onChange }) => {
  const [selectedOptions, setSelectedOptions] = useState<{
    shipping: boolean;
    collection: boolean;
  }>({
    shipping: options === 'shipping',
    collection: options === 'seller-pickup'
  });

  const handleOptionChange = (type: 'shipping' | 'collection', checked: boolean) => {
    setSelectedOptions(prev => ({ ...prev, [type]: checked }));
    
    if (checked) {
      if (type === 'shipping') {
        onChange('shipping');
      } else if (type === 'collection') {
        onChange('seller-pickup');
      }
    } else {
      // Default to shipping if unchecked
      onChange('shipping');
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Delivery Preferences</h3>
      
      <div className="space-y-4">
        {/* Shipping Option */}
        <div className="flex flex-col space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="deliveryOption"
              checked={selectedOptions.shipping}
              onChange={(e) => handleOptionChange('shipping', e.target.checked)}
              className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Ship to me
            </span>
          </label>
        </div>

        {/* Collection Option */}
        <div className="flex flex-col space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="radio"
              name="deliveryOption"
              checked={selectedOptions.collection}
              onChange={(e) => handleOptionChange('collection', e.target.checked)}
              className="border-gray-300 text-indigo-600 focus:ring-indigo-500"
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