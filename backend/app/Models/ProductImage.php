<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProductImage extends Model
{
    use HasFactory;

    // Supaya data bisa masuk lewat Controller
    protected $fillable = ['product_id', 'image_path'];

    // Relasi balik ke produk
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}