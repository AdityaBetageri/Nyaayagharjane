import Link from "next/link";
import ArchivesView from "@/components/public/ArchivesView";
import { fetchR2Catalogue, r2ItemToEdition } from "@/lib/r2Service";
import { Edition } from "@/types";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ಹಿಂದಿನ ಸಂಚಿಕೆಗಳು (Archives) | ನ್ಯಾಯ ಘರ್ಜನೆ ಇ-ಪತ್ರಿಕೆ ಸಂಗ್ರಹ",
  description:
    "ನ್ಯಾಯ ಘರ್ಜನೆ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆಯ ಹಿಂದಿನ ಎಲ್ಲಾ ವರ್ಷವಾರು ಸಂಚಿಕೆಗಳ ಸಂಗ್ರಹ ಮತ್ತು ಆರ್ಕೈವ್. ಎಲ್ಲಾ ತಿಂಗಳ ಪತ್ರಿಕೆಗಳನ್ನು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಓದಿ ಮತ್ತು ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.",
  keywords: [
    "ನ್ಯಾಯ ಘರ್ಜನೆ ಹಿಂದಿನ ಸಂಚಿಕೆಗಳು",
    "Nyaayagharjane archives",
    "Nyaayagharjane old editions",
    "Kannada newspaper archive",
    "ಕನ್ನಡ ಪತ್ರಿಕೆ ಆರ್ಕೈವ್",
  ],
  alternates: {
    canonical: "/archives",
  },
  openGraph: {
    title: "ಹಿಂದಿನ ಸಂಚಿಕೆಗಳು | ನ್ಯಾಯ ಘರ್ಜನೆ ಇ-ಪತ್ರಿಕೆ",
    description: "ನ್ಯಾಯ ಘರ್ಜನೆ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆಯ ಹಿಂದಿನ ಎಲ್ಲಾ ವರ್ಷವಾರು ಸಂಚಿಕೆಗಳ ಸಂಗ್ರಹ.",
    url: "/archives",
    images: ["/opengraph-image"],
  },
};

export default async function ArchivesPage() {
  let allEditions: Edition[] = [];

  try {
    const res = await fetchR2Catalogue({ publishedOnly: true });
    if (res.success && res.data.length > 0) {
      allEditions = res.data.map(r2ItemToEdition);
    }
  } catch {
    // Graceful fallback
  }

  return (
    <div className="space-y-8 py-6 sm:py-8 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-[#5A6A85]">
        <Link href="/" className="hover:text-[#C62828] transition-colors">
          ಮುಖಪುಟ
        </Link>
        <span>/</span>
        <span className="text-[#172B4D] font-semibold">ಹಿಂದಿನ ಸಂಚಿಕೆಗಳು </span>
      </div>

      {/* Page Title & Intro */}
      <div className="border-b border-[#E2E8F0] pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-7 bg-[#C62828] rounded-full"></div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172B4D] tracking-tight">
            ಹಿಂದಿನ ಸಂಚಿಕೆಗಳ ಸಂಗ್ರಹಾಲಯ
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#5A6A85] mt-2 max-w-3xl leading-relaxed">
          ನ್ಯಾಯ ಘರ್ಜನೆ ಮಾಸಿಕ ಪತ್ರಿಕೆಯ ಪ್ರಾರಂಭದಿಂದ ಪ್ರಕಟವಾದ ಎಲ್ಲಾ ಸಂಚಿಕೆಗಳನ್ನು ಇಲ್ಲಿ ವರ್ಷವಾರು ಸುಲಭವಾಗಿ ಹುಡುಕಿ, ಓದಬಹುದು ಮತ್ತು ಉಚಿತವಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿಕೊಳ್ಳಬಹುದು.
        </p>
      </div>

      {/* Interactive Year Filter & Archive Cards */}
      <ArchivesView initialEditions={allEditions} />
    </div>
  );
}
