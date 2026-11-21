import type { Metadata, Viewport } from "next";
import { Noto_Sans_Kannada } from "next/font/google";
import "./globals.css";
import {
  getSiteUrl,
  SITE_CONFIG,
  generateOrganizationSchema,
  generateWebSiteSchema,
} from "@/lib/siteConfig";

const notoSansKannada = Noto_Sans_Kannada({
  subsets: ["kannada", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-kannada",
  display: "swap",
});

const siteUrl = getSiteUrl();

export const viewport: Viewport = {
  themeColor: "#C62828",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "ನ್ಯಾಯ ಘರ್ಜನೆ | ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ | Kannada Monthly E-Newspaper",
    template: "%s | ನ್ಯಾಯ ಘರ್ಜನೆ (Nyaayagharjane)",
  },
  description: SITE_CONFIG.description,
  keywords: SITE_CONFIG.keywords,
  authors: [
    { name: "ನ್ಯಾಯ ಘರ್ಜನೆ ಸಂಪಾದಕೀಯ ಮಂಡಳಿ", url: siteUrl },
    { name: "Nyaayagharjane Editorial Team", url: siteUrl },
  ],
  creator: "Nyaayagharjane Publications",
  publisher: "ನ್ಯಾಯ ಘರ್ಜನೆ ಪ್ರಕಾಶನ",
  applicationName: "ನ್ಯಾಯ ಘರ್ಜನೆ ಇ-ಪತ್ರಿಕೆ",
  generator: "Next.js",
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
  alternates: {
    canonical: "/",
    languages: {
      "kn-IN": "/",
      "kn": "/",
      "en-IN": "/",
      "en": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "kn_IN",
    alternateLocale: ["en_IN"],
    url: siteUrl,
    siteName: "ನ್ಯಾಯ ಘರ್ಜನೆ (Nyaayagharjane)",
    title: "ನ್ಯಾಯ ಘರ್ಜನೆ | ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ | Kannada Monthly E-Newspaper",
    description: SITE_CONFIG.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ನ್ಯಾಯ ಘರ್ಜನೆ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ (Nyaayagharjane E-Paper)",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ನ್ಯಾಯ ಘರ್ಜನೆ | ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ",
    description: SITE_CONFIG.description,
    creator: "@nyaayagharjane",
    images: ["/opengraph-image"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "news",
  classification: "Newspaper, Journalism, Media, Kannada News",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo-192.png", sizes: "192x192", type: "image/png" },
      { url: "/logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/logo-192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const webSiteSchema = generateWebSiteSchema();

  return (
    <html lang="kn" className={`${notoSansKannada.variable} h-full antialiased`}>
      <head>
        {/* Kannada Typography - Noto Sans Kannada & Noto Serif Kannada */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@400;500;600;700;800&family=Noto+Serif+Kannada:wght@400;600;700&display=swap"
          rel="stylesheet"
        />

        {/* JSON-LD Structured Data: NewsMediaOrganization & WebSite */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
        />
        {/* Favicon & Theme */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className="min-h-full flex flex-col font-sans bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
