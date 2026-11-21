import type { Metadata, Viewport } from "next";
import { Noto_Sans_Kannada } from "next/font/google";
import "./globals.css";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

const notoSansKannada = Noto_Sans_Kannada({
  subsets: ["kannada", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-kannada",
  display: "swap",
});


export const viewport: Viewport = {
  themeColor: "#172B4D",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "ಆಡಳಿತ ಮಂಡಳಿ (Admin Portal) | ನ್ಯಾಯ ಘರ್ಜನೆ",
  description: "ನ್ಯಾಯ ಘರ್ಜನೆ ಇ-ಪತ್ರಿಕೆ ಆಡಳಿತ ವ್ಯವಸ್ಥೆ ಮತ್ತು ಪತ್ರಿಕಾ ನಿರ್ವಹಣೆ.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="kn" className={notoSansKannada.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@400;500;600;700;800&family=Noto+Serif+Kannada:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans bg-[#F1F3F5] text-neutral-900 min-h-screen">
        <AdminLayoutClient>{children}</AdminLayoutClient>
      </body>
    </html>
  );
}
