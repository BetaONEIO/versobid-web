import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useUser } from '../../contexts/UserContext';
import { supabase } from '../../lib/supabase';
import { useNotification } from '../../contexts/NotificationContext';

export const VerificationBanner: React.FC = () => {
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const [isVisible, setIsVisible] = React.useState(true);

  const handleResendVerification = async () => {
    try {
      if (!auth.user?.email) {
        throw new Error('No email address found');
      }

      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: auth.user.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) throw error;
      
      addNotification('success', 'Verification email sent! Please check your inbox.');
    } catch (error) {
      addNotification('error', 'Failed to send verification email. Please try again.');
    }
  };

  if (!auth.isAuthenticated || auth.user?.email_verified || !isVisible) {
    return null;
  }

  return (
    <div className="bg-indigo-600">
      <div className="max-w-7xl mx-auto py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between flex-wrap">
          <div className="w-0 flex-1 flex items-center">
            <span className="flex p-2">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </span>
            <p className="ml-3 font-medium text-white truncate">
              <span>Please verify your email address to access all features</span>
            </p>
          </div>
          <div className="flex-shrink-0 w-full sm:w-auto flex items-center justify-between sm:justify-start">
            <button
              onClick={handleResendVerification}
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50"
            >
              Resend verification email
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="ml-3 flex items-center justify-center p-2 rounded-md hover:bg-indigo-500 focus:outline-none"
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};