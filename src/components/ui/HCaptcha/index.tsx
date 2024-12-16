import React from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { HCaptchaProps } from './types';

const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

export const HCaptchaComponent: React.FC<HCaptchaProps> = ({ onChange, error }) => {
  if (!HCAPTCHA_SITE_KEY) {
    console.error('hCaptcha site key is not configured');
    return null;
  }

  const handleVerify = (token: string) => {
    onChange(token);
  };

  const handleError = () => {
    onChange('');
  };

  const handleExpire = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      <HCaptcha
        sitekey={HCAPTCHA_SITE_KEY}
        onVerify={handleVerify}
        onError={handleError}
        onExpire={handleExpire}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};