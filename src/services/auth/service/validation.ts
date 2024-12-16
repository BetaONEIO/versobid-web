import { AuthFormData } from '../../../types';

export const validateSignupData = (formData: AuthFormData): void => {
  if (!formData.captchaToken) {
    throw new Error('Please complete the security check');
  }

  if (!formData.email || !formData.password || !formData.name || !formData.username) {
    throw new Error('All fields are required');
  }
};