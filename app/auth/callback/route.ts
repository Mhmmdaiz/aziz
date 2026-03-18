import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/shop";

  if (code) {
    const cookieStore = await cookies();

    // Inisialisasi response agar kita bisa set cookies di header
    const response = NextResponse.redirect(`${origin}${next}`);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            // Kita set ke cookieStore DAN response sekaligus
            cookieStore.set({ name, value, ...options });
            response.cookies.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: "", ...options });
            response.cookies.set({ name, value: "", ...options });
          },
        },
      },
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Cek profile
        let { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .single();

        // Jika user baru via OAuth (Google), buatkan profilenya otomatis
        if (!profile) {
          const { data: newProfile } = await supabase
            .from("profiles")
            .upsert(
              {
                id: user.id,
                email: user.email,
                full_name:
                  user.user_metadata?.full_name ||
                  user.user_metadata?.name ||
                  user.email?.split("@")[0],
                role: "customer",
                updated_at: new Date().toISOString(),
              },
              { onConflict: "id" },
            )
            .select()
            .single();

          profile = newProfile;
        }

        // REDIRECT LOGIC
        if (profile?.role?.toLowerCase() === "admin") {
          return NextResponse.redirect(`${origin}/admin/dashboard`);
        }

        // Kembalikan response yang sudah berisi cookies session
        return response;
      }
    }
  }

  // Jika gagal, balik ke login dengan pesan error
  return NextResponse.redirect(`${origin}/auth?error=auth_failed`);
}
