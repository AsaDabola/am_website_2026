import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Archivo, Inter, Lato } from "next/font/google";
import "../globals.css";
import { routing } from "@/i18n/routing";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CountrySuggestionBanner from "@/components/layout/CountrySuggestionBanner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

// The "Following the Legacy of" line in the Ralph D. Winter banner is
// specified as Lato Light Italic in the design; nothing else uses it.
const lato = Lato({
  variable: "--font-lato",
  subsets: ["latin"],
  weight: ["300"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "Apostolos Missions International | AM",
  description:
    "Apostolos Missions International (AM) is an interdenominational ministry raising up students to preach Jesus and Him crucified across university campuses worldwide.",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enables static rendering for this locale.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${inter.variable} ${archivo.variable} ${lato.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white font-sans text-ink">
        <NextIntlClientProvider>
          <AnnouncementBar />
          <Header />
          <CountrySuggestionBanner />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
