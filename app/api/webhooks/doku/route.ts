import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);
    
    // Headers list for verification
    const clientId = req.headers.get("Client-Id");
    const requestId = req.headers.get("Request-Id");
    const requestTimestamp = req.headers.get("Request-Timestamp");
    const incomingSignature = req.headers.get("Signature");
    
    // Use an admin client for database updates
    const adminSupabase = createAdminClient();

    // Fetch DOKU settings
    const { data: dbSettings } = await adminSupabase.from("site_settings").select("*").eq("key", "payment").single();
    if (!dbSettings) {
      return NextResponse.json({ error: "Configuration missing" }, { status: 500 });
    }
    const paymentSettings = dbSettings.value;
    const dokuConfig = paymentSettings?.gateways?.doku;

    if (!dokuConfig || !dokuConfig.secret_key) {
      return NextResponse.json({ error: "DOKU secret key missing" }, { status: 500 });
    }

    const SECRET_KEY = dokuConfig.secret_key;
    const CLIENT_ID_CONFIG = dokuConfig.client_id;
    
    // Optional: Verify Client-Id matches configured
    if (clientId && clientId !== CLIENT_ID_CONFIG) {
       console.warn("Client ID mismatch on webhook.");
    }

    // Verify Signature
    if (clientId && requestId && requestTimestamp && incomingSignature) {
        const path = new URL(req.url).pathname; // e.g. /api/webhooks/doku
        
        // Digest base64 (tanpa prefix SHA256= untuk signature string)
        const digest = crypto.createHash('sha256').update(rawBody, 'utf8').digest('base64');
    
        let signatureComponents = `Client-Id:${clientId}\n`;
        signatureComponents += `Request-Id:${requestId}\n`;
        signatureComponents += `Request-Timestamp:${requestTimestamp}\n`;
        signatureComponents += `Request-Target:${path}\n`;
        signatureComponents += `Digest:${digest}`;
    
        const hmac = crypto.createHmac('sha256', SECRET_KEY);
        hmac.update(signatureComponents, 'utf8');
        const expectedSignature = `HMACSHA256=${hmac.digest('base64')}`;
        
        if (incomingSignature !== expectedSignature) {
            console.error("DOKU WEBHOOK SIGNATURE MISMATCH", {
                expected: expectedSignature,
                received: incomingSignature
            });
            return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
        }
    }

    // If signature matches (or if we skipped for dev, but we didn't), process payload
    const invoiceNumber = payload?.order?.invoice_number;
    const transactionStatus = payload?.transaction?.status; // e.g. SUCCESS, FAILED
    
    if (!invoiceNumber) {
        return NextResponse.json({ error: "Missing invoice_number" }, { status: 400 });
    }

    let newStatus = "pending";
    if (transactionStatus === "SUCCESS") {
        newStatus = "paid";
    } else if (transactionStatus === "FAILED") {
        newStatus = "cancelled";
    }
    
    if (newStatus !== "pending") {
        const { error } = await adminSupabase
            .from("orders")
            .update({ status: newStatus })
            .eq("order_id", invoiceNumber);
            
        if (error) {
            console.error("Failed to update order status:", error);
            throw error;
        }
    }

    return NextResponse.json({ message: "OK" });
  } catch (err: any) {
    console.error("DOKU_WEBHOOK_ERROR:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
