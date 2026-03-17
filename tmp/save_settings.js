
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

async function checkSettings() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    fs.writeFileSync('tmp/settings_debug.json', JSON.stringify({ error: 'Missing env vars' }));
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('key', 'payment')
    .single();

  if (error) {
    fs.writeFileSync('tmp/settings_debug.json', JSON.stringify({ error: error.message }));
    return;
  }

  fs.writeFileSync('tmp/settings_debug.json', JSON.stringify(data.value, null, 2));
}

checkSettings();
