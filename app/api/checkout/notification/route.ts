import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
// @ts-ignore
import midtransClient from "midtrans-client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("MIDTRANS_NOTIFICATION_RECEIVED:", body);

    // 1. Fetch Dynamic API Keys from site_settings
    const adminSupabase = createAdminClient();
    const { data: paymentData } = await adminSupabase
      .from("site_settings")
      .select("value")
      .eq("key", "payment")
      .single();
    
    const midtransConfig = paymentData?.value?.gateways?.midtrans;
    
    const serverKey = midtransConfig?.server_key && !midtransConfig.server_key.includes("xxxxx") 
      ? midtransConfig.server_key 
      : process.env.MIDTRANS_SERVER_KEY;
      
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

    // 2. Verify Signature (Mandatory for security)
    const snap = new midtransClient.Snap({
      isProduction: isProduction,
      serverKey: serverKey,
    });

    const notification = await snap.transaction.notification(body);
    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;

    console.log(`Transaction notification received. Order ID: ${orderId}. Status: ${transactionStatus}. Fraud Status: ${fraudStatus}`);

    let newStatus = "pending";

    if (transactionStatus == 'capture') {
      if (fraudStatus == 'challenge') {
        newStatus = "challenge";
      } else if (fraudStatus == 'accept') {
        newStatus = "paid";
      }
    } else if (transactionStatus == 'settlement') {
      newStatus = "paid";
    } else if (transactionStatus == 'cancel' || transactionStatus == 'deny' || transactionStatus == 'expire') {
      newStatus = "cancelled";
    } else if (transactionStatus == 'pending') {
      newStatus = "pending";
    }

    // 3. Update Database using Admin Client (Bypass RLS)
    const { error } = await adminSupabase
      .from("orders")
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq("order_id", orderId);

    if (error) {
      console.error("DATABASE_UPDATE_ERROR:", error);
      return NextResponse.json({ error: "Failed to update order status" }, { status: 500 });
    }

    return NextResponse.json({ status: "OK", orderId, newStatus });

  } catch (err: any) {
    console.error("NOTIFICATION_HANDLER_ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
