import Link from "next/link";
import ArchivesView from "@/components/public/ArchivesView";
import { PLACEHOLDER_LATEST_EDITION, PLACEHOLDER_PREVIOUS_EDITIONS } from "@/lib/constants";

export const metadata = {
  title: "ಹಿಂದಿನ ಸಂಚಿಕೆಗಳು (ಆರ್ಕೈವ್) | ನ್ಯಾಯಘರ್ಜನೆ ಇ-ಪತ್ರಿಕೆ",
  description: "ನ್ಯಾಯಘರ್ಜನೆ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆಯ ಹಿಂದಿನ ಎಲ್ಲಾ ವರ್ಷವಾರು ಸಂಚಿಕೆಗಳ ಸಂಗ್ರಹ ಮತ್ತು ಆರ್ಕೈವ್.",
};

export default function ArchivesPage() {
  // Combine all placeholder editions with latest edition first
  const allEditions = [PLACEHOLDER_LATEST_EDITION, ...PLACEHOLDER_PREVIOUS_EDITIONS];

  return (
    <div className="space-y-8 py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-[#5A6A85]">
        <Link href="/" className="hover:text-[#C62828] transition-colors">
          ಮುಖಪುಟ
        </Link>
        <span>/</span>
        <span className="text-[#172B4D] font-semibold">ಹಿಂದಿನ ಸಂಚಿಕೆಗಳು (ಆರ್ಕೈವ್)</span>
      </div>

      {/* Page Title & Intro */}
      <div className="border-b border-[#E2E8F0] pb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-7 bg-[#C62828] rounded-full"></div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172B4D] tracking-tight">
            ಹಿಂದಿನ ಸಂಚಿಕೆಗಳ ಸಂಗ್ರಹಾಲಯ (ಆರ್ಕೈವ್)
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#5A6A85] mt-2 max-w-3xl leading-relaxed">
          ನ್ಯಾಯಘರ್ಜನೆ ಮಾಸಿಕ ಪತ್ರಿಕೆಯ ಪ್ರಾರಂಭದಿಂದ ಪ್ರಕಟವಾದ ಎಲ್ಲಾ ಸಂಚಿಕೆಗಳನ್ನು ಇಲ್ಲಿ ವರ್ಷವಾರು ಸುಲಭವಾಗಿ ಹುಡುಕಿ, ಓದಬಹುದು ಮತ್ತು ಉಚಿತವಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿಕೊಳ್ಳಬಹುದು.
        </p>
      </div>

      {/* Interactive Year Filter & Archive Cards */}
      <ArchivesView initialEditions={allEditions} />
    </div>
  );
}
