import { createClient } from '@supabase/supabase-js';
import { DiagnosticResult } from './types';
import { checkDatabaseConnection } from './checks/databaseCheck';
import { checkResendConnection } from './checks/resendCheck';
import { Database } from '../../../types/supabase';

export class EmailSystemChecker {
  private readonly resendKey: string | null;
  private readonly supabase: ReturnType<typeof createClient<Database>>;

  constructor(resendKey: string | undefined) {
    this.resendKey = resendKey || null;
    
    // Create Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase credentials');
    }

    this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
  }

  async runDiagnostics(): Promise<void> {
    console.log('\n🔍 Starting Email System Diagnostics...\n');

    try {
      // Check database connection
      const dbResult = await this.runCheck(
        'Database Connection',
        () => checkDatabaseConnection(this.supabase)
      );

      // Check Resend API connection if key is available
      let resendResult: DiagnosticResult;
      if (this.resendKey) {
        resendResult = await this.runCheck(
          'Resend API Connection',
          () => checkResendConnection(this.resendKey)
        );
      } else {
        resendResult = {
          success: false,
          message: 'Resend API key not configured'
        };
        console.warn('⚠️ Resend API key not configured');
      }

      // Final summary
      this.printSummary([dbResult, resendResult]);
    } catch (error) {
      console.error('\n❌ Email system check failed:', error);
      throw error;
    }
  }

  private async runCheck(
    name: string,
    check: () => Promise<DiagnosticResult>
  ): Promise<DiagnosticResult> {
    console.log(`Running ${name} check...`);
    const result = await check();
    
    if (result.success) {
      console.log(`✅ ${result.message}`);
    } else {
      console.error(`❌ ${result.message}`);
      if (result.error) {
        console.error('  Error details:', result.error.message);
      }
    }
    console.log('');
    
    return result;
  }

  private printSummary(results: DiagnosticResult[]): void {
    const total = results.length;
    const successful = results.filter(r => r.success).length;
    
    console.log('\n📊 Diagnostics Summary');
    console.log('-------------------');
    console.log(`Total checks: ${total}`);
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${total - successful}`);
    console.log('');

    if (successful === total) {
      console.log('✨ All checks passed successfully!\n');
    } else {
      console.log('⚠️ Some checks failed. Please review the errors above.\n');
    }
  }
}