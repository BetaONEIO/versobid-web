import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { ReCaptchaProps } from './types';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export const ReCaptcha: React.FC<ReCaptchaProps> = ({ onChange, error }) => {
  if (!RECAPTCHA_SITE_KEY) {
    console.error('ReCAPTCHA site key is not configured');
    return null;
  }

  return (
    <div className="space-y-2">
      <ReCAPTCHA
        sitekey={RECAPTCHA_SITE_KEY}
        onChange={onChange}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};