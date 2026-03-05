<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
{
    User::updateOrCreate(
        ['email' => 'admin@chckt.com'],
        ['name' => 'Admin CHCKT', 'password' => bcrypt('password')]
    );

    // Buat kategori
    $category = Category::create([
        'name' => 'Umum',
        'slug' => 'umum'
    ]);

    // Buat 10 produk
    Product::factory(10)->create([
        'category_id' => $category->id
    ]);
}
}