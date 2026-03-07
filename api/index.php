<?php

/**
 * Laravel Migration Bridge for Vercel
 * File: api/index.php
 */

// 1. Hubungkan ke autoload dan bootstrap di folder backend
require __DIR__ . '/../backend/vendor/autoload.php';
$app = require_once __DIR__ . '/../backend/bootstrap/app.php';

use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

// Set header agar output teks rapi di browser
header('Content-Type: text/html; charset=utf-8');

echo "<h2>Laravel to Supabase Migration Tool</h2>";
echo "<hr>";

try {
    // 2. Cek Koneksi Database
    echo "Menghubungkan ke database... ";
    DB::connection()->getPdo();
    echo "<b style='color:green'>BERHASIL!</b><br><br>";

    // 3. Jalankan Migrasi
    echo "Menjalankan perintah: <code>php artisan migrate --force</code><br>";

    // --force wajib ada karena Vercel dianggap lingkungan 'production'
    $status = Artisan::call('migrate', [
        '--force' => true,
    ]);

    // 4. Tampilkan Hasil
    echo "<b>Status:</b> " . ($status === 0 ? "Sukses" : "Gagal") . "<br>";
    echo "<b>Output Log:</b><br>";
    echo "<pre style='background:#f4f4f4; padding:10px; border:1px solid #ccc;'>" . Artisan::output() . "</pre>";

    if (Schema::hasTable('users')) {
        echo "<b style='color:green'>Migrasi Terverifikasi: Tabel 'users' sudah ada!</b>";
    }
} catch (\Exception $e) {
    echo "<b style='color:red'>GAGAL!</b><br>";
    echo "<b>Pesan Error:</b><pre>" . $e->getMessage() . "</pre>";
    echo "<br><i>Pastikan Environment Variables (DB_HOST, DB_PASSWORD, dll) di Vercel sudah benar.</i>";
}

echo "<hr><p>Proyek: chckt-stor3</p>";
