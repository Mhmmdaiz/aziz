<?php

// 1. Muat Autoload dan Bootstrap Laravel
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';

// 2. Inisialisasi Kernel (Solusi untuk "Facade root has not been set")
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle(
    $request = Illuminate\Http\Request::capture()
);

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;

header('Content-Type: text/html; charset=utf-8');
echo "<h2>Laravel to Supabase Migration Tool</h2><hr>";

try {
    echo "Menghubungkan ke database... ";
    // Mengetes koneksi ke Supabase secara langsung
    DB::connection()->getPdo();
    echo "<b style='color:green'>BERHASIL!</b><br><br>";

    echo "Menjalankan migrasi...<br>";
    // Menambahkan output agar kita bisa melihat prosesnya di layar
    $status = Artisan::call('migrate', ['--force' => true]);

    echo "<b>Log Migrasi:</b><pre style='background:#eee;padding:10px;'>" . Artisan::output() . "</pre>";
} catch (\Exception $e) {
    echo "<b style='color:red'>GAGAL!</b><br>";
    echo "<b>Pesan Error:</b><pre>" . $e->getMessage() . "</pre>";
    echo "<br><i>Saran: Cek kembali DB_PASSWORD dan DB_HOST di Environment Variables Vercel.</i>";
}
