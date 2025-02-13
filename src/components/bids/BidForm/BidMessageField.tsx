import React from 'react';

interface BidMessageFieldProps {
  message: string;
  onChange: (message: string) => void;
}

export const BidMessageField: React.FC<BidMessageFieldProps> = ({ message, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">Message (Optional)</label>
      <textarea
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
        value={message}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};