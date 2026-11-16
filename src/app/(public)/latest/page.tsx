import Link from "next/link";
import LatestEditionHero from "@/components/public/LatestEditionHero";
import { PLACEHOLDER_LATEST_EDITION, PLACEHOLDER_PREVIOUS_EDITIONS } from "@/lib/constants";
import EditionCard from "@/components/shared/EditionCard";
import { fetchR2Catalogue, r2ItemToEdition } from "@/lib/r2Service";
import { Edition } from "@/types";

export const metadata = {
  title: "ಇತ್ತೀಚಿನ ಪತ್ರಿಕೆ | ನ್ಯಾಯಘರ್ಜನೆ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ",
  description: "ನ್ಯಾಯಘರ್ಜನೆ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆಯ ಇತ್ತೀಚಿನ ಪ್ರಕಟಿತ ಸಂಚಿಕೆ.",
};

export default async function LatestEditionPage() {
  let edition: Edition = PLACEHOLDER_LATEST_EDITION;
  let previousEditions: Edition[] = PLACEHOLDER_PREVIOUS_EDITIONS;
  let isR2Connected = false;

  try {
    const res = await fetchR2Catalogue({ bypassCache: false, publishedOnly: true });
    if (res.success && res.data.length > 0) {
      edition = r2ItemToEdition(res.data[0]);
      if (res.data.length > 1) {
        previousEditions = res.data.slice(1, 5).map(r2ItemToEdition);
      }
      isR2Connected = true;
    }
  } catch {
    // Graceful fallback to static
  }

  return (
    <div className="space-y-10 py-6 sm:py-8 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
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
            ನ್ಯಾಯಘರ್ಜನೆ ಮಾಸಿಕ ಪತ್ರಿಕೆಯ ಪ್ರಸ್ತುತ ಸಂಚಿಕೆಯ ಮಾಹಿತಿ ಮತ್ತು ಡಿಜಿಟಲ್ ವಾಚಕ
            {isR2Connected ? " (Cloudflare R2 ಅಧಿಕೃತ ವಿತರಣೆ)" : " (ಮಾದರಿ ಮುನ್ನೋಟ / Preview)"}
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
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
              isR2Connected
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : "bg-amber-100 text-amber-800 border-amber-200"
            }`}
          >
            {isR2Connected ? "ಪ್ರಕಟಿತ" : "ಮಾದರಿ ಮುನ್ನೋಟ"}
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
            <span className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
              ಪುಟ ೫ - ೧೦
            </span>
            <h3 className="text-sm font-bold text-[#172B4D]">
              ಸಮಾಜ, ಕಾನೂನು ಮತ್ತು ಜನಹಿತ ವರದಿಗಳು
            </h3>
            <p className="text-xs text-[#5A6A85] leading-relaxed">
              ಸಾಮಾನ್ಯ ಜನರ ಹಕ್ಕುಗಳು, ಕಾನೂನು ಜಾಗೃತಿ, ಭ್ರಷ್ಟಾಚಾರ ವಿರೋಧಿ ಹೋರಾಟಗಳು ಮತ್ತು ನಾಗರಿಕ ಸಮಸ್ಯೆಗಳ ಕುರಿತ ವಿಶೇಷ ವರದಿ.
            </p>
          </div>

          <div className="p-4 bg-[#F8F9FA] rounded-lg border border-[#E2E8F0] space-y-2">
            <span className="text-xs font-bold text-[#5A6A85] uppercase tracking-wider">
              ಪುಟ ೧೧ - ೧೬
            </span>
            <h3 className="text-sm font-bold text-[#172B4D]">
              ಕೃಷಿ, ಪರಿಸರ & ಸಾಹಿತ್ಯ ಅಂಕಣ
            </h3>
            <p className="text-xs text-[#5A6A85] leading-relaxed">
              ರೈತರ ಸವಾಲುಗಳು, ಕೃಷಿ ಕ್ಷೇತ್ರದ ನವೀನ ಆವಿಷ್ಕಾರಗಳು, ಪರಿಸರ ಕಾಳಜಿ ಮತ್ತು ಪ್ರಚಲಿತ ಸಾಹಿತ್ಯ ಚಿಂತನೆಗಳ ಸಾರಸಂಗ್ರಹ.
            </p>
          </div>
        </div>
      </section>

      {/* Previous Editions Showcase */}
      <section className="space-y-6 pt-4">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#172B4D]">
              ಹಿಂದಿನ ಇತರ ಸಂಚಿಕೆಗಳು
            </h2>
            <p className="text-xs text-[#5A6A85] mt-1">
              ನ್ಯಾಯಘರ್ಜನೆಯ ಈ ಹಿಂದಿನ ಆವೃತ್ತಿಗಳನ್ನು ಸಹ ನೀವು ಇಲ್ಲಿ ವೀಕ್ಷಿಸಬಹುದು.
            </p>
          </div>
          <Link
            href="/archives"
            className="text-xs sm:text-sm font-bold text-[#C62828] hover:underline"
          >
            ಎಲ್ಲವನ್ನೂ ನೋಡಿ &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {previousEditions.map((prevEdition) => (
            <EditionCard
              key={prevEdition.id}
              edition={prevEdition}
              isPlaceholder={!prevEdition.pdfUrl || !prevEdition.pdfUrl.startsWith("http")}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
