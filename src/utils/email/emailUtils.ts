import emailjs from '@emailjs/browser';
import { EMAIL_TEMPLATES } from './templates'

const BASE_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000';
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "noreply@versobid.com"
const TEMPLATE_ID = {
  WELCOME: "versobid_welcomeEmail",
  CONFIRMATION: "versobid_confirmationEmail",
  PASSWORD_RESET: "versobid_passwordResetEmail",
  BID_CONFIRMATION: "versobid_bidConfirmationEmail",
  PAYMENT_CONFIRMATION: "versobid_paymentConfirmationEmail"
}

export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString('en-US', { 
    style: 'currency', 
    currency: 'USD' 
  });
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getAppUrl = (): string => {
  return window.location.origin;
};

export const getCurrentYear = (): number => {
  return new Date().getFullYear();
};

export const generateEmailParams = (params: Record<string, any>): Record<string, any> => {
  return {
    ...params,
    current_year: getCurrentYear()
  };
};

export const sendWelcomeEmail = async (email: string, name: string, verification_link: string) => {
  try {
    await emailjs.send(
      import.meta.env.VITE_EMAILJS_SERVICE_ID,
      TEMPLATE_ID.WELCOME,
      {
        to_email: email,
        to_name: name,
        verification_link: verification_link,
        login_url: BASE_URL + '/signin',
        support_email: SUPPORT_EMAIL,
        current_year: getCurrentYear(),
        message: EMAIL_TEMPLATES.WELCOME
      },
      import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    );
    console.log('Welcome email sent!');
  } catch (err) {
    console.error('Failed to send welcome email:', err);
  }
};
