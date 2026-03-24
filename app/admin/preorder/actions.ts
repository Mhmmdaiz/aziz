"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * Verify if the current user has an admin role.
 */
async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role?.toLowerCase() !== "admin") {
    throw new Error("Forbidden: Admin role required");
  }

  return user;
}

export async function createPreorderProductAction(productData: any, preorderValue: any) {
  try {
    await verifyAdmin();
    const adminSupabase = createAdminClient();

    // 1. Insert Product
    const { data: product, error: pError } = await adminSupabase
      .from("products")
      .insert(productData)
      .select()
      .single();

    if (pError) throw pError;

    // 2. Update Preorder settings with new product_id
    const updatedPreorder = { ...preorderValue, product_id: product.id };
    const { error: sError } = await adminSupabase
      .from("site_settings")
      .upsert({ key: "preorder", value: updatedPreorder }, { onConflict: "key" });

    if (sError) throw sError;

    revalidatePath("/admin/preorder");
    return { success: true, product };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updatePreorderProductAction(productId: string, productUpdate: any, preorderUpdate: any) {
  try {
    await verifyAdmin();
    const adminSupabase = createAdminClient();

    // 1. Update Product
    const { error: pError } = await adminSupabase
      .from("products")
      .update(productUpdate)
      .eq("id", productId);

    if (pError) throw pError;

    // 2. Update Preorder settings
    const { error: sError } = await adminSupabase
      .from("site_settings")
      .update({ value: preorderUpdate })
      .eq("key", "preorder");

    if (sError) throw sError;

    revalidatePath("/admin/preorder");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateLandingContentAction(updates: { key: string, value: any }[]) {
  try {
    await verifyAdmin();
    const adminSupabase = createAdminClient();

    const upsertData = updates.map(u => ({
      ...u,
      updated_at: new Date().toISOString()
    }));

    const { error } = await adminSupabase
      .from("site_settings")
      .upsert(upsertData, { onConflict: "key" });

    if (error) throw error;

    revalidatePath("/admin/preorder");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function updateLegalContentAction(legalData: any) {
  try {
    await verifyAdmin();
    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from("site_settings")
      .update({ value: legalData })
      .eq("key", "legal_content");

    if (error) throw error;

    revalidatePath("/admin/preorder");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
