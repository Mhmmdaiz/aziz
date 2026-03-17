const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

const env = dotenv.parse(fs.readFileSync('.env.local'));

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkSettings() {
  console.log('--- SITE SETTINGS AUDIT ---');
  const { data, error } = await supabase.from('site_settings').select('*').eq('key', 'payment').single();
  
  if (error) {
    console.error('Error fetching site_settings:', error.message);
    return;
  }

  console.log('Key:', data.key);
  console.log('Value:', JSON.stringify(data.value, null, 2));
}

checkSettings();
