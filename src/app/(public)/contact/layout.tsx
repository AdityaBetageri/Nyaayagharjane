import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ಸಂಪರ್ಕಿಸಿ (Contact Us) | ನ್ಯಾಯಘರ್ಜನೆ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ",
  description:
    "ನ್ಯಾಯಘರ್ಜನೆ ಪತ್ರಿಕಾ ಕಚೇರಿ ಸಂಪರ್ಕ ವಿಳಾಸ, ಸಂಪಾದಕೀಯ ಮಂಡಳಿ, ಜಾಹೀರಾತು ಮತ್ತು ವರದಿಗಳಿಗಾಗಿ ಸಂಪರ್ಕಿಸಿ. ಮಂಗಳೂರು ಮತ್ತು ಕರ್ನಾಟಕ ಕಚೇರಿ ವಿವರಗಳು.",
  keywords: [
    "ನ್ಯಾಯಘರ್ಜನೆ ಸಂಪರ್ಕ",
    "Contact Nyaayagharjane",
    "Nyaayagharjane address",
    "Nyaayagharjane phone email",
    "ನ್ಯಾಯಘರ್ಜನೆ ಕಚೇರಿ",
  ],
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "ಸಂಪರ್ಕಿಸಿ | ನ್ಯಾಯಘರ್ಜನೆ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ",
    description: "ನ್ಯಾಯಘರ್ಜನೆ ಪತ್ರಿಕಾ ಕಚೇರಿ ಸಂಪರ್ಕ ವಿಳಾಸ, ಸಂಪಾದಕೀಯ ಮಂಡಳಿ ಮತ್ತು ಜಾಹೀರಾತು ವಿವರಗಳು.",
    url: "/contact",
    images: ["/opengraph-image"],
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
