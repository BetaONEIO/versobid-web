import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: resolve(__dirname, '../../.env') });

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function updateTestPassword() {
  try {
    const { error } = await supabase.auth.admin.updateUserById(
      '00000000-0000-0000-0000-000000000001',
      { password: 'Hellworld1!' }
    );

    if (error) {
      console.error('Failed to update password:', error);
      process.exit(1);
    }

    console.log('Password updated successfully for test@example.com');
    console.log('New password: Hellworld1!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateTestPassword();