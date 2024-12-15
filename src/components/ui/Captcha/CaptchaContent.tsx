import React, { useEffect } from 'react';
import { useCaptcha } from './useCaptcha';
import { CaptchaProps } from './types';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

export const CaptchaContent: React.FC<CaptchaProps> = ({ onChange, error }) => {
  const { challenge, answer, userAnswer, handleChange, refreshChallenge } = useCaptcha();

  useEffect(() => {
    onChange(parseInt(userAnswer, 10) === answer);
  }, [userAnswer, answer, onChange]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Security Check
      </label>
      <div className="flex items-center space-x-4">
        <div className="flex-1 flex items-center space-x-2">
          <div className="bg-gray-100 dark:bg-gray-700 p-2 rounded text-gray-700 dark:text-gray-300 font-mono">
            {challenge}
          </div>
          <button
            type="button"
            onClick={refreshChallenge}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
          <input
            type="number"
            value={userAnswer}
            onChange={(e) => handleChange(e.target.value)}
            className="block w-24 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white sm:text-sm"
            placeholder="Answer"
          />
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};