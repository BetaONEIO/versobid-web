import { SupabaseClient } from '@supabase/supabase-js';
import { DiagnosticResult } from '../types';
import { Database } from '../../../../types/supabase';

export async function checkDatabaseConnection(
  supabase: SupabaseClient<Database>
): Promise<DiagnosticResult> {
  try {
    const { error } = await supabase
      .from('email_logs')
      .select('count');

    if (error) throw error;
    
    return {
      success: true,
      message: 'Database connection successful'
    };
  } catch (error) {
    return {
      success: false,
      message: 'Database connection failed',
      error: error as Error
    };
  }
}