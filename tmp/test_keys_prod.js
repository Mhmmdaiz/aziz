
const Midtrans = require('midtrans-client');
require('dotenv').config({ path: '.env.local' });

async function testMidtrans() {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

  console.log('Testing with Keys (as PRODUCTION):');
  console.log('Server Key:', serverKey);
  console.log('Client Key:', clientKey);

  const snap = new Midtrans.Snap({
    isProduction: true, // Testing as Production
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
