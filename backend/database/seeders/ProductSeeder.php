<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Buat atau ambil kategori dulu agar kita punya ID-nya
        $categoryId = DB::table('categories')->insertGetId([
            'name' => 'Elektronik',
            'slug' => 'elektronik',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // 2. Masukkan produk dengan menghubungkannya ke category_id tadi
        DB::table('products')->insert([
            [
                'name' => 'Produk Demo 1',
                'slug' => 'produk-demo-1',
                'price' => 150000,
                'description' => 'Deskripsi produk pertama saya di Railway',
                'category_id' => $categoryId, // <--- Ini kunci penyelesaiannya!
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}