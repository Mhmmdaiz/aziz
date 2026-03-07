<?php
// Pastikan titiknya dua (../) untuk keluar dari folder api ke folder utama
require __DIR__ . '/../backend/vendor/autoload.php';

// Panggil bootstrap Laravel dari folder backend
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';

// Tambahkan kode ini untuk melihat error lebih jelas di log Vercel jika gagal
try {
    // Kode migrasi Anda di sini
    // ...
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage();
}
