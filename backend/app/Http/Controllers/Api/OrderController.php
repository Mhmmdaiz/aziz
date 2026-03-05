<?php

namespace App\Http\Controllers;
namespace App\Http\Controllers\Api; // Tambahkan \Api di sini

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller; // Pastikan ini tetap ada

class OrderController extends Controller
{
    // Fungsi untuk menyimpan order baru
    public function store(Request $request)
    {
        $request->validate([
            'total_price' => 'required',
            'shipping_address' => 'required',
            'items' => 'required|array'
        ]);

        $order = Order::create([
            'user_id' => Auth::id(),
            'total_price' => $request->total_price,
            'shipping_address' => $request->shipping_address,
            'status' => 'pending'
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Order_Created_Successfully',
            'data' => $order
        ], 201);
    }

    // Fungsi untuk list order di Dashboard User
    public function userOrders()
    {
        $orders = Order::where('user_id', Auth::id())->latest()->get();
        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }
}