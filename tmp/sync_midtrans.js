const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');

const env = dotenv.parse(fs.readFileSync('.env.local'));

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function syncMidtrans() {
  console.log('--- SYNCING MIDTRANS KEYS TO DATABASE ---');
  
  const paymentConfig = {
    gateways: {
      midtrans: {
        enabled: true,
        server_key: env.MIDTRANS_SERVER_KEY,
        client_key: env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
      }
    },
    manual_banks: []
  };

  const { data, error } = await supabase
    .from('site_settings')
    .upsert({ 
       key: 'payment', 
       value: paymentConfig 
    });

  if (error) {
    console.error('Error syncing keys:', error.message);
  } else {
    console.log('SUCCESS: Midtrans keys synced to site_settings table.');
  }
}

syncMidtrans();
