<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
{
    \App\Models\Product::create([
        'name' => 'Produk Demo 1',
        'slug' => 'produk-demo-1',
        'price' => 150000,
        'description' => 'Deskripsi produk pertama saya di Railway',
        // Jika ada kolom lain seperti category_id, pastikan sudah ada datanya atau isi manual
    ]);
}
}