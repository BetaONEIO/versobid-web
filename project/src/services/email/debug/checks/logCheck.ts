import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../../../types/supabase';

type EmailLogInsert = Database['public']['Tables']['email_logs']['Insert'];

export async function checkEmailLogCreation(
  supabase: SupabaseClient<Database>
): Promise<void> {
  console.log('2. Testing Email Log Creation');
  
  try {
    const logData: EmailLogInsert = {
      recipient: 'test@example.com',
      subject: 'Debug Test Email',
      template_name: 'test',
      status: 'pending'
    };

    const { data, error } = await supabase
      .from('email_logs')
      .insert(logData)
      .select()
      .single();

    if (error) throw error;
    console.log('✓ Test log created successfully');
    console.log(`  Log ID: ${data.id}\n`);
  } catch (error) {
    console.error('✗ Failed to create test log:', error);
    throw error;
  }
}