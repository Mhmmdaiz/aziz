import "./globals.css";
import Navbar from "@/components/Navbar";
import SideCart from "@/components/cart/SideCart";
import SearchDrawer from "@/components/search/SearchDrawer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { CartProvider } from "@/components/providers/CartProvider";
import Script from "next/script";
import DynamicStyle from "@/components/DynamicStyle";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: {
    default: "DAEMONIUM | Art of Streetwear",
    template: "%s | DAEMONIUM"
  },
  description: "Non-conformist streetwear. Architectural precision meets brutalist aesthetics. Engineered for the elite by CHCKT.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://chckt-store.vercel.app'),
  openGraph: {
    title: "DAEMONIUM | Art of Streetwear",
    description: "Architectural precision meets brutalist aesthetics. Engineered for the elite.",
    url: "/",
    siteName: "DAEMONIUM",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "DAEMONIUM Premium Streetwear",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DAEMONIUM | Brutalist Streetwear",
    description: "Engineered for the elite.",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
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
            <SideCart />
            <SearchDrawer />
            <main className="flex-1 w-full">
              {children}
            </main>
            <Footer />
            </ThemeProvider>
          </CartProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}