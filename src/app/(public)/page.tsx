import Link from "next/link";
import {
  BookOpen,
  ArrowRight,
  Shield,
  Users,
  Lightbulb,
  CheckCircle2,
  Newspaper,
  Archive,
  Sparkles,
  Quote,
} from "lucide-react";
import EditorPhoto from "@/components/public/EditorPhoto";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ನ್ಯಾಯ ಘರ್ಜನೆ | ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ | ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ",
  description:
    "ನ್ಯಾಯ ಘರ್ಜನೆ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ. ಸತ್ಯದ ಧ್ವನಿ, ನ್ಯಾಯದ ಘರ್ಜನೆ. ಜನರ ಸಮಸ್ಯೆಗಳು, ಭ್ರಷ್ಟಾಚಾರದ ವಿರುದ್ಧ ಹೋರಾಟ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿಯ ವಿಶೇಷ ವರದಿಗಳು. ಇತ್ತೀಚಿನ ಸಂಚಿಕೆಯನ್ನು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಓದಿ.",
  keywords: [
    "ನ್ಯಾಯ ಘರ್ಜನೆ",
    "Nyaayagharjane",
    "ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ",
    "Kannada monthly newspaper",
    "Kannada epaper",
    "ಸತ್ಯದ ಧ್ವನಿ",
    "ನ್ಯಾಯದ ಘರ್ಜನೆ",
    "ಕರ್ನಾಟಕ ಸುದ್ದಿ",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "ನ್ಯಾಯ ಘರ್ಜನೆ | ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ | ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ",
    description:
      "ಸಮಾಜದ ಧ್ವನಿಗೆ ಅಕ್ಷರಗಳ ರೂಪ. ಜನರ ಸಮಸ್ಯೆಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿಯ ವಿಚಾರಗಳನ್ನು ಓದುಗರ ಮುಂದೆ ತರುವ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ.",
    url: "/",
    images: ["/opengraph-image"],
  },
};

export default function HomePage() {
  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* ═══════════════════════════════════════════════════════
          1. HERO SECTION — Clean, Mobile-First Welcome Card
          ═══════════════════════════════════════════════════════ */}
      <section className="relative bg-[#172B4D] text-white overflow-hidden border-b-4 border-[#C62828]">
        {/* Subtle dot pattern and glow */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-[#C62828]/15 blur-3xl pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 text-center space-y-6">
          {/* Top Brand Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#FF8A80] text-xs sm:text-sm font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#FF8A80]" />
            <span>ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ</span>
          </div>

          {/* Newspaper Name & Tagline */}
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white font-serif">
              ನ್ಯಾಯ ಘರ್ಜನೆ
            </h1>
            <p className="text-lg sm:text-xl font-bold text-white/95 pt-1">
              ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ
            </p>
          </div>

          {/* Short Kannada Introduction */}
          <p className="text-sm sm:text-base text-neutral-200 leading-relaxed max-w-2xl mx-auto font-light">
            ಸಮಾಜದ ವಾಸ್ತವ ಸಂಗತಿಗಳು, ಜನರ ಸಮಸ್ಯೆಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿಯ ವಿಚಾರಗಳನ್ನು ನಿರ್ಭೀತವಾಗಿ ಓದುಗರ ಮುಂದೆ ತರುವ ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ. ಸತ್ಯ ಮತ್ತು ನ್ಯಾಯದ ಪರವಾಗಿ ಸದಾ ಧ್ವನಿಯಾಗುವ ನಮ್ಮ ಸಂಕಲ್ಪ.
          </p>

          {/* Primary Action Button Linking to /read */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/read"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 bg-[#C62828] hover:bg-[#B71C1C] text-white text-base sm:text-lg font-bold rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <BookOpen className="w-5 h-5" />
              <span>ಪತ್ರಿಕೆ ಓದಿ</span>
            </Link>

            <Link
              href="/archives"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/25 text-sm sm:text-base font-semibold rounded-xl transition-all"
            >
              <Archive className="w-4 h-4 text-neutral-300" />
              <span>ಹಿಂದಿನ ಸಂಚಿಕೆಗಳು</span>
            </Link>
          </div>

          {/* Feature Highlights Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-3">
            {[
              "ಉಚಿತ ಮಾಸಿಕ ಆವೃತ್ತಿ",
              "ಡಿಜಿಟಲ್ ಫ್ಲಿಪ್‌ಬುಕ್ ವಾಚಕ",
              "ಸುಲಭ PDF ಡೌನ್‌ಲೋಡ್",
            ].map((feature) => (
              <span
                key={feature}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/8 border border-white/15 text-xs text-neutral-300"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{feature}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          2. ಸಂಪಾದಕರ ಪರಿಚಯ (Editor's Introduction Section)
          ═══════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xs relative overflow-hidden">
          {/* Subtle side accent bar */}
          <div className="absolute top-0 left-0 w-2 h-full bg-[#C62828]" />

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* Editor Photo Column */}
            <div className="md:col-span-5 flex justify-center">
              <div className="w-full max-w-[260px] sm:max-w-[280px]">
                <EditorPhoto
                  src="/editor.jpg"
                  alt="ಎಂ. ಎಸ್. ಮಧುಕುಮಾರ್ - ಪ್ರಧಾನ ಸಂಪಾದಕರು, ನ್ಯಾಯ ಘರ್ಜನೆ"
                  editorName="ಎಂ. ಎಸ್. ಮಧುಕುಮಾರ್"
                />
              </div>
            </div>

            {/* Editor Info & Message Column */}
            <div className="md:col-span-7 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#C62828] text-xs font-bold border border-red-100">
                <Newspaper className="w-3.5 h-3.5" />
                <span>ಸಂಪಾದಕರ ಪರಿಚಯ</span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-[#172B4D] tracking-tight">
                  ಎಂ. ಎಸ್. ಮಧುಕುಮಾರ್
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-[#C62828] mt-0.5">
                  ಪ್ರಧಾನ ಸಂಪಾದಕರು, ನ್ಯಾಯ ಘರ್ಜನೆ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ
                </p>
              </div>

              {/* Quotation Box */}
              <div className="relative bg-[#F8F9FA] border-l-4 border-[#C62828] p-4 rounded-r-lg space-y-2">
                <Quote className="w-6 h-6 text-[#C62828]/30 absolute top-2 right-2" />
                <p className="text-sm sm:text-base text-[#172B4D] font-medium leading-relaxed font-serif">
                  &ldquo;ಪತ್ರಿಕೋದ್ಯಮವೆಂದರೆ ಕೇವಲ ಸುದ್ದಿಗಳನ್ನು ಪ್ರಕಟಿಸುವುದಲ್ಲ; ಅದು ಸಮಾಜದ ಕಟ್ಟಕಡೆಯ ವ್ಯಕ್ತಿಯ ಧ್ವನಿಯಾಗಿ, ಅನ್ಯಾಯದ ವಿರುದ್ಧ ಹೋರಾಡುವ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಹಿತ ರಕ್ಷಿಸುವ ಪವಿತ್ರ ಜವಾಬ್ದಾರಿ.&rdquo;
                </p>
              </div>

              <p className="text-xs sm:text-sm text-[#5A6A85] leading-relaxed">
                ನ್ಯಾಯ ಘರ್ಜನೆ ಪತ್ರಿಕೆಯು ಯಾವುದೇ ರಾಜಕೀಯ ಅಥವಾ ವಾಣಿಜ್ಯ ಹಿತಾಸಕ್ತಿಗಳಿಗೆ ಮಣಿಯದೆ, ಸಾರ್ವಜನಿಕರ ಪರವಾಗಿ ಮತ್ತು ನ್ಯಾಯದ ಪರವಾಗಿ ನಿಲ್ಲುವ ಬದ್ಧತೆಯೊಂದಿಗೆ ಮುನ್ನಡೆಯುತ್ತಿದೆ. ರಾಜ್ಯದ ಪ್ರಮುಖ ವಿದ್ಯಮಾನಗಳು, ಜನಪರ ಹೋರಾಟಗಳು ಮತ್ತು ಉಪಯುಕ್ತ ಮಾಹಿತಿಯನ್ನು ಪ್ರತಿ ತಿಂಗಳು ನಮ್ಮ ಓದುಗರಿಗೆ ತಲುಪಿಸಲು ನಾವು ಸದಾ ಬದ್ಧರಾಗಿದ್ದೇವೆ.
              </p>

              {/* Editorial Values Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-xs">
                <div className="flex items-center gap-2 bg-[#F8F9FA] p-2 rounded-lg border border-[#E2E8F0] text-[#172B4D]">
                  <Shield className="w-4 h-4 text-[#C62828] shrink-0" />
                  <span className="font-semibold">ನಿರ್ಭೀತ ಪತ್ರಿಕೋದ್ಯಮ</span>
                </div>
                <div className="flex items-center gap-2 bg-[#F8F9FA] p-2 rounded-lg border border-[#E2E8F0] text-[#172B4D]">
                  <Users className="w-4 h-4 text-[#172B4D] shrink-0" />
                  <span className="font-semibold">ಜನಪರ ನಿಲುವು</span>
                </div>
                <div className="flex items-center gap-2 bg-[#F8F9FA] p-2 rounded-lg border border-[#E2E8F0] text-[#172B4D]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-semibold">ಸತ್ಯನಿಷ್ಠ ವರದಿ</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          3. ನಮ್ಮ ಬಗ್ಗೆ (About Us & Purpose Section)
          ═══════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="border-b border-[#E2E8F0] pb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-[#C62828] rounded-full" />
            <h2 className="text-xl sm:text-2xl font-black text-[#172B4D] tracking-tight">
              ನಮ್ಮ ಬಗ್ಗೆ ಮತ್ತು ಪತ್ರಿಕೆಯ ಉದ್ದೇಶ
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#5A6A85] mt-1">
            ಸಮಾಜಮುಖಿ ಪತ್ರಿಕೋದ್ಯಮದ ನಾಲ್ಕು ಮೂಲಸ್ತಂಭಗಳ ಮೇಲೆ ನ್ಯಾಯ ಘರ್ಜನೆ ಮುನ್ನಡೆಯುತ್ತಿದೆ
          </p>
        </div>

        {/* 4 Clean Purpose Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-[#C62828] flex items-center justify-center">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#172B4D]">೧. ನ್ಯಾಯದ ಧ್ವನಿ</h3>
            <p className="text-xs text-[#5A6A85] leading-relaxed">
              ನ್ಯಾಯ, ಸಮಾನತೆ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿಯ ವಿಚಾರಗಳಿಗೆ ಪತ್ರಿಕೆಯಲ್ಲಿ ಸದಾ ಮೊದಲ ಆದ್ಯತೆ.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#172B4D] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#172B4D]">೨. ಜನರ ಪರವಾಗಿ</h3>
            <p className="text-xs text-[#5A6A85] leading-relaxed">
              ಜನಸಾಮಾನ್ಯರ ಕಷ್ಟ-ಸುಖ, ರೈತರು, ಕಾರ್ಮಿಕರು ಹಾಗೂ ದುರ್ಬಲ ವರ್ಗದವರ ಹಕ್ಕುಗಳಿಗೆ ಪ್ರಬಲ ವೇದಿಕೆ.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Lightbulb className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#172B4D]">೩. ಸತ್ಯ ಮತ್ತು ನಿಖರತೆ</h3>
            <p className="text-xs text-[#5A6A85] leading-relaxed">
              ವದಂತಿಗಳಿಗೆ ಆಸ್ಪದ ನೀಡದೆ ಸಾಕ್ಷ್ಯಾಧಾರಿತ, ನಿಷ್ಪಕ್ಷಪಾತ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹ ಮಾಹಿತಿ ಪ್ರಸಾರ.
            </p>
          </div>

          <div className="bg-white p-5 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-2.5">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-[#172B4D]">೪. ಉಚಿತ ಡಿಜಿಟಲ್ ಓದು</h3>
            <p className="text-xs text-[#5A6A85] leading-relaxed">
              ಪ್ರತಿ ತಿಂಗಳ ಪೂರ್ಣ ಆವೃತ್ತಿಯನ್ನು ಎಲ್ಲ ಓದುಗರಿಗೂ ಉಚಿತವಾಗಿ ತಲುಪಿಸುವ ಆಧುನಿಕ ಇ-ಪತ್ರಿಕೆ.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          4. BOTTOM CALL TO ACTION — Direct Link to /read
          ═══════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#172B4D] text-white rounded-2xl p-8 sm:p-12 text-center space-y-5 shadow-lg relative overflow-hidden">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#C62828]/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif text-white">
              ನ್ಯಾಯ ಘರ್ಜನೆಯ ಇತ್ತೀಚಿನ ಸಂಚಿಕೆಯನ್ನು ಈಗಲೇ ಓದಿ
            </h2>
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
              ಮಾಸಿಕ ಆವೃತ್ತಿಯನ್ನು ನಿಮ್ಮ ಮೊಬೈಲ್ ಅಥವಾ ಕಂಪ್ಯೂಟರ್‌ನಲ್ಲಿ ಡಿಜಿಟಲ್ ರೂಪದಲ್ಲಿ ಆನಂದಿಸಿ ಅಥವಾ ಉಚಿತವಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/read"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#C62828] hover:bg-[#B71C1C] text-white text-base font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <BookOpen className="w-5 h-5" />
                <span>ಪತ್ರಿಕೆ ಓದಿ</span>
              </Link>
              <Link
                href="/archives"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 text-sm font-semibold rounded-xl transition-all"
              >
                <span>ಎಲ್ಲಾ ಸಂಚಿಕೆಗಳು</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
