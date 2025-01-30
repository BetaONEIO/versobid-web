import { supabase } from '../../../lib/supabase';
import { DiagnosticResult } from './types';
import { checkDatabaseConnection } from './checks/databaseCheck';
import { checkBrevoConnection } from './checks/brevoCheck';
import { Database } from '../../../types/supabase';
import { SupabaseClient } from '@supabase/supabase-js';

export class EmailSystemChecker {
  private readonly brevoKey: string;
  private readonly supabase: SupabaseClient<Database>;

  constructor(brevoKey: string) {
    this.brevoKey = brevoKey;
    this.supabase = supabase;
  }

  async runDiagnostics(): Promise<void> {
    console.log('\n🔍 Starting Email System Diagnostics...\n');

    try {
      // Check database connection
      const dbResult = await this.runCheck(
        'Database Connection',
        () => checkDatabaseConnection(this.supabase)
      );

      // Check Brevo API connection
      const brevoResult = await this.runCheck(
        'Brevo API Connection',
        () => checkBrevoConnection(this.brevoKey)
      );

      // Final summary
      this.printSummary([dbResult, brevoResult]);
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