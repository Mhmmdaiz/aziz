const dotenv = require('dotenv');
const fs = require('fs');

const env = dotenv.parse(fs.readFileSync('.env.local'));
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('--- DOTENV PARSE RESULT ---');
console.log('Key Length:', key.length);
console.log('First 10:', key.substring(0, 10));
console.log('Last 10:', key.substring(key.length - 10));

// Check specifically for any trailing whitespace that might have been missed
if (key !== key.trim()) {
    console.log('ERROR: Key has hidden whitespace!');
    console.log('Trimmed Length:', key.trim().length);
} else {
    console.log('Key is clean (no outer whitespace).');
}

// Check for any literal \r or \n inside the string
if (key.includes('\r')) console.log('ERROR: Key contains CR character!');
if (key.includes('\n')) console.log('ERROR: Key contains LF character!');
