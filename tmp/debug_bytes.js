const fs = require('fs');

try {
    const content = fs.readFileSync('.env.local');
    console.log('File size:', content.length);
    console.log('Hex content:', content.toString('hex'));
    
    const lines = content.toString('utf8').split('\n');
    lines.forEach((line, i) => {
        if (line.includes('SUPABASE_ANON_KEY')) {
            console.log(`Line ${i+1}: "${line.trim()}"`);
            console.log(`Length: ${line.trim().length}`);
            // Check for spaces at the end
            if (line.endsWith(' ')) console.log('WARNING: Line ends with space');
            if (line.endsWith('\r')) console.log('WARNING: Line ends with CR (Windows style)');
        }
    });
} catch (e) {
    console.error(e);
}
