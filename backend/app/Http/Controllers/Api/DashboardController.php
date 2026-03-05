<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function getStats()
    {
        try {
            // 1. Total Pendapatan
            // Cek apakah tabel orders ada, jika tidak set 0
            $totalRevenue = 0;
            if (DB::getSchemaBuilder()->hasTable('orders')) {
                $totalRevenue = DB::table('orders')
                    ->whereIn('status', ['paid', 'success', 'completed'])
                    ->sum('total_price');
            }

            // 2. Total User & Produk (Data Asli)
            $totalUsers = User::count();
            $totalProducts = Product::count();

            // 3. Stok Kritis (Produk yang hampir habis < 10)
            $criticalStockCount = Product::where('stock', '<', 10)->count();

            return response()->json([
                'status' => 'success',
                'data' => [
                    'revenue' => $totalRevenue,
                    'revenue_formatted' => 'Rp ' . number_format($totalRevenue, 0, ',', '.'),
                    'users_count' => $totalUsers,
                    'products_count' => $totalProducts,
                    'critical_stock' => $criticalStockCount,
                    'growth' => '+0.0%', // Bisa dikembangkan nanti
                    'system_health' => '99.9%'
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}