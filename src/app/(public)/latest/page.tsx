import Link from "next/link";
import LatestEditionHero from "@/components/public/LatestEditionHero";
import { PLACEHOLDER_LATEST_EDITION, PLACEHOLDER_PREVIOUS_EDITIONS } from "@/lib/constants";
import EditionCard from "@/components/shared/EditionCard";

export default function LatestEditionPage() {
  const edition = PLACEHOLDER_LATEST_EDITION;

  return (
    <div className="space-y-10 py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs text-[#5A6A85]">
        <Link href="/" className="hover:text-[#C62828] transition-colors">
          ಮುಖಪುಟ
        </Link>
        <span>/</span>
        <span className="text-[#172B4D] font-semibold">ಇತ್ತೀಚಿನ ಪತ್ರಿಕೆ</span>
      </div>

      {/* Main Latest Edition Section */}
      <div className="space-y-4">
        <div className="border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-[#C62828] rounded-full shrink-0"></div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#172B4D] tracking-tight">
              ಇತ್ತೀಚಿನ ಆವೃತ್ತಿ — {edition.formattedDate}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#5A6A85] mt-1">
            ನ್ಯಾಯಘರ್ಜನೆ ಮಾಸಿಕ ಪತ್ರಿಕೆಯ ಪ್ರಸ್ತುತ ಸಂಚಿಕೆಯ ಮಾಹಿತಿ ಮತ್ತು ಡಿಜಿಟಲ್ ವಾಚಕ (ಮಾದರಿ ಮುನ್ನೋಟ / Preview)
          </p>
        </div>

        {/* Hero component */}
        <LatestEditionHero edition={edition} showAllButtons={false} />
      </div>

      {/* What's Inside This Edition Summary */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <h2 className="text-base sm:text-lg font-bold text-[#172B4D]">
            ಈ ಸಂಚಿಕೆಯ ಪ್ರಮುಖ ಮುಖ್ಯಾಂಶಗಳು
          </h2>
          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
            ಮಾದರಿ ಮುನ್ನೋಟ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E2E8F0] space-y-2">
            <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">
              ಪುಟ ೧ - ೪
            </span>
            <h3 className="text-sm font-bold text-[#172B4D]">
              ರಾಜ್ಯ ಮಟ್ಟದ ಪ್ರಮುಖ ವಿದ್ಯಮಾನಗಳು
            </h3>
            <p className="text-xs text-[#5A6A85] leading-relaxed">
              ರಾಜ್ಯದ ಆಡಳಿತ, ಜನಪರ ಯೋಜನೆಗಳು ಹಾಗೂ ಪ್ರಸ್ತುತ ರಾಜಕೀಯ ಮತ್ತು ಸಾಮಾಜಿಕ ಬೆಳವಣಿಗೆಗಳ ವಿವರವಾದ ವಿಶ್ಲೇಷಣೆ.
            </p>
          </div>

          <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E2E8F0] space-y-2">
            <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">
              ಪುಟ ೫ - ೧೦
            </span>
            <h3 className="text-sm font-bold text-[#172B4D]">
              ವಿಶೇಷ ತನಿಖಾ ವರದಿ & ಸಂಪಾದಕೀಯ
            </h3>
            <p className="text-xs text-[#5A6A85] leading-relaxed">
              ಜನಸಾಮಾನ್ಯರ ಸಮಸ್ಯೆಗಳ ಮೇಲೆ ಬೆಳಕು ಚೆಲ್ಲುವ ತನಿಖಾ ಲೇಖನಗಳು ಹಾಗೂ ಪ್ರಖರ ವಿಚಾರಧಾರೆಗಳ ಸಂಪಾದಕೀಯ ಪುಟ.
            </p>
          </div>

          <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E2E8F0] space-y-2">
            <span className="text-xs font-bold text-[#C62828] uppercase tracking-wider">
              ಪುಟ ೧೧ - ೧೬
            </span>
            <h3 className="text-sm font-bold text-[#172B4D]">
              ಕೃಷಿ, ಕಲೆ, ಸಾಹಿತ್ಯ & ಜಿಲ್ಲಾ ಸಮಾಚಾರ
            </h3>
            <p className="text-xs text-[#5A6A85] leading-relaxed">
              ಕರ್ನಾಟಕದ ವಿವಿಧ ಜಿಲ್ಲೆಗಳ ಸ್ಥಳೀಯ ಸಮಾಚಾರ, ಕೃಷಿ ಚಿಂತನೆಗಳು ಮತ್ತು ಯುವ ಬರಹಗಾರರ ಸಾಹಿತ್ಯಿಕ ಅಂಕಣಗಳು.
            </p>
          </div>
        </div>
      </section>

      {/* Other Recent Editions */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <h2 className="text-xl font-bold text-[#172B4D]">
            ಇತರ ಇತ್ತೀಚಿನ ಆವೃತ್ತಿಗಳು (ಮಾದರಿಗಳು)
          </h2>
          <Link
            href="/archives"
            className="text-xs sm:text-sm font-semibold text-[#C62828] hover:underline"
          >
            ಸಂಪೂರ್ಣ ಆರ್ಕೈವ್
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PLACEHOLDER_PREVIOUS_EDITIONS.slice(0, 3).map((item) => (
            <EditionCard key={item.id} edition={item} isPlaceholder={true} />
          ))}
        </div>
      </section>
    </div>
  );
}
