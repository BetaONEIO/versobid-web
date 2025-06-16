import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../contexts/UserContext';
import { useNotification } from '../../contexts/NotificationContext';

interface PayPalSettingsProps {
  className?: string;
}

export const PayPalSettings: React.FC<PayPalSettingsProps> = ({ className = '' }) => {
  const { auth } = useUser();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [paypalData, setPaypalData] = useState({
    paypal_email: '',
    paypal_sandbox_email: ''
  });

  useEffect(() => {
    if (auth.user?.id) {
      loadPayPalSettings();
    }
  }, [auth.user?.id]);

  const loadPayPalSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('paypal_email, paypal_sandbox_email')
        .eq('id', auth.user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setPaypalData({
          paypal_email: data.paypal_email || '',
          paypal_sandbox_email: data.paypal_sandbox_email || ''
        });
      }
    } catch (error) {
      console.error('Error loading PayPal settings:', error);
      addNotification('error', 'Failed to load PayPal settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          paypal_email: paypalData.paypal_email || null,
          paypal_sandbox_email: paypalData.paypal_sandbox_email || null
        })
        .eq('id', auth.user?.id);

      if (error) throw error;

      addNotification('success', 'PayPal settings saved successfully');
    } catch (error) {
      console.error('Error saving PayPal settings:', error);
      addNotification('error', 'Failed to save PayPal settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof paypalData, value: string) => {
    setPaypalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          PayPal Settings
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Configure your PayPal account to receive payments when your items are sold.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Production PayPal Email
          </label>
          <input
            type="email"
            value={paypalData.paypal_email}
            onChange={(e) => handleInputChange('paypal_email', e.target.value)}
            placeholder="your-paypal@email.com"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            This email will receive payments in production mode
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sandbox PayPal Email
          </label>
          <input
            type="email"
            value={paypalData.paypal_sandbox_email}
            onChange={(e) => handleInputChange('paypal_sandbox_email', e.target.value)}
            placeholder="sandbox-paypal@email.com"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            This email will receive payments in development/testing mode
          </p>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Important Information
              </h3>
              <div className="mt-2 text-sm text-blue-700 dark:text-blue-300">
                <ul className="list-disc list-inside space-y-1">
                  <li>You must have a verified PayPal account to receive payments</li>
                  <li>Payments will be sent automatically after successful transactions</li>
                  <li>A 3% processing fee will be deducted from your earnings</li>
                  <li>Use sandbox email for testing, production email for live transactions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}; 