import Link from "next/link";
import { Shield, BookOpen, HeartHandshake, Award } from "lucide-react";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ನಮ್ಮ ಬಗ್ಗೆ (About Us) | ನ್ಯಾಯ ಘರ್ಜನೆ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ",
  description:
    "ನ್ಯಾಯ ಘರ್ಜನೆ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆಯ ಪರಿಚಯ, ಧ್ಯೇಯೋದ್ದೇಶ, ಸಂಪಾದಕೀಯ ಮೌಲ್ಯಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿಯ ಪತ್ರಿಕೋದ್ಯಮ ಬದ್ಧತೆ. ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ.",
  keywords: [
    "ನ್ಯಾಯ ಘರ್ಜನೆ ನಮ್ಮ ಬಗ್ಗೆ",
    "About Nyaayagharjane",
    "Nyaayagharjane history",
    "Kannada journalism Karnataka",
    "ನ್ಯಾಯ ಘರ್ಜನೆ ಸಂಪಾದಕೀಯ",
  ],
  alternates: {
    canonical: "/about",
  },
  openGraph: {
    title: "ನಮ್ಮ ಬಗ್ಗೆ | ನ್ಯಾಯ ಘರ್ಜನೆ ಇ-ಪತ್ರಿಕೆ",
    description: "ನ್ಯಾಯ ಘರ್ಜನೆ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆಯ ಪರಿಚಯ, ಧ್ಯೇಯೋದ್ದೇಶ ಮತ್ತು ಸಂಪಾದಕೀಯ ಮೌಲ್ಯಗಳು.",
    url: "/about",
    images: ["/opengraph-image"],
  },
};

export default function AboutPage() {
  return (
    <div className="space-y-12 py-6 sm:py-8 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-[#5A6A85]">
        <Link href="/" className="hover:text-[#C62828] transition-colors">
          ಮುಖಪುಟ
        </Link>
        <span>/</span>
        <span className="text-[#172B4D] font-semibold">ನಮ್ಮ ಬಗ್ಗೆ</span>
      </div>

      {/* Hero Section */}
      <section className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 lg:p-12 shadow-xs space-y-6">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#C62828] text-xs font-semibold">
            <Shield className="w-3.5 h-3.5" />
            <span>ಪತ್ರಿಕೆಯ ಪರಿಚಯ & ಇತಿಹಾಸ</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#172B4D] tracking-tight">
            ನ್ಯಾಯ ಘರ್ಜನೆ
          </h1>

          <p className="text-lg sm:text-xl font-bold text-[#C62828]">
            ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ
          </p>

          <p className="text-sm sm:text-base text-[#5A6A85] leading-relaxed">
            ಕರ್ನಾಟಕದ ಹೆಮ್ಮೆಯ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆಯಾಗಿ ಹೊರಹೊಮ್ಮುತ್ತಿರುವ <strong>ನ್ಯಾಯ ಘರ್ಜನೆ</strong>, ಸಮಾಜದ ಕಟ್ಟಕಡೆಯ ವ್ಯಕ್ತಿಯ ಧ್ವನಿಯಾಗಲು ಮತ್ತು ನ್ಯಾಯಯುತ ಸಮಾಜ ನಿರ್ಮಾಣಕ್ಕಾಗಿ ಸದಾ ಬದ್ಧವಾಗಿದೆ. ಭ್ರಷ್ಟಾಚಾರ, ಅನ್ಯಾಯ, ಶೋಷಣೆ ಮತ್ತು ಆಡಳಿತಾತ್ಮಕ ವೈಫಲ್ಯಗಳ ವಿರುದ್ಧ ನಿರ್ಭೀತವಾಗಿ ಸತ್ಯವನ್ನು ಜನರೆದುರು ಇಡುವುದು ನಮ್ಮ ಪತ್ರಿಕೋದ್ಯಮದ ಮೂಲಮಂತ್ರ.
          </p>
        </div>
      </section>

      {/* Core Principles / Values */}
      <section className="space-y-6">
        <div className="border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-[#C62828] rounded-full"></div>
            <h2 className="text-xl sm:text-2xl font-black text-[#172B4D] tracking-tight">
              ನಮ್ಮ ಪತ್ರಿಕಾ ಮೌಲ್ಯಗಳು & ತತ್ವಗಳು
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#5A6A85] mt-1">
            ನಾವು ಅನುಸರಿಸುವ ಉನ್ನತ ಪತ್ರಿಕೋದ್ಯಮ ಮಾನದಂಡಗಳು
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-[#C62828] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#172B4D]">೧. ಸತ್ಯನಿಷ್ಠತೆ</h3>
            <p className="text-xs text-[#5A6A85] leading-relaxed">
              ವದಂತಿಗಳಿಗೆ ಆಸ್ಪದವಿಲ್ಲದೆ, ತಳಮಟ್ಟದ ಸಾಕ್ಷ್ಯಾಧಾರಗಳ ಆಧಾರದ ಮೇಲೆ ಮಾತ್ರ ಸತ್ಯ ಸುದ್ದಿಯನ್ನು ಸಾರ್ವಜನಿಕರಿಗೆ ತಲುಪಿಸುತ್ತೇವೆ.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#172B4D] flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#172B4D]">೨. ನಿಷ್ಪಕ್ಷಪಾತ ವರದಿಗಾರಿಕೆ</h3>
            <p className="text-xs text-[#5A6A85] leading-relaxed">
              ಯಾವುದೇ ರಾಜಕೀಯ ಪಕ್ಷ, ಜಾತಿ, ಮತ ಅಥವಾ ವ್ಯಾಪಾರಿ ಹಿತಾಸಕ್ತಿಗಳಿಗೆ ಮಣಿಯದೆ ಸದಾ ತಟಸ್ಥ ಹಾಗೂ ನ್ಯಾಯದ ಪರವಾಗಿ ನಿಲ್ಲುತ್ತೇವೆ.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#172B4D]">೩. ಜನಪರ ನಿಲುವು</h3>
            <p className="text-xs text-[#5A6A85] leading-relaxed">
              ರೈತರು, ಕಾರ್ಮಿಕರು, ವಿದ್ಯಾರ್ಥಿಗಳು, ಮಹಿಳೆಯರು ಮತ್ತು ದುರ್ಬಲ ವರ್ಗದವರ ಹಕ್ಕುಗಳು ಮತ್ತು ಸಂಕಷ್ಟಗಳಿಗೆ ಆದ್ಯತೆ ನೀಡುತ್ತೇವೆ.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#172B4D]">೪. ಡಿಜಿಟಲ್ ಪಾರದರ್ಶಕತೆ</h3>
            <p className="text-xs text-[#5A6A85] leading-relaxed">
              ಪ್ರತಿ ತಿಂಗಳ ಪತ್ರಿಕೆಯನ್ನು ಉಚಿತವಾಗಿ ಡಿಜಿಟಲ್ ಫ್ಲಿಪ್‌ಬುಕ್ ಹಾಗೂ ಪಿಡಿಎಫ್ ಮುಖಾಂತರ ಎಲ್ಲರಿಗೂ ಮುಕ್ತವಾಗಿ ತಲುಪಿಸುವುದು.
            </p>
          </div>
        </div>
      </section>

      {/* Editorial Mission Statement Box */}
      <section className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-black text-[#172B4D]">
              ಸಂಪಾದಕರ ಸಂದೇಶ & ಧ್ಯೇಯೋದ್ದೇಶ
            </h2>
            <p className="text-sm text-[#5A6A85] leading-relaxed">
              &quot;ಪತ್ರಿಕೋದ್ಯಮ ಕೇವಲ ಸುದ್ದಿಗಳನ್ನು ಪ್ರಸಾರ ಮಾಡುವ ಸಾಧನವಲ್ಲ; ಅದು ಜನತಂತ್ರದ ನಾಲ್ಕನೇ ಸ್ತಂಭವಾಗಿ ಸಮಾಜದ ಹಿತ ರಕ್ಷಿಸುವ ಪವಿತ್ರ ಜವಾಬ್ದಾರಿ. ನ್ಯಾಯ ಘರ್ಜನೆ ಪತ್ರಿಕೆಯು ಪ್ರತಿ ತಿಂಗಳು ಜನರ ಮುಂದಿಡುವ ಪ್ರತಿಯೊಂದು ಪುಟವೂ ಸಮಾಜಮುಖಿ ಚಿಂತನೆಗೆ ಪ್ರೇರಣೆಯಾಗಿದೆ.&quot;
            </p>
            <div className="pt-2">
              <p className="text-sm font-bold text-[#172B4D]">ಎಂ. ಎಸ್. ಮಧುಕುಮಾರ್</p>
              <p className="text-xs text-[#C62828] font-medium">ಪ್ರಧಾನ ಸಂಪಾದಕರು, ನ್ಯಾಯ ಘರ್ಜನೆ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ</p>
            </div>
          </div>

          {/* Quick Stats / Info Card */}
          <div className="bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
              ಪತ್ರಿಕೆಯ ಸ್ವರೂಪ ವಿವರಗಳು
            </h3>
            <div className="space-y-2 text-xs text-[#5A6A85]">
              <div className="flex justify-between py-1 border-b border-neutral-200">
                <span>ಭಾಷೆ:</span>
                <strong className="text-[#172B4D]">ಕನ್ನಡ (Kannada)</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200">
                <span>ಆವರ್ತನ:</span>
                <strong className="text-[#172B4D]">ಮಾಸಿಕ (Monthly)</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-neutral-200">
                <span>ಮಾಧ್ಯಮ:</span>
                <strong className="text-[#172B4D]">ಡಿಜಿಟಲ್ ಇ-ಪೇಪರ್ & PDF</strong>
              </div>
              <div className="flex justify-between py-1">
                <span>ಪ್ರಸರಣ ವ್ಯಾಪ್ತಿ:</span>
                <strong className="text-[#172B4D]">ಸಮಗ್ರ ಕರ್ನಾಟಕ & ಜಾಗತಿಕ ಕನ್ನಡಿಗರು</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to action */}
      <div className="text-center bg-[#F8F9FA] border border-[#E2E8F0] rounded-xl p-8 space-y-4">
        <h3 className="text-xl font-bold text-[#172B4D]">
          ನ್ಯಾಯ ಘರ್ಜನೆ ಪತ್ರಿಕೆಯ ಇತ್ತೀಚಿನ ಆವೃತ್ತಿಯನ್ನು ಓದಿ
        </h3>
        <p className="text-xs sm:text-sm text-[#5A6A85] max-w-xl mx-auto">
          ಪ್ರತಿ ತಿಂಗಳ ಪೂರ್ಣ ಸಂಚಿಕೆಯನ್ನು ನೀವು ಸುಲಭವಾಗಿ ನಿಮ್ಮ ಮೊಬೈಲ್ ಅಥವಾ ಕಂಪ್ಯೂಟರ್‌ನಲ್ಲಿ ನೇರವಾಗಿ ಓದಬಹುದು.
        </p>
        <div className="pt-2">
          <Link
            href="/latest"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#C62828] hover:bg-[#B71C1C] text-white text-sm font-bold rounded-lg shadow-xs transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span>ಪತ್ರಿಕೆ ಓದಿ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
