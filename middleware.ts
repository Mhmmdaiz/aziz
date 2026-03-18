import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // 1. Inisialisasi response awal
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Setup Supabase Client untuk Middleware
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Update request dan response cookies agar session sinkron
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    },
  );

  // 3. Cek User (Ini penting untuk me-refresh session jika perlu)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // DEBUG LOGS (Bisa dihapus jika sudah lancar)
  if (request.nextUrl.pathname.startsWith("/api")) {
    console.log(`MIDDLEWARE_API_CHECK: ${request.nextUrl.pathname} - User: ${user?.id || "NULL"}`);
  }

  const url = request.nextUrl.clone();

  // 0. Intercept OAuth Redirect to root
  if (url.pathname === "/" && url.searchParams.has("code")) {
    url.pathname = "/auth/callback";
    return NextResponse.redirect(url);
  }

  // 4. PROTEKSI: Jika ke /admin tapi BELUM LOGIN
  if (url.pathname.startsWith("/admin") && !user) {
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  // 5. PROTEKSI: Jika LOGIN tapi BUKAN ADMIN
  if (url.pathname.startsWith("/admin") && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role?.toLowerCase() !== "admin") {
      url.pathname = "/shop";
      return NextResponse.redirect(url);
    }
  }

  // 6. OPSIONAL: Jika sudah login tapi coba buka page /auth (Login page)
  if (url.pathname === "/auth" && user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    url.pathname = profile?.role === "admin" ? "/admin/dashboard" : "/shop";
    return NextResponse.redirect(url);
  }

  return response;
}

// 7. Matcher: Jalankan middleware ini untuk folder admin, page auth, dan API
export const config = {
  matcher: ["/", "/admin/:path*", "/auth", "/auth/callback", "/api/:path*"],
};
