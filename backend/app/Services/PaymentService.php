<?php

namespace App\Services;

use Midtrans\Config;
use Midtrans\Snap;

class PaymentService
{
    public function __construct()
    {
        // Menggunakan config helper lebih disarankan daripada env langsung
        Config::$serverKey = env('MIDTRANS_SERVER_KEY');
        Config::$isProduction = (bool) env('MIDTRANS_IS_PRODUCTION', false);
        Config::$isSanitized = true;
        Config::$is3ds = true;
    }

    public function getSnapToken($order, $user)
    {
        $params = [
            'transaction_details' => [
                'order_id' => $order->order_id,
                // PERBAIKAN: Gunakan 'total_price' sesuai kolom di database lo
                'gross_amount' => (int) $order->total_price, 
            ],
            'customer_details' => [
                'first_name' => $user->name,
                'email'      => $user->email,
            ],
            // Opsional: Bisa lo hapus biar semua metode pembayaran muncul otomatis
            'enabled_payments' => ['credit_card', 'gopay', 'shopeepay', 'qris', 'bank_transfer'],
        ];

        return Snap::getSnapToken($params);
    }
}