import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export const SupabaseConnectionTest: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Ignore data since we're just checking connection
        const { error: queryError } = await supabase
          .from('profiles')
          .select('count')
          .limit(1);

        if (queryError) throw queryError;
        setStatus('connected');
      } catch (err) {
        console.error('Supabase connection error:', err);
        setStatus('error');
        setError(err instanceof Error ? err.message : 'Failed to connect to Supabase');
      }
    };

    checkConnection();
  }, []);

  // Get config URL from env
  const configUrl = import.meta.env.VITE_SUPABASE_URL || 'Not configured';
  const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
      <h2 className="text-lg font-semibold mb-4">Supabase Connection Status</h2>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Status:</span>
          {status === 'checking' && (
            <span className="text-yellow-500">Checking connection...</span>
          )}
          {status === 'connected' && (
            <span className="text-green-500">Connected</span>
          )}
          {status === 'error' && (
            <span className="text-red-500">Connection Error</span>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded">
            {error}
          </div>
        )}

        <div className="text-sm text-gray-600 dark:text-gray-400">
          <p>Configuration:</p>
          <ul className="list-disc list-inside mt-2">
            <li>URL: {configUrl}</li>
            <li>Anonymous Key: {hasKey ? '✓ Set' : '✗ Missing'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
};