import { supabase } from '../../lib/supabase';
import { DatabaseTestResult } from './types';

export const testDatabaseConnection = async (): Promise<DatabaseTestResult> => {
  // Only run in development
  if (!import.meta.env.DEV) {
    return {
      success: true,
      timestamp: new Date().toISOString()
    };
  }

  try {
    // Try to fetch a single row from profiles table
    const { error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      console.error('Database connection test failed:', error.message);
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }

    const result: DatabaseTestResult = {
      success: true,
      timestamp: new Date().toISOString()
    };

    console.log('Database connection test successful:', result);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Database connection test error:', errorMessage);
    return {
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    };
  }
};