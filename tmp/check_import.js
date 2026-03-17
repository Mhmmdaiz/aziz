
const Midtrans = require('midtrans-client');
console.log('Midtrans Keys:', Object.keys(Midtrans));
console.log('Midtrans Snap:', Midtrans.Snap);
if (Midtrans.default) {
  console.log('Midtrans Default Keys:', Object.keys(Midtrans.default));
}
