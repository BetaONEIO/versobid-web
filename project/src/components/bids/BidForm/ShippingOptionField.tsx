import React from 'react';
import { ShippingOption } from '../../../types/item';

interface ShippingOptionFieldProps {
  selectedOption: string;
  options: ShippingOption[];
  onChange: (option: string) => void;
}

export const ShippingOptionField: React.FC<ShippingOptionFieldProps> = ({
  selectedOption,
  options,
  onChange
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Shipping Preference</label>
      <select
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        value={selectedOption}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((option) => (
          <option key={option.type} value={option.type}>
            {option.type === 'shipping' 
              ? `Shipping (+$${option.cost})` 
              : `Pickup (${option.location})`}
          </option>
        ))}
      </select>
    </div>
  );
};