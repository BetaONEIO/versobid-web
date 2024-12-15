import { useState, useCallback, useEffect } from 'react';

declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export const useReCaptcha = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY) {
      console.error('ReCAPTCHA site key is missing');
      setIsLoading(false);
      return;
    }

    // Check if script is already loaded
    if (document.querySelector('script[src*="recaptcha"]')) {
      setScriptLoaded(true);
      setIsLoading(false);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      setScriptLoaded(true);
      window.grecaptcha.ready(() => {
        setIsLoading(false);
      });
    };

    script.onerror = (error) => {
      console.error('Error loading ReCaptcha script:', error);
      setIsLoading(false);
    };

    document.head.appendChild(script);

    return () => {
      // Only remove the script if we added it
      const scriptElement = document.querySelector(`script[src*="recaptcha"]`);
      if (scriptElement && !scriptLoaded) {
        document.head.removeChild(scriptElement);
      }
    };
  }, []);

  const executeReCaptcha = useCallback(async (action: string): Promise<string> => {
    if (!RECAPTCHA_SITE_KEY) {
      throw new Error('ReCAPTCHA site key is not configured');
    }

    if (!scriptLoaded || !window.grecaptcha) {
      throw new Error('ReCAPTCHA script not loaded');
    }

    try {
      const token = await window.grecaptcha.execute(RECAPTCHA_SITE_KEY, { action });
      if (!token) {
        throw new Error('ReCAPTCHA token generation failed');
      }
      return token;
    } catch (error) {
      console.error('ReCaptcha execution error:', error);
      throw error;
    }
  }, [scriptLoaded]);

  return {
    executeReCaptcha,
    isLoading,
    isEnabled: !!RECAPTCHA_SITE_KEY && scriptLoaded
  };
};