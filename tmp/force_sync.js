const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

const env = dotenv.parse(fs.readFileSync('.env.local'));

// Gunakan Service Role Key jika ada, agar bisa melewati RLS jika diperlukan
// Tapi di sini kita asumsikan upsert bisa jalan dengan Service Role atau jika RLS diizinkan.
// Kita coba pakai anon dulu tapi dengan data yang benar.
const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
);

async function syncMidtrans() {
  console.log('--- FORCING KEY SYNC ---');
  
  const paymentConfig = {
    gateways: {
      midtrans: {
        enabled: true,
        server_key: "Mid-server-wrdh6zWREskosO0UGzvVqGveL",
        client_key: "Mid-client-iql6rvE-5KscQJ43"
      }
    },
    manual_banks: []
  };

  const { data, error } = await supabase
    .from('site_settings')
    .upsert({ 
       key: 'payment', 
       value: paymentConfig 
    }, { onConflict: 'key' });

  if (error) {
    console.error('SYNC_ERROR:', error.message);
  } else {
    console.log('SUCCESS: Midtrans keys injected into site_settings.');
  }
}

syncMidtrans();
