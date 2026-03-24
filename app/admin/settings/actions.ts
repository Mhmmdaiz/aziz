"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * Securely updates site settings by verifying the user's admin role on the server.
 */
export async function updateSiteSettingsAction(settings: any) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    // Verify admin role in DB
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role?.toLowerCase() !== "admin") {
      return { success: false, error: "Forbidden: Admin role required" };
    }

    const adminSupabase = createAdminClient();
    
    const upsertData = Object.entries(settings).map(([key, value]) => ({
      key,
      value,
      updated_at: new Date().toISOString(),
    }));

    const { error } = await adminSupabase
      .from("site_settings")
      .upsert(upsertData, { onConflict: "key" });

    if (error) throw error;

    revalidatePath("/admin/settings");
    return { success: true };
  } catch (err: any) {
    console.error("updateSiteSettingsAction Error:", err);
    return { success: false, error: err.message };
  }
}
