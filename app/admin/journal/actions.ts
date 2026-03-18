"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

// Initialize Supabase client with the SERVICE ROLE KEY to bypass RLS
// This is strictly for server-side admin actions only
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function saveArticleAction(dataToSave: any, editingArticleId: string | null = null) {
  if (editingArticleId) {
    const { error } = await supabaseAdmin
      .from("articles")
      .update(dataToSave)
      .eq("id", editingArticleId);

    if (error) {
      return { success: false, error: error.message };
    }
  } else {
    const { error } = await supabaseAdmin
      .from("articles")
      .insert([dataToSave]);

    if (error) {
      return { success: false, error: error.message };
    }
  }

  revalidatePath("/journal");
  revalidatePath("/admin/journal");
  return { success: true };
}

export async function deleteArticleAction(id: string) {
  const { error } = await supabaseAdmin
    .from("articles")
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }
  
  revalidatePath("/journal");
  revalidatePath("/admin/journal");
  return { success: true };
}
