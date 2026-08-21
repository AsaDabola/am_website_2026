import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Archivo, Inter, Lato, Noto_Sans_Arabic, Noto_Sans_Hebrew } from "next/font/google";
import "../globals.css";
import { routing, directionOf } from "@/i18n/routing";
import AnnouncementBar from "@/components/layout/AnnouncementBar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CountrySuggestionBanner from "@/components/layout/CountrySuggestionBanner";

// Subsets have to cover every script the site ships in, or the browser
// silently falls back to a system font mid-page. Inter carries Latin, Cyrillic
// and Greek; Archivo has no Cyrillic or Greek, so the display face falls back
// for Russian, Ukrainian and Greek headings. Arabic and Hebrew have no
// coverage in either, hence the Noto faces below.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext", "cyrillic", "greek", "vietnamese"],
});

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["500", "600", "700", "800"],
});

// Arabic, Hebrew and Urdu. Urdu is conventionally set in Nastaliq, but that
// script needs far more vertical room than this layout gives a line, so it
// gets the same naskh face as Arabic — readable, and it fits the design.
const notoArabic = Noto_Sans_Arabic({
  variable: "--font-noto-arabic",
  subsets: ["arabic"],
});

const notoHebrew = Noto_Sans_Hebrew({
  variable: "--font-noto-hebrew",
  subsets: ["hebrew"],
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
      dir={directionOf(locale)}
      className={`${inter.variable} ${archivo.variable} ${lato.variable} ${notoArabic.variable} ${notoHebrew.variable} h-full antialiased`}
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
