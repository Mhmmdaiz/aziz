import { createBrowserClient } from "@supabase/ssr";

// Pakai createBrowserClient dari @supabase/ssr
// supaya session disimpan di COOKIES (bisa dibaca middleware SSR),
// bukan localStorage (tidak bisa dibaca server/middleware)
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
