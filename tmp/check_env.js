const fs = require('fs');
const dotenv = require('dotenv');

try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const config = dotenv.parse(envContent);
    const key = config.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const url = config.NEXT_PUBLIC_SUPABASE_URL;

    console.log('URL:', url);
    console.log('Key Length:', key.length);
    
    const parts = key.split('.');
    if (parts.length !== 3) {
        console.log('Error: JWT must have 3 parts');
    } else {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
        console.log('Payload:', JSON.stringify(payload));
        
        const urlRef = url.split('://')[1].split('.')[0];
        if (payload.ref === urlRef) {
            console.log('SUCCESS: Key ref matches URL ref');
        } else {
            console.log('ERROR: Mismatch! URL Ref:', urlRef, 'Key Ref:', payload.ref);
        }
    }
} catch (e) {
    console.error('Script Error:', e.message);
}
