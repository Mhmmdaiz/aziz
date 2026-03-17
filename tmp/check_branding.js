const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

const env = dotenv.parse(fs.readFileSync('.env.local'));

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkStoreName() {
  console.log('--- STORE BRANDING CHECK ---');
  const { data, error } = await supabase.from('site_settings').select('*');
  
  if (error) {
    console.error('Error:', error.message);
    return;
  }

  const storeSett = data.find(s => s.key === 'store');
  if (storeSett) {
    console.log('Store Setting Value:', JSON.stringify(storeSett.value, null, 2));
  } else {
    console.log('Store setting NOT FOUND in database.');
  }
}

checkStoreName();
