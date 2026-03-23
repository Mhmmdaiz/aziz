import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { name, email, message } = await request.json();

    // Validasi sederhana
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Semua kolom (Nama, Email, Pesan) wajib diisi." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Simpan ke tabel contact_submissions
    const { error } = await supabase
      .from("contact_submissions")
      .insert([
        {
          name,
          email,
          message,
          status: "unread",
        },
      ]);

    if (error) {
      console.error("Supabase Error:", error);
      return NextResponse.json(
        { error: "Gagal menyimpan pesan. Pastikan tabel 'contact_submissions' sudah dibuat." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Pesan Anda telah terkirim. Terima kasih!" },
      { status: 200 }
    );
  } catch (err) {
    console.error("API Error:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
