import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartProvider";
import ThemeProvider from "@/components/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "PLANETATAPETA | Oživite Tvoje Ideje",
  description: "Premium foto tapete, slike na platnu i pleksiglasu — vrhunski kvalitet štampe.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="sr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <CartProvider>
          <ThemeProvider>
            <div className="gradient-bg">
              <Header />
              <main className="pt-24 min-h-screen relative z-10">
                {children}
              </main>
              <Footer />
            </div>
          </ThemeProvider>
        </CartProvider>
      </body>
    </html>
  );
}
