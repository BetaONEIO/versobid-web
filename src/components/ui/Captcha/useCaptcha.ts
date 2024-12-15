import { useState, useCallback } from 'react';
import { generateCaptcha } from '../../../utils/captcha';
import { CaptchaState } from './types';

export const useCaptcha = () => {
  const [state, setState] = useState<CaptchaState>(() => generateCaptcha());

  const refreshChallenge = useCallback(() => {
    setState(generateCaptcha());
  }, []);

  const handleChange = useCallback((value: string) => {
    setState(prev => ({ ...prev, userAnswer: value }));
  }, []);

  return {
    ...state,
    handleChange,
    refreshChallenge
  };
};