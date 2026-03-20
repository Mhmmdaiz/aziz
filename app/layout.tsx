import "./globals.css";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import Script from "next/script";
import DynamicStyle from "@/components/DynamicStyle";

export const metadata = {
  title: "DAEMONIUM",
  description: "Non-conformist streetwear. Architectural precision meets brutalist aesthetics. Engineered for the elite.",
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
      </head>

      <body className="antialiased min-h-screen flex flex-col bg-white dark:bg-[#030303] text-[#1D1D1F] dark:text-zinc-100 transition-colors duration-300 overflow-x-hidden">
        <SettingsProvider>
          <CartProvider>
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
          </CartProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}