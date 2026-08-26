import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import {
  Archivo,
  Inter,
  Lato,
  Noto_Sans_Arabic,
  Noto_Sans_Bengali,
  Noto_Sans_Devanagari,
  Noto_Sans_Ethiopic,
  Noto_Sans_Hebrew,
  Noto_Sans_Myanmar,
  Noto_Sans_Sinhala,
  Noto_Sans_Tamil,
  Noto_Sans_Thai,
  Playfair_Display,
} from "next/font/google";
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

// 900 is Archivo Black, which the About hero is set in. Without it the
// browser synthesises the weight from 800 and the outlined letterforms come
// out visibly thinner than the design.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext", "vietnamese"],
  weight: ["500", "600", "700", "800", "900"],
});

// The pull-quote face, and only that: an italic serif for the quoted line and
// the oversized quotation mark beside it. Two weights, no italics beyond the
// one the quote needs. Latin only — a locale outside that falls back to the
// body serif stack, which is the right outcome for a decorative face.
const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
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

// One Noto face per script the Asian and African locales need. Declaring a
// face costs a stylesheet entry, not a download — the browser only fetches the
// file once a `:lang()` rule in globals.css actually puts it in front of text.
// Skipping any of these is not a graceful degradation: Sinhala, Myanmar and
// Ethiopic have no system font on most desktops, so the page renders as tofu.
//
// These are all variable fonts, so they take no `weight` — passing one asks
// Google for a static file that does not exist and fails the build. Myanmar is
// the exception: it ships static weights only, so it has to name them.
const notoDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-devanagari",
  subsets: ["devanagari"],
});

const notoBengali = Noto_Sans_Bengali({
  variable: "--font-noto-bengali",
  subsets: ["bengali"],
});

const notoTamil = Noto_Sans_Tamil({
  variable: "--font-noto-tamil",
  subsets: ["tamil"],
});

const notoSinhala = Noto_Sans_Sinhala({
  variable: "--font-noto-sinhala",
  subsets: ["sinhala"],
});

const notoThai = Noto_Sans_Thai({
  variable: "--font-noto-thai",
  subsets: ["thai"],
});

const notoEthiopic = Noto_Sans_Ethiopic({
  variable: "--font-noto-ethiopic",
  subsets: ["ethiopic"],
});

const notoMyanmar = Noto_Sans_Myanmar({
  variable: "--font-noto-myanmar",
  subsets: ["myanmar"],
  weight: ["400", "500", "600", "700"],
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
      className={`${inter.variable} ${archivo.variable} ${lato.variable} ${playfair.variable} ${notoArabic.variable} ${notoHebrew.variable} ${notoDevanagari.variable} ${notoBengali.variable} ${notoTamil.variable} ${notoSinhala.variable} ${notoThai.variable} ${notoEthiopic.variable} ${notoMyanmar.variable} h-full antialiased`}
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
