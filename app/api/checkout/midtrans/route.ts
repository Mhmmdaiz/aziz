import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
// @ts-ignore
import Midtrans from "midtrans-client";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    // 1. Otorisasi Ganda: Cek Header Authorization (Bearer) atau Cookies
    const authHeader = req.headers.get("Authorization");
    const token = authHeader?.split(" ")[1];

    let user = null;
    let authError = null;

    if (token) {
      // Jika token ada di header, gunakan token tersebut
      const { data } = await supabase.auth.getUser(token);
      user = data.user;
    } else {
      // Jika tidak ada header, coba ambil dari session cookies (SSR)
      const { data } = await supabase.auth.getUser();
      user = data.user;
    }

    if (!user) {
      return NextResponse.json({
        error: "Unauthorized access detected. Please refresh or re-login.",
      }, { status: 401 });
    }

    const { items, customer_details, is_preorder } = await req.json();

    // 1. Server-side Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      !customer_details.name || customer_details.name.length < 3 ||
      !customer_details.email || !emailRegex.test(customer_details.email) ||
      !customer_details.phone || customer_details.phone.length < 10 ||
      !customer_details.address || customer_details.address.length < 10
    ) {
      return NextResponse.json({ error: "Mission-critical identity data is missing or invalid. Protocol aborted." }, { status: 400 });
    }

    // 1. Fetch Dynamic API Keys from site_settings (Bypass RLS if service key exists)
    let midtransConfig = null;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (serviceKey) {
      try {
        const adminSupabase = createAdminClient();
        const { data: paymentData } = await adminSupabase
          .from("site_settings")
          .select("value")
          .eq("key", "payment")
          .single();
        midtransConfig = paymentData?.value?.gateways?.midtrans;
      } catch (e) {
        console.warn("Database config fetch failed, falling back to environment variables.");
      }
    }

    // Fallback logic
    const serverKey = midtransConfig?.server_key && !midtransConfig.server_key.includes("xxxxx")
      ? midtransConfig.server_key
      : process.env.MIDTRANS_SERVER_KEY;

    const clientKey = midtransConfig?.client_key && !midtransConfig.client_key.includes("xxxxx")
      ? midtransConfig.client_key
      : process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY;

    const isEnabled = midtransConfig?.enabled ?? true;

    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === "true";

    // MASKED LOGGING FOR DEBUG
    console.log("MIDTRANS_GATEWAY_AUTH:", {
      activeServerKey: serverKey ? `${serverKey.substring(0, 10)}...` : "MISSING",
      activeClientKey: clientKey ? `${clientKey.substring(0, 10)}...` : "MISSING",
      keySource: midtransConfig?.server_key && !midtransConfig.server_key.includes("xxxxx") ? "SUPABASE_DATABASE" : "ENV_LOCAL_FILE",
      mode: isProduction ? "PRODUCTION" : "SANDBOX"
    });

    if (!serverKey || serverKey.includes("xxxxx")) {
      return NextResponse.json({ error: "Midtrans Server Key is missing in both Database and Environment." }, { status: 500 });
    }

    if (!isEnabled) {
      return NextResponse.json({ error: "Midtrans is currently DISABLED in settings." }, { status: 500 });
    }

    // 2. Initialize Midtrans SDK with keys
    const snap = new Midtrans.Snap({
      isProduction: isProduction,
      serverKey: serverKey,
      clientKey: clientKey,
    });

    // 3. Calculate Valuation
    const totalAmount = items.reduce((acc: number, item: any) => acc + (Number(item.price) * (item.quantity || 1)), 0);
    const orderId = `CHCKT-${Date.now()}`;

    // 4. Construct Midtrans Payload
    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: totalAmount,
      },
      customer_details: {
        first_name: customer_details.name,
        email: customer_details.email,
        phone: customer_details.phone,
        billing_address: {
          address: customer_details.address,
          city: customer_details.city,
          postal_code: customer_details.postalCode,
        },
      },
      item_details: items.map((item: any) => ({
        id: item.id,
        price: Number(item.price),
        quantity: item.quantity || 1,
        name: item.name.substring(0, 50),
      })),
    };

    const transaction = await snap.createTransaction(parameter);

    if (!transaction.token) throw new Error("Midtrans failed to generate deployment token.");

    // 5. Update User Profile (Persistence Sync)
    const adminSupabase = createAdminClient();
    try {
      await adminSupabase
        .from("profiles")
        .update({
          full_name: customer_details.name,
          phone: customer_details.phone,
          address: customer_details.address,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);
    } catch (e) {
      console.warn("Profile sync failed, but proceeding with order.", e);
    }

    // 6. Atomic Order Creation in Supabase
    const { data: order, error: orderError } = await adminSupabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_id: orderId,
        status: "pending",
        total_price: totalAmount,
        snap_token: transaction.token,
        customer_name: customer_details.name,
        customer_email: customer_details.email,
        customer_phone: customer_details.phone,
        shipping_address: `${customer_details.address}, ${customer_details.city} ${customer_details.postalCode}`,
        is_preorder: !!is_preorder,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 6. Bulk Insert Order Items
    const orderItems = items.map((item: any) => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      price: Number(item.price),
      quantity: item.quantity || 1,
      size: item.size || "Default",
    }));

    const { error: itemsError } = await adminSupabase.from("order_items").insert(orderItems);
    if (itemsError) throw itemsError;

    return NextResponse.json({
      token: transaction.token,
      orderId: orderId,
      redirect_url: transaction.redirect_url
    });

  } catch (err: any) {
    console.error("MIDTRANS_PROTOCOL_ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
