const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSettings() {
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) {
    console.error('Error fetching settings:', error);
    return;
  }
  console.log('Settings Data:', JSON.stringify(data, null, 2));
}

checkSettings();
