import React, { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { useNotification } from '../../contexts/NotificationContext';
import { supabase } from '../../lib/supabase';

export const PayPalLinkButton: React.FC = () => {
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const [showForm, setShowForm] = useState(false);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const isLinked = !!auth.user?.paypal_email;

  const handleLinkPayPal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.user?.id || !paypalEmail.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ paypal_email: paypalEmail.trim() })
        .eq('id', auth.user.id);

      if (error) throw error;

      // Update the user context
      window.location.reload(); // Simple reload to refresh user data
      
      addNotification('success', 'PayPal account linked successfully!');
      setShowForm(false);
      setPaypalEmail('');
    } catch (error) {
      console.error('Error linking PayPal:', error);
      addNotification('error', 'Failed to link PayPal account');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkPayPal = async () => {
    if (!auth.user?.id) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ paypal_email: null })
        .eq('id', auth.user.id);

      if (error) throw error;

      window.location.reload(); // Simple reload to refresh user data
      addNotification('success', 'PayPal account unlinked');
    } catch (error) {
      console.error('Error unlinking PayPal:', error);
      addNotification('error', 'Failed to unlink PayPal account');
    } finally {
      setLoading(false);
    }
  };

  if (isLinked) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800 dark:text-green-200">
                PayPal Account Linked
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                {auth.user?.paypal_email}
              </p>
            </div>
          </div>
          <button
            onClick={handleUnlinkPayPal}
            disabled={loading}
            className="text-sm text-green-600 dark:text-green-400 hover:text-green-500 disabled:opacity-50"
          >
            {loading ? 'Unlinking...' : 'Unlink'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
      {!showForm ? (
        <div>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                PayPal Account Required
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                Link your PayPal account to place bids and receive payments
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="ml-4 bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
            >
              Link PayPal
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleLinkPayPal} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-1">
              PayPal Email Address
            </label>
            <input
              type="email"
              value={paypalEmail}
              onChange={(e) => setPaypalEmail(e.target.value)}
              placeholder="your-paypal@email.com"
              required
              className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-600 rounded-md shadow-sm focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 dark:bg-yellow-900/20 dark:text-yellow-100"
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="submit"
              disabled={loading || !paypalEmail.trim()}
              className="bg-yellow-600 text-white px-4 py-2 rounded text-sm hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Linking...' : 'Link Account'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setPaypalEmail('');
              }}
              className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-400 dark:hover:bg-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}; 