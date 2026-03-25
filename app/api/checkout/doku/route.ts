export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import crypto from "crypto";

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

    const { items, customer_details, shipping_cost, shipping_method, is_preorder } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items selected." }, { status: 400 });
    }

    // 2. Fetch Settings for DOKU Credentials
    const { data: dbSettings } = await supabase.from("site_settings").select("*").eq("key", "payment").single();
    if (!dbSettings) {
      return NextResponse.json({ error: "Payment settings not found." }, { status: 500 });
    }
    const paymentSettings = dbSettings.value;
    const dokuConfig = paymentSettings?.gateways?.doku;

    if (!dokuConfig || !dokuConfig.enabled || !dokuConfig.client_id || !dokuConfig.secret_key) {
      return NextResponse.json({ error: "DOKU payment gateway is not configured or enabled." }, { status: 500 });
    }

    const CLIENT_ID = dokuConfig.client_id;
    const SECRET_KEY = dokuConfig.secret_key;
    const ENVIRONMENT = dokuConfig.environment || "sandbox";
    const BASE_URL = ENVIRONMENT === "production" 
      ? "https://api.doku.com" 
      : "https://api-sandbox.doku.com";

    // 3. SECURE VALIDATION (Price & Stock)
    const adminSupabase = createAdminClient();
    const productIds = items.map((i: any) => i.id);
    const { data: dbProducts, error: dbError } = await adminSupabase
      .from("products")
      .select("id, name, price, stock")
      .in("id", productIds);

    if (dbError || !dbProducts) throw new Error("Database sync failed.");

    let subtotal = 0;
    for (const item of items) {
      const dbProduct = dbProducts.find((p) => p.id === item.id);
      if (!dbProduct) return NextResponse.json({ error: `Product ${item.name} not found.` }, { status: 404 });
      if (!is_preorder && dbProduct.stock < (item.quantity || 1)) {
        return NextResponse.json({ error: `Insufficient stock for ${dbProduct.name}.` }, { status: 400 });
      }
      subtotal += Math.round(Number(dbProduct.price)) * (item.quantity || 1);
    }

    const totalAmount = subtotal + Math.round(Number(shipping_cost) || 0);

    if (totalAmount < 10000) {
      return NextResponse.json({ error: "Transaksi gagal: Nominal minimum DOKU adalah Rp 10.000." }, { status: 400 });
    }

    // 4. GENERATE ORDER ID
    const shortId = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `CHCKT-${Date.now()}-${shortId}`;

    // 5. ATOMIC ORDER CREATION (Pending status)
    const { data: order, error: orderError } = await adminSupabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_id: orderId,
        status: "pending",
        total_price: totalAmount,
        payment_gateway: "doku",
        customer_name: customer_details.name,
        customer_email: customer_details.email,
        customer_phone: customer_details.phone,
        shipping_address: `[KURIR: ${shipping_method || 'REGULAR'}] ${customer_details.address}, ${customer_details.city}, ${customer_details.province || '-'} ${customer_details.postalCode}`,
        is_preorder: !!is_preorder,
      })
      .select()
      .single();

    if (orderError) throw orderError;

    // 6. INSERT ITEMS
    const orderItems = items.map((item: any) => {
      const dbProduct = dbProducts.find((p) => p.id === item.id);
      return {
        order_id: order.id,
        product_id: item.id,
        product_name: dbProduct?.name || item.name,
        price: Math.round(Number(dbProduct?.price || item.price)),
        quantity: item.quantity || 1,
        size: item.size || "Default",
      }
    });

    // Add shipping as an item if cost > 0
    if (Math.round(Number(shipping_cost)) > 0) {
      orderItems.push({
        order_id: order.id,
        product_id: "shipping",
        product_name: `Shipping: ${shipping_method || "Regular"}`,
        price: Math.round(Number(shipping_cost)),
        quantity: 1,
        size: "N/A",
      } as any);
    }

    await adminSupabase.from("order_items").insert(orderItems);

    // 7. DOKU API INTEGRATION
    const requestTimestamp = new Date().toISOString().slice(0, 19) + "Z";
    const requestId = crypto.randomUUID();
    const path = "/checkout/v1/payment";

    // Build Line Items for DOKU (Use DB prices for security and consistency)
    const lineItems = items.map((item: any) => {
      const dbProduct = dbProducts.find((p) => p.id === item.id);
      // Clean name from special characters just in case DOKU is sensitive
      const cleanName = (dbProduct?.name || item.name).replace(/[^\w\s-]/g, '').substring(0, 50);
      return {
        name: cleanName,
        price: Math.round(Number(dbProduct?.price || item.price)),
        quantity: item.quantity || 1,
      };
    });

    if (Math.round(Number(shipping_cost)) > 0) {
      lineItems.push({
        name: `Shipping ${shipping_method || 'Regular'}`.replace(/[^\w\s-]/g, '').substring(0, 50),
        price: Math.round(Number(shipping_cost)),
        quantity: 1,
      });
    }

    const cleanPhone = (customer_details.phone || "08123456789").replace(/[^0-9]/g, "").substring(0, 15);

    // DOKU Payload
    const dokuPayload = {
      order: {
        invoice_number: orderId,
        amount: totalAmount,
        line_items: lineItems,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/checkout/success?order_id=${orderId}`,
      },
      payment: {
        payment_due_date: 60, // 60 minutes
      },
      customer: {
        name: customer_details.name.substring(0, 50),
        email: customer_details.email,
        phone: cleanPhone,
      }
    };

    // Generate Signature
    // Format: "Client-Id:" + clientId + "\n" + "Request-Id:" + requestId + "\n" + "Request-Timestamp:" + requestTimestamp + "\n" + "Request-Target:" + path + "\n" + "Digest:" + digest;
    
    // Create Digest
    const bodyString = JSON.stringify(dokuPayload);
    const digest = crypto.createHash('sha256').update(bodyString, 'utf8').digest('base64');

    let signatureComponents = `Client-Id:${CLIENT_ID}\n`;
    signatureComponents += `Request-Id:${requestId}\n`;
    signatureComponents += `Request-Timestamp:${requestTimestamp}\n`;
    signatureComponents += `Request-Target:${path}\n`;
    signatureComponents += `Digest:${digest}`;

    const hmac = crypto.createHmac('sha256', SECRET_KEY);
    hmac.update(signatureComponents, 'utf8');
    const signature = `HMACSHA256=${hmac.digest('base64')}`;

    console.log("Sending DOKU Request:", { BASE_URL, path, dokuPayload });

    // Request to DOKU
    const fetchResponse = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Client-Id": CLIENT_ID,
        "Request-Id": requestId,
        "Request-Timestamp": requestTimestamp,
        "Signature": signature,
        "Digest": `SHA256=${digest}`,
      },
      body: bodyString,
    });

    const dokuData = await fetchResponse.json();

    if (!fetchResponse.ok) {
      console.error("DOKU API Error Details:", JSON.stringify(dokuData, null, 2));
      const errorMessage = dokuData?.error?.message?.join(', ') || "Terdapat kendala teknis pada layanan pembayaran.";
      return NextResponse.json({ 
        error: `DOKU Error: ${errorMessage}`,
        // 'details' dihapus untuk keamanan agar tidak membocorkan metadata internal ke browser
      }, { status: 400 });
    }

    const paymentUrl = dokuData.response?.payment?.url;

    if (!paymentUrl) {
      throw new Error("DOKU payment URL not found in response.");
    }

    // Update order with payment URL
    await adminSupabase.from("orders").update({ payment_payload: paymentUrl }).eq("id", order.id);

    return NextResponse.json({
      orderId: orderId,
      paymentUrl: paymentUrl,
    });

  } catch (err: any) {
    console.error("DOKU_CHECKOUT_ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
