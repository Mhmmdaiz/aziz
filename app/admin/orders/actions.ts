"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Initialize Supabase client with the SERVICE ROLE KEY to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function updateOrderStatusAction(orderId: string, newStatus: string) {
  const { error } = await supabaseAdmin
    .from("orders")
    .update({ status: newStatus })
    .eq("id", orderId);

  if (error) {
    return { success: false, error: error.message };
  }

  // Force Next.js cache to update
  revalidatePath("/admin/orders");
  return { success: true };
}
