<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'category_id', 
        'name', 
        'slug', 
        'description', 
        'price', 
        'stock'
        // 'image' dihapus jika lu pakai tabel product_images untuk semua foto
    ];

    // Relasi ke Kategori
    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    // Relasi ke Banyak Gambar (Gallery)
    public function images() 
    {
        return $this->hasMany(ProductImage::class);
    }
}