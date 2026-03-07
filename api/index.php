<?php
// 1. Keluar dari folder api/ ke root, lalu masuk ke backend/vendor
require __DIR__ . '/../backend/vendor/autoload.php';

// 2. Load aplikasi Laravel
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

try {
    // Cek koneksi ke Supabase dulu
    DB::connection()->getPdo();
    echo "Koneksi ke Supabase Berhasil!<br>";

    // 3. Jalankan Migrasi
    echo "Sedang menjalankan migrasi...<br>";
    Artisan::call('migrate', [
        '--force' => true, // Wajib di production/Vercel
    ]);

    echo "Migrasi Selesai:<br>";
    echo "<pre>" . Artisan::output() . "</pre>";
} catch (\Exception $e) {
    echo "Gagal Migrasi: " . $e->getMessage();
}
