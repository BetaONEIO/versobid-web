import React, { useState } from 'react';
import { postcodeService } from '../../../services/postcode/postcodeService';
import { useNotification } from '../../../contexts/NotificationContext';

interface PostcodeLookupProps {
  value: string;
  onChange: (postcode: string) => void;
  onValidated: (isValid: boolean) => void;
  label?: string;
  className?: string;
}

export const PostcodeLookup: React.FC<PostcodeLookupProps> = ({
  value,
  onChange,
  onValidated,
  label = 'Postcode',
  className = ''
}) => {
  const { addNotification } = useNotification();
  const [isValidating, setIsValidating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue);
  };

  const handleBlur = async () => {
    if (!value) return;
    
    setIsValidating(true);
    try {
      const isValid = await postcodeService.validate(value);
      onValidated(isValid);
      
      if (!isValid) {
        addNotification('error', 'Please enter a valid UK postcode');
      } else {
        const details = await postcodeService.lookup(value);
        if (details) {
          onChange(details.postcode); // Use formatted postcode
        }
      }
    } catch (error) {
      addNotification('error', 'Failed to validate postcode');
      onValidated(false);
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm text-gray-600 dark:text-gray-400">
        {label}
      </label>
      <div className="relative mt-1">
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className="block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          placeholder="e.g. SW1A 1AA"
          required
        />
        {isValidating && (
          <div className="absolute right-2 top-2">
            <div className="animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
          </div>
        )}
      </div>
    </div>
  );
};