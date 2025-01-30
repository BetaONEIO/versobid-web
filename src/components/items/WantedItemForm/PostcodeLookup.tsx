import React from 'react';

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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value.toUpperCase();
    onChange(newValue);
  };

  const handleBlur = async () => {
    if (!value) return;
    
    // Here you would typically validate the postcode with an API
    // For now, we'll just do basic format validation
    const isValid = /^[A-Z]{1,2}[0-9][A-Z0-9]? ?[0-9][A-Z]{2}$/i.test(value);
    onValidated(isValid);
  };

  return (
    <div className={className}>
      <label className="block text-sm text-gray-600 dark:text-gray-400">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        placeholder="e.g. SW1A 1AA"
        required
      />
    </div>
  );
};