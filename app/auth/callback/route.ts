import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Default redirect jika bukan admin
  const next = searchParams.get("next") ?? "/shop";

  if (code) {
    // 1. WAJIB: Gunakan await pada cookies() untuk Next.js 15+
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
          },
        },
      },
    );

    // 2. Tukar code dengan session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // 3. Ambil data user yang baru saja login
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // 4. Ambil role dari tabel profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        // 5. Logic Redirect Admin
        if (profile?.role?.toLowerCase() === "admin") {
          return NextResponse.redirect(`${origin}/admin/dashboard`);
        }
      }

      // Jika user biasa atau profile tidak ditemukan, lempar ke rute 'next'
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Jika tidak ada code atau terjadi error autentikasi, balikkan ke login
  // Tambahkan query param error untuk memberi tahu UI
  return NextResponse.redirect(`${origin}/auth?error=auth_failed`);
}
