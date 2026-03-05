import "./globals.css";
import Navbar from "@/components/Navbar";
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Midtrans Snap Script */}
        <Script
          src="https://app.sandbox.midtrans.com/snap/snap.js" // Sandbox URL
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="beforeInteractive" // Load sebelum interaksi user
        />
      </head>
      <body className="antialiased bg-[#FBFBFD]">
        <Navbar />
        <main className="relative">{children}</main>
      </body>
    </html>
  );
}
