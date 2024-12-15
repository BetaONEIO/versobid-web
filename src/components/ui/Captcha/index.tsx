import React from 'react';
import { CaptchaContent } from './CaptchaContent';
import { CaptchaProps } from './types';

export const Captcha: React.FC<CaptchaProps> = (props) => {
  return <CaptchaContent {...props} />;
};