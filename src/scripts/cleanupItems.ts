import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

// Setup environment
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env file
config({ path: resolve(__dirname, '../../.env') });

// Log environment check (but don't expose sensitive data)
console.log('Environment check:', {
  hasUrl: !!process.env.VITE_SUPABASE_URL,
  hasKey: !!process.env.VITE_SUPABASE_ANON_KEY
});

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function deleteAllItems() {
  try {
    console.log('Starting cleanup...');
    
    // First check if we can connect
    const { error: testError } = await supabase
      .from('items')
      .select('count');

    if (testError) {
      console.error('Failed to connect to database:', testError);
      process.exit(1);
    }

    console.log('Connected to database successfully');
    
    // Delete all items
    const { error } = await supabase
      .from('items')
      .delete()
      .neq('id', '');

    if (error) {
      console.error('Error deleting items:', error);
      process.exit(1);
    }

    console.log('Successfully deleted all items');
    process.exit(0);
  } catch (error) {
    console.error('Failed to delete items:', error);
    process.exit(1);
  }
}

// Run the cleanup
deleteAllItems().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});