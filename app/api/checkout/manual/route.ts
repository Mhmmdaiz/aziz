import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";

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

    const { items, customer_details, is_preorder, bank_id } = await req.json();

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
      if (!is_preorder && dbProduct.stock < (item.quantity || 1)) {
        return NextResponse.json({ error: `Insufficient stock for ${dbProduct.name}.` }, { status: 400 });
      }
      totalAmount += Number(dbProduct.price) * (item.quantity || 1);
    }

    // 3. GENERATE ORDER ID
    const shortId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `CHCKT-${Date.now()}-${shortId}`;

    // 4. ATOMIC ORDER CREATION
    const { data: order, error: orderError } = await adminSupabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_id: orderId,
        status: "pending", // Waiting for manual transfer upload proof
        total_price: totalAmount,
        payment_gateway: "manual",
        payment_payload: bank_id, // Store which bank was selected, can be useful
        customer_name: customer_details.name,
        customer_email: customer_details.email,
        customer_phone: customer_details.phone,
        shipping_address: `${customer_details.address}, ${customer_details.city} ${customer_details.postalCode}`,
        is_preorder: !!is_preorder,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 5. INSERT ITEMS
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
      success: true,
    });

  } catch (err: any) {
    console.error("MANUAL_CHECKOUT_ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
