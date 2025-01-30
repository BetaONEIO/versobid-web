import React from 'react';
import { ShippingOption } from '../../../types/item';
import { PostcodeLookup } from './PostcodeLookup';
import { useUser } from '../../../contexts/UserContext';

interface DeliveryPreferencesProps {
  options: ShippingOption[];
  onChange: (options: ShippingOption[]) => void;
}

export const DeliveryPreferences: React.FC<DeliveryPreferencesProps> = ({ options, onChange }) => {
  const { auth } = useUser();
  const shippingOption = options.find(opt => opt.type === 'shipping');
  const pickupOption = options.find(opt => opt.type === 'seller-pickup');

  const handleShippingToggle = (checked: boolean) => {
    let newOptions = options.filter(opt => opt.type !== 'shipping');
    if (checked) {
      newOptions.push({
        type: 'shipping',
        cost: 0,
        location: { 
          postcode: auth.user?.shipping_address?.postcode || '',
          town: auth.user?.shipping_address?.city || ''
        }
      });
    }
    onChange(newOptions);
  };

  const handlePickupToggle = (checked: boolean) => {
    let newOptions = options.filter(opt => opt.type !== 'seller-pickup');
    if (checked) {
      newOptions.push({
        type: 'seller-pickup',
        location: {
          postcode: auth.user?.shipping_address?.postcode || '',
          town: auth.user?.shipping_address?.city || '',
          maxDistance: 15
        }
      });
    }
    onChange(newOptions);
  };

  const updateShippingDetails = (postcode?: string, town?: string) => {
    const newOptions = options.map(opt => 
      opt.type === 'shipping' 
        ? { 
            ...opt, 
            location: { 
              postcode: postcode ?? opt.location?.postcode ?? '',
              town: town ?? opt.location?.town ?? ''
            }
          }
        : opt
    );
    onChange(newOptions);
  };

  const updatePickupDetails = (postcode?: string, town?: string, maxDistance?: number) => {
    const newOptions = options.map(opt =>
      opt.type === 'seller-pickup'
        ? {
            ...opt,
            location: {
              postcode: postcode ?? opt.location?.postcode ?? '',
              town: town ?? opt.location?.town ?? '',
              maxDistance: maxDistance ?? opt.location?.maxDistance ?? 15
            }
          }
        : opt
    );
    onChange(newOptions);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Delivery Preferences
      </h3>

      <div className="space-y-4">
        {/* Shipping Option */}
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={!!shippingOption}
              onChange={(e) => handleShippingToggle(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Ship to Me
            </span>
          </label>

          {shippingOption && (
            <div className="ml-6 space-y-3">
              <PostcodeLookup
                value={shippingOption.location?.postcode || ''}
                onChange={(postcode) => updateShippingDetails(postcode)}
                onValidated={() => {}}
                label="Delivery Postcode"
              />
            </div>
          )}
        </div>

        {/* Collection Option */}
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={!!pickupOption}
              onChange={(e) => handlePickupToggle(e.target.checked)}
              className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
              Willing to Collect
            </span>
          </label>

          {pickupOption && (
            <div className="ml-6 space-y-3">
              <PostcodeLookup
                value={pickupOption.location?.postcode || ''}
                onChange={(postcode) => updatePickupDetails(postcode)}
                onValidated={() => {}}
                label="Your Postcode"
              />
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400">
                  Maximum Travel Distance (miles)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={pickupOption.location?.maxDistance || 15}
                  onChange={(e) => updatePickupDetails(undefined, undefined, Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};