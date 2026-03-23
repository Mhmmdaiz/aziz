const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function findAAAAA() {
  const { data, error } = await supabase.from('site_settings').select('*');
  if (error) {
    console.error("Error:", error);
    return;
  }

  for (const item of data) {
    if (JSON.stringify(item).includes("AAAAA")) {
      console.log("MATCH FOUND!");
      console.log("Key:", item.key);
      console.log("Value:", JSON.stringify(item.value, null, 2));
    }
  }
}

findAAAAA();
