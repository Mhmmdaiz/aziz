<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'user_id',
        'total_price',
        'status',
        'snap_token',
        'items'
    ];

    // INI YANG SERING KURANG: Relasi ke User
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}