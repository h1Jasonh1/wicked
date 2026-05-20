import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import AppShell from "@/components/layout/AppShell";
import { loadProducts } from "@/lib/products";
import "./globals.css";

// Editorial type pairing used by the redesigned landing page, nav, and
// footer: a clean grotesque (Geist) for everything, with Instrument Serif
// reserved for the small italic accents. Exposed as CSS variables so the
// design-system modules can opt in without changing the rest of the app.
const geist = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-geist",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
  display: "swap",
});

export const metadata: Metadata = {
  title: "SOO | Premium Skincare With an Edge",
  description:
    "Shop SOO skincare: clean formulas, bold results, premium black packaging, and high-performance daily routines.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Catalogue read is cookie-less (public anon client) so the layout
  // doesn't drag every page into the dynamic-render path. Auth state
  // is hydrated on the client by AuthProvider — no SSR seed here.
  const products = await loadProducts();

  return (
    <html
      lang="en"
      className={`h-full antialiased ${geist.variable} ${instrumentSerif.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">
        <AppShell initialProducts={products} initialUser={null}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
