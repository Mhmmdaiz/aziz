import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("PAKASIR_NOTIFICATION_RECEIVED:", body);

    // Pakasir usually sends order_id and amount
    const orderId = body.order_id || body.reference;
    if (!orderId) {
      return NextResponse.json({ error: "No Order ID provided" }, { status: 400 });
    }

    const adminSupabase = createAdminClient();

    // 1. Fetch current order status
    const { data: currentOrder, error: fetchError } = await adminSupabase
      .from("orders")
      .select("id, status, total_price")
      .eq("order_id", orderId)
      .single();

    if (fetchError || !currentOrder) {
      console.error("ORDER_NOT_FOUND:", orderId);
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // 2. SECURITY: Verify amount if provided by Pakasir
    if (body.amount && Number(body.amount) !== Number(currentOrder.total_price)) {
        console.warn("AMOUNT_MISMATCH:", { expected: currentOrder.total_price, received: body.amount });
        // Optional: still process if it's close enough or log for manual review
    }

    // 3. SECURE STOCK DECREMENT (If status becomes 'paid' for the first time)
    const newStatus = "paid"; // Pakasir webhooks usually only trigger on success

    if (currentOrder.status !== "paid") {
      // Fetch items from the order to decrement stock
      const { data: items } = await adminSupabase
        .from("order_items")
        .select("product_id, quantity")
        .eq("order_id", currentOrder.id);

      if (items && items.length > 0) {
        for (const item of items) {
          const { data: pData } = await adminSupabase
            .from("products")
            .select("stock, name")
            .eq("id", item.product_id)
            .single();

          if (pData) {
            const newStock = Math.max(0, pData.stock - item.quantity);
            await adminSupabase
              .from("products")
              .update({ stock: newStock })
              .eq("id", item.product_id);
            
            console.log(`PAKASIR_STOCK_SYNC: ${pData.name} -> ${newStock}`);
          }
        }
      }
    }

    // 4. Update Order Status
    const { error: updateError } = await adminSupabase
      .from("orders")
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq("order_id", orderId);

    if (updateError) throw updateError;

    return NextResponse.json({ status: "OK", orderId, newStatus });

  } catch (err: any) {
    console.error("PAKASIR_WEBHOOK_ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
