import React from 'react';
import { ItemPriceFieldsProps } from './types';
import { PriceField } from './PriceField';

export const ItemPriceFields: React.FC<ItemPriceFieldsProps> = ({ formData, onChange }) => {
  return (
    <div className="space-y-4">
      <PriceField
        label="Minimum Price ($)"
        value={formData.minPrice}
        onChange={(value) => onChange('minPrice', value)}
      />
      <PriceField
        label="Maximum Price ($)"
        value={formData.maxPrice}
        onChange={(value) => onChange('maxPrice', value)}
        min={formData.minPrice}
      />
    </div>
  );
};