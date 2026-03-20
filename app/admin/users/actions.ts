"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Gunakan SERVICE ROLE KEY agar bisa bypass RLS Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

/**
 * Update role user (customer / admin) - melewati RLS via service role
 */
export async function updateUserRoleAction(userId: string, newRole: string) {
  if (!["customer", "admin"].includes(newRole)) {
    return { success: false, error: "Role tidak valid." };
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ role: newRole, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("[updateUserRoleAction] error:", error.message);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Update status user (active / suspended) - melewati RLS via service role
 */
export async function updateUserStatusAction(userId: string, newStatus: string) {
  if (!["active", "suspended"].includes(newStatus)) {
    return { success: false, error: "Status tidak valid." };
  }

  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("[updateUserStatusAction] error:", error.message);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Update data profil user - melewati RLS via service role
 */
export async function updateUserProfileAction(userId: string, payload: {
  full_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  role?: string;
}) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    console.error("[updateUserProfileAction] error:", error.message);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

/**
 * Delete user - melewati RLS via service role
 */
export async function deleteUserAction(userId: string) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .delete()
    .eq("id", userId);

  if (error) {
    console.error("[deleteUserAction] error:", error.message);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/users");
  return { success: true };
}
