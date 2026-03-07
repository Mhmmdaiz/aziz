<?php

require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';

// BARIS PENTING: Menyiapkan Laravel agar Facade (seperti DB & Artisan) bisa digunakan
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->handle(Illuminate\Http\Request::capture());

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

header('Content-Type: text/html; charset=utf-8');
echo "<h2>Laravel to Supabase Migration Tool</h2><hr>";

try {
    echo "Menghubungkan ke database... ";
    // Mengetes koneksi ke Supabase
    DB::connection()->getPdo();
    echo "<b style='color:green'>BERHASIL!</b><br><br>";

    echo "Menjalankan migrasi...<br>";
    $status = Artisan::call('migrate', ['--force' => true]);

    echo "<b>Log Migrasi:</b><pre style='background:#eee;padding:10px;'>" . Artisan::output() . "</pre>";
} catch (\Exception $e) {
    echo "<b style='color:red'>GAGAL!</b><br>";
    echo "<b>Pesan Error:</b><pre>" . $e->getMessage() . "</pre>";
}
