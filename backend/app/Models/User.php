<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Laravel\Sanctum\HasApiTokens; // <--- PASTIKAN ADA INI
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasApiTokens, Notifiable; // <--- TAMBAHKAN HasApiTokens DI SINI

   
    protected $fillable = [
    'name',
    'email',
    'password',
    'phone',    // Tambahin ini
    'city',     // Tambahin ini
    'address',  // Tambahin ini
    'role',     // Tambahin ini
    'role',    // <--- Tambahkan ini
    'status',  // <--- Tambahkan ini
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
