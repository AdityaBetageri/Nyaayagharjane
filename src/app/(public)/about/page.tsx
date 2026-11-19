import Link from "next/link";
import Image from "next/image";
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

          <div className="pt-1">
            <h1 className="sr-only">ನ್ಯಾಯ ಘರ್ಜನೆ</h1>
            <Image
              src="/nyaayagharjane-title.png"
              alt="ನ್ಯಾಯ ಘರ್ಜನೆ"
              width={918}
              height={198}
              priority
              className="h-10 sm:h-12 lg:h-14 w-auto object-contain"
            />
          </div>

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

      {/* Editorial Mission Statement & About Editor Box */}
      <section className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Editor Photo */}
          <div className="md:col-span-4 flex justify-center">
            <div className="w-full max-w-[260px] sticky top-24">
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border-2 border-[#172B4D]/15 shadow-md bg-stone-100">
                <Image
                  src="/editor.jpg"
                  alt="ಹರೀಶ್ ಕಮ್ಮನಕೋಟೆ - ಪ್ರಧಾನ ಸಂಪಾದಕರು, ನ್ಯಾಯ ಘರ್ಜನೆ"
                  width={778}
                  height={982}
                  priority
                  className="w-full h-full object-cover object-top hover:scale-[1.02] transition-transform duration-300"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-[#172B4D] via-[#172B4D]/85 to-transparent p-3 pt-6 text-white text-center">
                  <p className="text-xs sm:text-sm font-bold leading-tight tracking-wide">ಹರೀಶ್ ಕಮ್ಮನಕೋಟೆ</p>
                  <p className="text-[10px] text-[#FF8A80] font-medium">ಪ್ರಧಾನ ಸಂಪಾದಕರು • ನ್ಯಾಯ ಘರ್ಜನೆ</p>
                </div>
              </div>
            </div>
          </div>

          {/* Editor Bio & Message */}
          <div className="md:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#C62828] text-xs font-bold border border-red-100">
              <Shield className="w-3.5 h-3.5" />
              <span>ಸಂಪಾದಕರ ಕುರಿತು</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#172B4D] tracking-tight">
                ಹರೀಶ್ ಕಮ್ಮನಕೋಟೆ
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#C62828] mt-0.5">
                ಪ್ರಧಾನ ಸಂಪಾದಕರು, ನ್ಯಾಯ ಘರ್ಜನೆ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ
              </p>
            </div>

            {/* Quote */}
            <div className="relative bg-[#F8F9FA] border-l-4 border-[#C62828] p-4 rounded-r-lg">
              <p className="text-sm sm:text-base text-[#172B4D] font-medium leading-relaxed font-serif">
                &ldquo;ಪತ್ರಿಕೋದ್ಯಮವು ಕೇವಲ ಸುದ್ದಿಗಳನ್ನು ಪ್ರಕಟಿಸುವ ಮಾಧ್ಯಮವಲ್ಲ; ಅದು ಸಮಾಜದ ತಪ್ಪುಗಳನ್ನು ಪ್ರಶ್ನಿಸುವ, ಜನರ ಹಕ್ಕುಗಳನ್ನು ಪ್ರತಿಪಾದಿಸುವ ಮತ್ತು ಪ್ರಜಾಪ್ರಭುತ್ವದ ಮೌಲ್ಯಗಳನ್ನು ಎತ್ತಿಹಿಡಿಯುವ ಶಕ್ತಿಯುತ ವೇದಿಕೆ ಎಂಬ ನಂಬಿಕೆಯನ್ನು ಹೊಂದಿದ್ದಾರೆ.&rdquo;
              </p>
            </div>

            {/* Paragraphs */}
            <div className="space-y-3 text-sm text-[#5A6A85] leading-relaxed">
              <p>
                ಹರೀಶ್ ಕಮ್ಮನಕೋಟೆ ಅವರು ಪತ್ರಿಕೋದ್ಯಮದ ಮೂಲಕ ಸಮಾಜದಲ್ಲಿ ಜಾಗೃತಿ ಮೂಡಿಸುವ ಹಾಗೂ ಜನಸಾಮಾನ್ಯರ ಧ್ವನಿಯಾಗಿ ಕಾರ್ಯನಿರ್ವಹಿಸುವ ಆಶಯ ಹೊಂದಿರುವ ಯುವ ಪತ್ರಕರ್ತರು.
              </p>
              <p>
                ಸತ್ಯ, ನ್ಯಾಯ ಮತ್ತು ಜನಪರ ಕಾಳಜಿಯನ್ನು ಪತ್ರಿಕೋದ್ಯಮದ ಮೂಲ ಆಶಯಗಳನ್ನಾಗಿ ಪರಿಗಣಿಸಿರುವ ಇವರು, ಆಡಳಿತ ವ್ಯವಸ್ಥೆಯ ಜವಾಬ್ದಾರಿತನ, ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳು, ಸಾಮಾಜಿಕ ಅನ್ಯಾಯ, ಭ್ರಷ್ಟಾಚಾರ ಹಾಗೂ ಜನಹಿತದ ವಿಚಾರಗಳಿಗೆ ಆದ್ಯತೆ ನೀಡುತ್ತಾರೆ.
              </p>
              <p>
                ನಿಷ್ಪಕ್ಷಪಾತ ವರದಿಗಾರಿಕೆ, ವಾಸ್ತವಾಂಶ ಆಧಾರಿತ ಸುದ್ದಿಗಳು ಹಾಗೂ ಜನಪರ ಧೋರಣೆಯೊಂದಿಗೆ ಪತ್ರಿಕೋದ್ಯಮದಲ್ಲಿ ತಮ್ಮದೇ ಆದ ಗುರುತು ಮೂಡಿಸುವುದು ಇವರ ಆಶಯವಾಗಿದೆ.
              </p>
              <p className="font-medium text-[#172B4D]">
                ನ್ಯಾಯ ಘರ್ಜನೆ ಪತ್ರಿಕೆಯ ಮೂಲಕ ಸತ್ಯಕ್ಕೆ ಧ್ವನಿಯಾಗಿ, ನ್ಯಾಯಕ್ಕೆ ಬೆಂಬಲವಾಗಿ ಮತ್ತು ಜನಸಾಮಾನ್ಯರ ಆಶೋತ್ತರಗಳಿಗೆ ವೇದಿಕೆಯಾಗುವ ಸಂಕಲ್ಪವನ್ನು ಹೊಂದಿದ್ದಾರೆ.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats / Info Card */}
      <section className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs">
        <h3 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider mb-4 border-b border-[#E2E8F0] pb-2">
          ಪತ್ರಿಕೆಯ ಸ್ವರೂಪ ವಿವರಗಳು
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-[#5A6A85]">
          <div className="bg-[#F8F9FA] p-3 rounded-lg border border-neutral-200">
            <span className="block text-stone-500 text-[11px]">ಭಾಷೆ</span>
            <strong className="text-[#172B4D] text-sm">ಕನ್ನಡ (Kannada)</strong>
          </div>
          <div className="bg-[#F8F9FA] p-3 rounded-lg border border-neutral-200">
            <span className="block text-stone-500 text-[11px]">ಆವರ್ತನ</span>
            <strong className="text-[#172B4D] text-sm">ಮಾಸಿಕ (Monthly)</strong>
          </div>
          <div className="bg-[#F8F9FA] p-3 rounded-lg border border-neutral-200">
            <span className="block text-stone-500 text-[11px]">ಮಾಧ್ಯಮ</span>
            <strong className="text-[#172B4D] text-sm">ಡಿಜಿಟಲ್ ಇ-ಪೇಪರ್ & PDF</strong>
          </div>
          <div className="bg-[#F8F9FA] p-3 rounded-lg border border-neutral-200">
            <span className="block text-stone-500 text-[11px]">ಪ್ರಸರಣ ವ್ಯಾಪ್ತಿ</span>
            <strong className="text-[#172B4D] text-sm">ಸಮಗ್ರ ಕರ್ನಾಟಕ & ಜಾಗತಿಕ ಕನ್ನಡಿಗರು</strong>
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
