import React, { useEffect, useState } from 'react';
import { testDatabaseConnection } from '../../services/test/databaseTest';
import { DatabaseTestResult } from '../../services/test/types';

export const DatabaseTest: React.FC = () => {
  const [testResult, setTestResult] = useState<DatabaseTestResult | null>(null);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const result = await testDatabaseConnection();
        setTestResult(result);
      } catch (err) {
        setTestResult({
          success: false,
          error: err instanceof Error ? err.message : 'Failed to test connection',
          timestamp: new Date().toISOString()
        });
      }
    };

    // Only run in development
    if (import.meta.env.DEV) {
      checkConnection();
    } else {
      setTestResult({
        success: true,
        timestamp: new Date().toISOString()
      });
    }
  }, []);

  // Don't render anything in production
  if (!import.meta.env.DEV) {
    return null;
  }

  if (!testResult) {
    return <div className="p-4">Testing database connection...</div>;
  }

  return (
    <div className="p-4 rounded-lg bg-white dark:bg-gray-800 shadow">
      <h2 className="text-lg font-semibold mb-2">Database Connection Status</h2>
      {testResult.success ? (
        <div className="text-green-600 dark:text-green-400">
          ✓ Database connected successfully
        </div>
      ) : (
        <div className="text-red-600 dark:text-red-400">
          ✗ Database connection failed
          {testResult.error && <div className="text-sm mt-1">{testResult.error}</div>}
        </div>
      )}
      <div className="text-xs text-gray-500 mt-2">
        Last checked: {new Date(testResult.timestamp).toLocaleString()}
      </div>
    </div>
  );
};