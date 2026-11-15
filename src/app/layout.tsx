import type { Metadata } from "next";
import { Noto_Sans_Kannada } from "next/font/google";
import "./globals.css";

const notoSansKannada = Noto_Sans_Kannada({
  subsets: ["kannada", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-kannada",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ನ್ಯಾಯಘರ್ಜನೆ | Kannada E-Paper",
  description: "ನ್ಯಾಯಘರ್ಜನೆ — ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="kn" className={`${notoSansKannada.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-neutral-50 text-neutral-900 antialiased">
        {children}
      </body>
    </html>
  );
}
