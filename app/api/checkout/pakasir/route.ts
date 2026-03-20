import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import axios from "axios";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // 1. Authorization
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];
    let user = null;

    if (token) {
      const { data } = await supabase.auth.getUser(token);
      user = data.user;
    } else {
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }

    if (!user) {
      return NextResponse.json({ error: "Unauthorized access." }, { status: 401 });
    }

    const { items, customer_details, is_preorder } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items selected." }, { status: 400 });
    }

    // 2. SECURE VALIDATION (Price & Stock)
    const adminSupabase = createAdminClient();
    const productIds = items.map((i: any) => i.id);
    const { data: dbProducts, error: dbError } = await adminSupabase
      .from("products")
      .select("id, name, price, stock")
      .in("id", productIds);

    if (dbError || !dbProducts) throw new Error("Database sync failed.");

    let totalAmount = 0;
    for (const item of items) {
      const dbProduct = dbProducts.find((p) => p.id === item.id);
      if (!dbProduct) return NextResponse.json({ error: `Product ${item.name} not found.` }, { status: 404 });
      if (dbProduct.stock < (item.quantity || 1)) {
        return NextResponse.json({ error: `Insufficient stock for ${dbProduct.name}.` }, { status: 400 });
      }
      totalAmount += Number(dbProduct.price) * (item.quantity || 1);
    }
    if (totalAmount < 1000) {
      return NextResponse.json({ error: "Transaksi gagal: Nominal minimum QRIS adalah Rp 1.000." }, { status: 400 });
    }

    // 3. GENERATE ORDER ID
    const shortId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `CHCKT-${Date.now()}-${shortId}`;

    // 4. PAKASIR API INTEGRATION
    const PAKASIR_API_KEY = process.env.PAKASIR_API_KEY;
    const PAKASIR_SLUG = process.env.PAKASIR_SLUG;

    if (!PAKASIR_API_KEY || !PAKASIR_SLUG) {
        return NextResponse.json({ 
          error: "Konfigurasi Pakasir belum lengkap. Pastikan API_KEY dan SLUG sudah terpasang di Vercel/Env." 
        }, { status: 500 });
    }

    // Request to Pakasir
    let paymentData = null;
    try {
        const response = await axios.post("https://app.pakasir.com/api/transactioncreate/qris", {
            project: PAKASIR_SLUG,
            order_id: orderId,
            amount: totalAmount,
            api_key: PAKASIR_API_KEY
        });
        paymentData = response.data;
    } catch (e: any) {
        const errorMessage = e.response?.data?.message || e.message;
        console.error("PAKASIR_API_ERROR:", errorMessage);
        throw new Error(`Pakasir: ${errorMessage}`);
    }

    // 5. ATOMIC ORDER CREATION
    const { data: order, error: orderError } = await adminSupabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_id: orderId,
        status: "pending",
        total_price: totalAmount,
        snap_token: paymentData?.data?.qr_url || paymentData?.data?.payment_url || null, // Reuse field for storage
        customer_name: customer_details.name,
        customer_email: customer_details.email,
        customer_phone: customer_details.phone,
        shipping_address: `${customer_details.address}, ${customer_details.city} ${customer_details.postalCode}`,
        is_preorder: !!is_preorder,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 6. INSERT ITEMS
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      price: Number(item.price),
      quantity: item.quantity || 1,
      size: item.size || "Default",
    }));

    await adminSupabase.from("order_items").insert(orderItems);

    return NextResponse.json({
      orderId: orderId,
      paymentUrl: paymentData?.data?.payment_url || `https://app.pakasir.com/pay/${PAKASIR_SLUG}/${totalAmount}?order_id=${orderId}&qris_only=1`,
      qrData: paymentData?.data?.qr_data || paymentData?.payment?.payment_number
    });

  } catch (err: any) {
    console.error("CHECKOUT_ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
