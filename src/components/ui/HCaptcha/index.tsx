import React, { useEffect, useRef } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { HCaptchaProps } from './types';

const HCAPTCHA_SITE_KEY = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

export const HCaptchaComponent: React.FC<HCaptchaProps> = ({ onChange, error }) => {
  const captchaRef = useRef<HCaptcha>(null);

  useEffect(() => {
    if (!HCAPTCHA_SITE_KEY) {
      console.error('hCaptcha site key is not configured');
    }
  }, []);

  const handleVerify = (token: string) => {
    onChange(token);
  };

  const handleExpire = () => {
    onChange('');
  };

  const handleError = (err: any) => {
    console.error('hCaptcha error:', err);
    onChange('');
  };

  if (!HCAPTCHA_SITE_KEY) {
    return (
      <div className="text-sm text-yellow-600 dark:text-yellow-400">
        Security verification is currently unavailable
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <HCaptcha
        ref={captchaRef}
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