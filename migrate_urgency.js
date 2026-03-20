const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateSchema() {
  console.log('Adding columns is_high_demand and sold_today to products table...');
  
  // Karena kita tidak bisa menjalankan SQL langsung via client-side Supabase tanpa RPC,
  // Kita berasumsi user bisa menjalankan ini di SQL Editor, ATAU kita coba cek apakah kolom sudah ada.
  // Tapi untuk tugas ini, saya akan mencoba menggunakan rpc jika tersedia, atau sekedar memberi tahu user.
  // Namun, saya punya akses untuk memodifikasi file, jadi saya akan mencoba mengupdate file-file yang menggunakan data ini.
  
  // Wait, if I cannot run SQL directly, I should ask the user to run it OR check if I can use a migration-like approach.
  // Actually, I can use the Supabase API to "update" a row with these new fields. 
  // If the columns don't exist, it will error.
  
  const { error } = await supabase.from('products').update({ is_high_demand: false, sold_today: 0 }).match({ }).limit(1);
  
  if (error && error.code === '42703') {
    console.error('Columns do not exist. Please run this SQL in Supabase SQL Editor:');
    console.log('ALTER TABLE products ADD COLUMN is_high_demand BOOLEAN DEFAULT false;');
    console.log('ALTER TABLE products ADD COLUMN sold_today INTEGER DEFAULT 0;');
  } else if (error) {
    console.error('Error checking columns:', error.message);
  } else {
    console.log('Columns already exist or updated successfully.');
  }
}

updateSchema();
