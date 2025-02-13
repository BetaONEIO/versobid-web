import { config } from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEmailLogs() {
  console.log('\n📧 Checking Email Logs...\n');

  try {
    const { data: logs, error } = await supabase
      .from('email_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    if (!logs || logs.length === 0) {
      console.log('No email logs found');
      return;
    }

    console.log(`Found ${logs.length} recent logs:\n`);
    logs.forEach((log, index) => {
      console.log(`${index + 1}. Email Log Entry:`);
      console.log('   Recipient:', log.recipient);
      console.log('   Subject:', log.subject);
      console.log('   Template:', log.template_name);
      console.log('   Status:', log.status);
      console.log('   Sent:', new Date(log.created_at).toLocaleString());
      if (log.error) {
        console.log('   Error:', log.error);
      }
      console.log('');
    });
  } catch (error) {
    console.error('Failed to fetch email logs:', error);
    process.exit(1);
  }
}

checkEmailLogs().catch(console.error);