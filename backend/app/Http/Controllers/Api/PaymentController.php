<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Services\PaymentService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Midtrans\Notification;

class PaymentController extends Controller
{
    /**
     * Step 1: Create Order & Get Snap Token (Checkout)
     */
    public function checkout(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
        ]);

        return DB::transaction(function () use ($request) {
            $user = $request->user();
            
            $totalAmount = 0;
            foreach ($request->items as $item) {
                // Sesuaiin logika harga lo di sini
                $totalAmount += $item['price'] ?? 111111; 
            }

            $order = Order::create([
                'order_id'    => 'TRX-' . strtoupper(uniqid()),
                'user_id'     => $user->id,
                'total_price' => $totalAmount,
                'status'      => 'PENDING',
                'items'       => json_encode($request->items),
            ]);

            try {
                $paymentService = new PaymentService();
                $snapToken = $paymentService->getSnapToken($order, $user);
                
                $order->update(['snap_token' => $snapToken]);

                return response()->json([
                    'status'     => 'success',
                    'snap_token' => $snapToken,
                    'order_id'   => $order->order_id
                ]);
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'Midtrans Error: ' . $e->getMessage()
                ], 500);
            }
        });
    }

    /**
     * Step 2: Admin Dashboard List (Read)
     */
    public function index()
    {
        // with('user') wajib ada supaya di Next.js nama pembeli muncul
        $orders = Order::with('user')->latest()->get();

        return response()->json([
            'status' => 'success',
            'data'   => $orders
        ]);
    }

    /**
     * Step 3: Update Status Manual (Update)
     */
    public function update(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:PENDING,SUCCESS,FAILED,CHALLENGE'
        ]);

        $order = Order::findOrFail($id);
        $order->update(['status' => $request->status]);
        
        return response()->json([
            'status' => 'success',
            'message' => 'Order status updated to ' . $request->status
        ]);
    }

    /**
     * Step 4: Delete Order (Delete)
     */
    public function destroy($id)
    {
        $order = Order::findOrFail($id);
        $order->delete();
        
        return response()->json([
            'status' => 'success',
            'message' => 'Order record deleted successfully'
        ]);
    }

    /**
     * Step 5: Midtrans Webhook (Otomatis)
     */
    public function handleNotification(Request $request)
    {
        new PaymentService(); 
        $notif = new \Midtrans\Notification();

        $transaction = $notif->transaction_status;
        $type = $notif->payment_type;
        $order_id = $notif->order_id;
        $fraud = $notif->fraud_status;

        $order = Order::where('order_id', $order_id)->first();

        if (!$order) {
            return response()->json(['message' => 'Order not found'], 404);
        }

        if ($transaction == 'capture') {
            if ($type == 'credit_card') {
                $order->status = ($fraud == 'challenge') ? 'CHALLENGE' : 'SUCCESS';
            }
        } else if ($transaction == 'settlement') {
            $order->status = 'SUCCESS';
        } else if ($transaction == 'pending') {
            $order->status = 'PENDING';
        } else if ($transaction == 'deny' || $transaction == 'expire' || $transaction == 'cancel') {
            $order->status = 'FAILED';
        }

        $order->save();
        return response()->json(['message' => 'Notification processed']);
    }
}