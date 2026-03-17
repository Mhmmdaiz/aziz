
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function syncMidtrans() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const paymentConfig = {
    gateways: {
      midtrans: {
        enabled: true,
        server_key: process.env.MIDTRANS_SERVER_KEY,
        client_key: process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
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
    console.log('SUCCESS: Midtrans keys updated in database.');
  }
}

syncMidtrans();
