const axios = require('axios');
const dotenv = require('dotenv');
const fs = require('fs');

const env = dotenv.parse(fs.readFileSync('.env.local'));

const SERVER_KEY = 'SB-' + env.MIDTRANS_SERVER_KEY;
const CLIENT_KEY = 'SB-' + env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

const auth = Buffer.from(SERVER_KEY + ':').toString('base64');

async function testMidtrans() {
  console.log('--- MIDTRANS DIAGNOSTIC TEST ---');
  console.log('Target: Sandbox');
  console.log('Server Key:', SERVER_KEY.substring(0, 10) + '...');
  
  try {
    const response = await axios.post(
      'https://app.sandbox.midtrans.com/snap/v1/transactions',
      {
        transaction_details: {
          order_id: 'TEST-' + Date.now(),
          gross_amount: 10000
        }
      },
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + auth
        }
      }
    );
    
    console.log('STATUS:', response.status);
    console.log('TOKEN CREATED:', response.data.token);
    console.log('REDIRECT URL:', response.data.redirect_url);
    console.log('SUCCESS: Connection verified.');
  } catch (error) {
    console.error('DIAGNOSTIC_FAILED');
    if (error.response) {
      console.error('HTTP Status:', error.response.status);
      console.error('Response Body:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error Message:', error.message);
    }
  }
}

testMidtrans();
