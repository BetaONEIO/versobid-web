import React, { useEffect } from 'react';
import { useReCaptcha } from './useReCaptcha';
import { ReCaptchaProps } from './types';

export const ReCaptcha: React.FC<ReCaptchaProps> = ({ onChange, error }) => {
  const { executeReCaptcha, isLoading, isEnabled } = useReCaptcha();

  useEffect(() => {
    const verifyUser = async () => {
      if (!isEnabled) {
        console.warn('ReCaptcha is not properly configured');
        onChange(false);
        return;
      }

      try {
        const token = await executeReCaptcha('login');
        onChange(!!token);
      } catch (error) {
        console.error('ReCaptcha verification failed:', error);
        onChange(false);
      }
    };

    if (!isLoading) {
      verifyUser();
    }
  }, [executeReCaptcha, onChange, isLoading, isEnabled]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-2">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Verifying...
        </div>
      </div>
    );
  }

  if (!isEnabled) {
    return (
      <div className="text-sm text-yellow-600 dark:text-yellow-400">
        Security verification is currently unavailable
      </div>
    );
  }

  return error ? (
    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
  ) : null;
};