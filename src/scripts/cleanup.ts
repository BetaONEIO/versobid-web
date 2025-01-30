import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.VITE_SUPABASE_ANON_KEY || ''
);

async function cleanup() {
  console.log('Starting cleanup...');
  
  try {
    const { error } = await supabase
      .from('items')
      .delete()
      .neq('id', '');

    if (error) throw error;
    
    console.log('Successfully deleted all items');
  } catch (error) {
    console.error('Error:', error);
  }
}

cleanup();