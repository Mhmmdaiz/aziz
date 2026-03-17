import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import Script from "next/script";
import DynamicStyle from "@/components/DynamicStyle";

export const metadata = {
  title: "CHCKT.STORE",
  description: "Premium brutalist streetwear — engineered for the modern silhouette.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google" content="notranslate" />
        <DynamicStyle />
        <Script
          src={process.env.NEXT_PUBLIC_MIDTRANS_SNAP_URL || "https://app.sandbox.midtrans.com/snap/snap.js"}
          data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
          strategy="beforeInteractive"
        />
      </head>

      <body className="antialiased min-h-screen flex flex-col bg-white dark:bg-[#030303] text-[#1D1D1F] dark:text-zinc-100 transition-colors duration-300">
        <SettingsProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            <Navbar />
            <main className="flex-1 w-full">
              {children}
            </main>
          </ThemeProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}