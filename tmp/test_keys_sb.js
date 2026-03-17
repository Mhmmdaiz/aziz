
const Midtrans = require('midtrans-client');
require('dotenv').config({ path: '.env.local' });

async function testMidtrans() {
  let serverKey = process.env.MIDTRANS_SERVER_KEY;
  let clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

  // Prepend SB- if not present, as suggested by tmp/test_midtrans.js
  if (!serverKey.startsWith('SB-')) serverKey = 'SB-' + serverKey;
  if (!clientKey.startsWith('SB-')) clientKey = 'SB-' + clientKey;

  console.log('Testing with Keys (Prepended SB-):');
  console.log('Server Key:', serverKey);
  console.log('Client Key:', clientKey);

  const snap = new Midtrans.Snap({
    isProduction: false,
    serverKey: serverKey,
    clientKey: clientKey
  });

  const parameter = {
    transaction_details: {
      order_id: 'TEST-' + Date.now(),
      gross_amount: 10000
    }
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    console.log('Transaction Created successfully:');
    console.log(transaction);
  } catch (e) {
    console.error('Midtrans Error details:');
    if (e.ApiResponse) {
      console.error('HTTP Status Code:', e.ApiResponse.httpStatusCode);
      console.error('Response Body:', JSON.stringify(e.ApiResponse, null, 2));
    } else {
      console.error(e.message);
    }
  }
}

testMidtrans();
