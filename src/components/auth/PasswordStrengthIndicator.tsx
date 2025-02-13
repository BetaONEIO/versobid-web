import React from 'react';
import { getPasswordStrength } from '../../utils/validation';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const { score, requirements } = getPasswordStrength(password);
  const strengthPercentage = (score / requirements.length) * 100;

  const getStrengthColor = () => {
    if (strengthPercentage <= 20) return 'bg-red-500';
    if (strengthPercentage <= 40) return 'bg-orange-500';
    if (strengthPercentage <= 60) return 'bg-yellow-500';
    if (strengthPercentage <= 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="mt-2 space-y-2">
      {/* Progress bar */}
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: `${strengthPercentage}%` }}
        />
      </div>

      {/* Requirements list */}
      <div className="space-y-1">
        {requirements.map((req, index) => (
          <div key={index} className="flex items-center text-sm">
            {req.met ? (
              <CheckIcon className="h-4 w-4 text-green-500 mr-2" />
            ) : (
              <XMarkIcon className="h-4 w-4 text-red-500 mr-2" />
            )}
            <span className={req.met ? 'text-green-700 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}>
              {req.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};