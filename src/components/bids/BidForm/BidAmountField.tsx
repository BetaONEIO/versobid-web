import React from 'react';

interface BidAmountFieldProps {
  amount: number;
  onChange: (amount: number) => void;
}

export const BidAmountField: React.FC<BidAmountFieldProps> = ({ amount, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Your Offer</label>
      <input
        type="number"
        required
        min="0"
        step="0.01"
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        value={amount}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
};