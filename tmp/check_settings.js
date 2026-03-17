
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function checkSettings() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('Supabase URL:', supabaseUrl);
  // Don't log the full key for security
  console.log('Supabase Key exists:', !!supabaseServiceRoleKey);

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('Missing Supabase environment variables');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('key', 'payment')
      .single();

    if (error) {
      console.error('Supabase Error:', error.message, error.details, error.hint);
      return;
    }

    if (data) {
      console.log('Site Settings (payment) FOUND:');
      console.log(JSON.stringify(data.value, null, 2));
    } else {
      console.log('Site Settings (payment) NOT FOUND');
    }
  } catch (err) {
    console.error('Execution Error:', err);
  }
}

checkSettings();
