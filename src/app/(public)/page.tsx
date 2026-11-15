import Link from "next/link";
import {
  Scale,
  Users,
  Lightbulb,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Archive,
  Download,
  Sparkles,
  ChevronRight,
  Newspaper,
} from "lucide-react";
import LatestEditionHero from "@/components/public/LatestEditionHero";
import EditionCard from "@/components/shared/EditionCard";
import { PLACEHOLDER_LATEST_EDITION, PLACEHOLDER_PREVIOUS_EDITIONS } from "@/lib/constants";

export const metadata = {
  title: "ನ್ಯಾಯಘರ್ಜನೆ | ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ | ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ",
  description:
    "ಸಮಾಜದ ಧ್ವನಿಗೆ ಅಕ್ಷರಗಳ ರೂಪ. ಜನರ ಸಮಸ್ಯೆಗಳು, ಸಮಾಜದ ಬೆಳವಣಿಗೆಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿಯ ವಿಚಾರಗಳನ್ನು ಓದುಗರ ಮುಂದೆ ತರುವ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ.",
};

export default function HomePage() {
  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* =========================================================
          1. HERO SECTION
          ========================================================= */}
      <section className="relative bg-[#172B4D] text-white overflow-hidden border-b-4 border-[#C62828]">
        {/* Subtle decorative background newspaper pattern elements */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-60" />
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-16 sm:py-24 lg:py-28">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            {/* Top Brand Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#FF8A80] text-xs sm:text-sm font-semibold backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-[#FF8A80]" />
              <span>ನ್ಯಾಯಘರ್ಜನೆ — ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ</span>
            </div>

            {/* Main Heading */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight font-serif">
                &ldquo;ಸಮಾಜದ ಧ್ವನಿಗೆ ಅಕ್ಷರಗಳ ರೂಪ...&rdquo;
              </h1>
              {/* Secondary Heading */}
              <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#FF8A80] tracking-wide">
                ನ್ಯಾಯದ ಪರವಾಗಿ, ಸತ್ಯದ ಹಾದಿಯಲ್ಲಿ!
              </p>
            </div>

            {/* Description */}
            <p className="text-sm sm:text-base lg:text-lg text-neutral-300 max-w-2xl mx-auto leading-relaxed font-light">
              ಜನರ ಸಮಸ್ಯೆಗಳು, ಸಮಾಜದ ಬೆಳವಣಿಗೆಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿಯ ವಿಚಾರಗಳನ್ನು ಓದುಗರ ಮುಂದೆ ತರುವ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-2">
              <Link
                href="/latest"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 bg-[#C62828] hover:bg-[#B71C1C] text-white text-sm sm:text-base font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <BookOpen className="w-5 h-5" />
                <span>ಇತ್ತೀಚಿನ ಪತ್ರಿಕೆ ಓದಿ</span>
              </Link>

              <Link
                href="/archives"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/30 text-sm sm:text-base font-semibold rounded-lg backdrop-blur-xs transition-all"
              >
                <Archive className="w-5 h-5 text-neutral-300" />
                <span>ಹಿಂದಿನ ಸಂಚಿಕೆಗಳನ್ನು ನೋಡಿ</span>
              </Link>
            </div>

            {/* Subtle masthead caption */}
            <div className="pt-4 flex items-center justify-center gap-2 text-xs text-neutral-400">
              <span>ಸತ್ಯದ ಧ್ವನಿ</span>
              <span>•</span>
              <span>ನ್ಯಾಯದ ಘರ್ಜನೆ</span>
              <span>•</span>
              <span>ಡಿಜಿಟಲ್ ಇ-ಪೇಪರ್ ಆವೃತ್ತಿ</span>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          2. INTRODUCTION SECTION
          ========================================================= */}
      <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-10 lg:p-14 shadow-xs relative overflow-hidden">
          {/* Subtle side accent bar */}
          <div className="absolute top-0 left-0 w-2 h-full bg-[#C62828]" />

          <div className="max-w-4xl mx-auto space-y-6 text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#C62828] text-xs font-bold">
              <Newspaper className="w-3.5 h-3.5" />
              <span>ಪತ್ರಿಕೆಯ ಪರಿಚಯ</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#172B4D] tracking-tight">
              ನ್ಯಾಯಘರ್ಜನೆ ಎಂದರೇನು?
            </h2>

            {/* Stylized Editorial Quotation Layout */}
            <div className="relative pl-0 sm:pl-6 sm:border-l-2 sm:border-[#C62828] py-2">
              <p className="text-base sm:text-lg lg:text-xl text-[#172B4D] font-medium leading-relaxed font-serif">
                &ldquo;ನ್ಯಾಯಘರ್ಜನೆ ಕೇವಲ ಒಂದು ಪತ್ರಿಕೆಯಲ್ಲ; ಸಮಾಜದ ಆಗುಹೋಗುಗಳನ್ನು ಅರಿಯಲು, ಜನರ ಧ್ವನಿಯನ್ನು ಗುರುತಿಸಲು ಮತ್ತು ಸಾರ್ವಜನಿಕ ವಿಚಾರಗಳ ಬಗ್ಗೆ ಓದುಗರಲ್ಲಿ ಜಾಗೃತಿ ಮೂಡಿಸಲು ರೂಪುಗೊಂಡಿರುವ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ.&rdquo;
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#5A6A85] leading-relaxed max-w-3xl">
              ಪ್ರತಿ ತಿಂಗಳು ಪ್ರಕಟವಾಗುವ ಈ ಪತ್ರಿಕೆಯು, ಸಮಾಜದ ಪ್ರತಿಯೊಂದು ವರ್ಗದ ಜನರ ಹಿತಾಸಕ್ತಿಯನ್ನು ಗಮನದಲ್ಲಿಟ್ಟುಕೊಂಡು, ಆಡಳಿತ, ಸಮಾಜ, ಕೃಷಿ, ಕಾನೂನು ಮತ್ತು ನಾಗರಿಕ ಹಕ್ಕುಗಳ ಕುರಿತಾದ ನಿಖರ ಮಾಹಿತಿಗಳನ್ನು ನಿಷ್ಪಕ್ಷಪಾತವಾಗಿ ಓದುಗರಿಗೆ ತಲುಪಿಸಲು ಬದ್ಧವಾಗಿದೆ.
            </p>
          </div>
        </div>
      </section>

      {/* =========================================================
          3. OUR PURPOSE SECTION ("ನಮ್ಮ ಉದ್ದೇಶ ಮತ್ತು ಬದ್ಧತೆ")
          ========================================================= */}
      <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#172B4D] text-xs font-bold border border-blue-200">
            <span>ಧ್ಯೇಯ & ಮೌಲ್ಯಗಳು</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#172B4D] tracking-tight">
            ನಮ್ಮ ಉದ್ದೇಶ ಮತ್ತು ಬದ್ಧತೆ
          </h2>
          <p className="text-xs sm:text-sm text-[#5A6A85] leading-relaxed">
            ಸಮಾಜಮುಖಿ ಪತ್ರಿಕೋದ್ಯಮದ ನಾಲ್ಕು ಮೂಲಸ್ತಂಭಗಳ ಮೇಲೆ ನ್ಯಾಯಘರ್ಜನೆ ಮುನ್ನಡೆಯುತ್ತಿದೆ
          </p>
        </div>

        {/* Four Purpose Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <div className="group bg-white p-6 sm:p-7 rounded-xl border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-[#C62828]/40 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-red-50 text-[#C62828] group-hover:bg-[#C62828] group-hover:text-white transition-colors flex items-center justify-center">
                <Scale className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#172B4D]">
                ೧. ನ್ಯಾಯದ ಧ್ವನಿ
              </h3>
              <p className="text-xs sm:text-sm text-[#5A6A85] leading-relaxed">
                ನ್ಯಾಯ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿಯ ವಿಚಾರಗಳಿಗೆ ಮಹತ್ವ.
              </p>
            </div>
            <div className="pt-2 border-t border-neutral-100 text-[11px] font-semibold text-[#C62828] flex items-center gap-1">
              <span>ಸಾರ್ವಜನಿಕ ನ್ಯಾಯ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 2 */}
          <div className="group bg-white p-6 sm:p-7 rounded-xl border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-[#C62828]/40 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-[#172B4D] group-hover:bg-[#172B4D] group-hover:text-white transition-colors flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#172B4D]">
                ೨. ಜನರ ಪರವಾಗಿ
              </h3>
              <p className="text-xs sm:text-sm text-[#5A6A85] leading-relaxed">
                ಸಮಾಜದ ಸಮಸ್ಯೆಗಳು ಮತ್ತು ಜನರ ಅಭಿಪ್ರಾಯಗಳಿಗೆ ವೇದಿಕೆ.
              </p>
            </div>
            <div className="pt-2 border-t border-neutral-100 text-[11px] font-semibold text-[#172B4D] flex items-center gap-1">
              <span>ಜನಪರ ನಿಲುವು</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 3 */}
          <div className="group bg-white p-6 sm:p-7 rounded-xl border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-[#C62828]/40 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors flex items-center justify-center">
                <Lightbulb className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#172B4D]">
                ೩. ಮಾಹಿತಿಯ ಬೆಳಕು
              </h3>
              <p className="text-xs sm:text-sm text-[#5A6A85] leading-relaxed">
                ಓದುಗರಿಗೆ ಉಪಯುಕ್ತವಾದ ಮಾಹಿತಿಯನ್ನು ತಲುಪಿಸುವುದು.
              </p>
            </div>
            <div className="pt-2 border-t border-neutral-100 text-[11px] font-semibold text-amber-800 flex items-center gap-1">
              <span>ಉಪಯುಕ್ತ ಅರಿವು</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 4 */}
          <div className="group bg-white p-6 sm:p-7 rounded-xl border border-[#E2E8F0] shadow-xs hover:shadow-md hover:border-[#C62828]/40 transition-all space-y-3 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-700 group-hover:text-white transition-colors flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#172B4D]">
                ೪. ಜವಾಬ್ದಾರಿಯುತ ಪತ್ರಿಕೋದ್ಯಮ
              </h3>
              <p className="text-xs sm:text-sm text-[#5A6A85] leading-relaxed">
                ವಿಷಯಗಳ ನಿರೂಪಣೆಯಲ್ಲಿ ನಿಖರತೆ ಮತ್ತು ಜವಾಬ್ದಾರಿಗೆ ಆದ್ಯತೆ.
              </p>
            </div>
            <div className="pt-2 border-t border-neutral-100 text-[11px] font-semibold text-emerald-800 flex items-center gap-1">
              <span>ನಿಷ್ಠೆ ಮತ್ತು ನೈತಿಕತೆ</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          4. DIGITAL NEWSPAPER EXPERIENCE
          ========================================================= */}
      <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 space-y-8">
        <div className="border-b border-[#E2E8F0] pb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-7 bg-[#C62828] rounded-full shrink-0"></div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#172B4D] tracking-tight">
              ನಿಮ್ಮ ಪತ್ರಿಕೆ, ಈಗ ನಿಮ್ಮ ಕೈಯಲ್ಲಿ
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#5A6A85] mt-2 max-w-3xl leading-relaxed">
            ನ್ಯಾಯಘರ್ಜನೆಯ ಮಾಸಿಕ ಸಂಚಿಕೆಗಳನ್ನು ನಿಮ್ಮ ಮೊಬೈಲ್ ಅಥವಾ ಕಂಪ್ಯೂಟರ್ನಲ್ಲಿ ಸುಲಭವಾಗಿ ಓದಿ. ಹಿಂದಿನ ಸಂಚಿಕೆಗಳನ್ನು ಯಾವಾಗ ಬೇಕಾದರೂ ವೀಕ್ಷಿಸಿ.
          </p>
        </div>

        {/* 4 Feature Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-50 text-[#C62828] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#172B4D]">
              ಪ್ರತಿ ತಿಂಗಳು ಹೊಸ ಸಂಚಿಕೆ
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#172B4D] flex items-center justify-center shrink-0">
              <Archive className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#172B4D]">
              ಹಿಂದಿನ ಎಲ್ಲಾ ಸಂಚಿಕೆಗಳ ಸಂಗ್ರಹ
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#172B4D]">
              ಡಿಜಿಟಲ್ ಫ್ಲಿಪ್ಬುಕ್ ಓದುವ ಅನುಭವ
            </span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-2xs flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
              <Download className="w-4 h-4" />
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#172B4D]">
              PDF ಡೌನ್ಲೋಡ್ ಸೌಲಭ್ಯ
            </span>
          </div>
        </div>

        {/* Reusing existing LatestEditionHero dynamically */}
        <LatestEditionHero edition={PLACEHOLDER_LATEST_EDITION} />
      </section>

      {/* =========================================================
          5. ARCHIVE INTRODUCTION ("ಹಿಂದಿನ ಸಂಚಿಕೆಗಳ ನೆನಪು")
          ========================================================= */}
      <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-[#E2E8F0] pb-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-7 bg-[#172B4D] rounded-full shrink-0"></div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#172B4D] tracking-tight">
                ಹಿಂದಿನ ಸಂಚಿಕೆಗಳ ನೆನಪು
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#5A6A85] mt-1.5 leading-relaxed">
              ನ್ಯಾಯಘರ್ಜನೆಯ ಹಿಂದಿನ ಎಲ್ಲಾ ಪ್ರಕಟಿತ ಸಂಚಿಕೆಗಳನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ವೀಕ್ಷಿಸಿ.
            </p>
          </div>

          <Link
            href="/archives"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#172B4D] hover:bg-[#0F1C33] text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs transition-colors shrink-0"
          >
            <span>ಎಲ್ಲಾ ಸಂಚಿಕೆಗಳನ್ನು ನೋಡಿ</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Previous Editions Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {PLACEHOLDER_PREVIOUS_EDITIONS.map((edition) => (
            <EditionCard key={edition.id} edition={edition} isPlaceholder={true} />
          ))}
        </div>
      </section>

      {/* =========================================================
          6. FINAL CALL TO ACTION
          ========================================================= */}
      <section className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
        <div className="bg-[#172B4D] text-white rounded-2xl p-8 sm:p-12 lg:p-16 text-center space-y-6 shadow-lg relative overflow-hidden">
          {/* Subtle Accent Glow */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white font-serif">
              ಸುದ್ದಿಗಳನ್ನು ಓದಿ, ಸಮಾಜವನ್ನು ಅರಿಯಿರಿ.
            </h2>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
              ನ್ಯಾಯಘರ್ಜನೆಯೊಂದಿಗೆ ಕನ್ನಡ ಓದಿನ ಹೊಸ ಡಿಜಿಟಲ್ ಅನುಭವಕ್ಕೆ ಸ್ವಾಗತ.
            </p>
            <div className="pt-2">
              <Link
                href="/latest"
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#C62828] hover:bg-[#B71C1C] text-white text-sm sm:text-base font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <BookOpen className="w-5 h-5" />
                <span>ಇತ್ತೀಚಿನ ಪತ್ರಿಕೆ ಓದಿ</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
