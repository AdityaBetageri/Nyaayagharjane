import Link from "next/link";
import Image from "next/image";
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
  FileText,
} from "lucide-react";
import LatestEditionHero from "@/components/public/LatestEditionHero";
import EditionCard from "@/components/shared/EditionCard";
import { PLACEHOLDER_LATEST_EDITION, PLACEHOLDER_PREVIOUS_EDITIONS } from "@/lib/constants";
import { fetchR2Catalogue, r2ItemToEdition } from "@/lib/r2Service";
import { Edition } from "@/types";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ಪತ್ರಿಕೆ ಓದಿ (Read E-Paper) | ನ್ಯಾಯ ಘರ್ಜನೆ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ",
  description:
    "ನ್ಯಾಯ ಘರ್ಜನೆ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ. ಸಮಾಜದ ಧ್ವನಿ, ಜನರ ಸಮಸ್ಯೆಗಳು, ಭ್ರಷ್ಟಾಚಾರದ ವಿರುದ್ಧ ಹೋರಾಟ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿಯ ವಿಶೇಷ ವರದಿಗಳು. ಇತ್ತೀಚಿನ ಸಂಚಿಕೆಯನ್ನು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಉಚಿತವಾಗಿ ಓದಿ ಮತ್ತು PDF ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ.",
  keywords: [
    "ನ್ಯಾಯ ಘರ್ಜನೆ",
    "Nyaayagharjane",
    "Nyaaya Gharjane",
    "ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ",
    "Kannada monthly newspaper",
    "Kannada epaper online",
    "ದಕ್ಷಿಣ ಕನ್ನಡ ಪತ್ರಿಕೆ",
    "ಕರ್ನಾಟಕ ಸುದ್ದಿ",
  ],
  alternates: { canonical: "/read" },
  openGraph: {
    title: "ಪತ್ರಿಕೆ ಓದಿ | ನ್ಯಾಯ ಘರ್ಜನೆ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ",
    description:
      "ಸಮಾಜದ ಧ್ವನಿಗೆ ಅಕ್ಷರಗಳ ರೂಪ. ಜನರ ಸಮಸ್ಯೆಗಳು, ಸಮಾಜದ ಬೆಳವಣಿಗೆಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿಯ ವಿಚಾರಗಳನ್ನು ಓದುಗರ ಮುಂದೆ ತರುವ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ.",
    url: "/read",
    images: ["/opengraph-image"],
  },
};

export default async function ReadPage() {
  let latestEdition: Edition = PLACEHOLDER_LATEST_EDITION;
  let previousEditions: Edition[] = PLACEHOLDER_PREVIOUS_EDITIONS;

  try {
    const res = await fetchR2Catalogue({ bypassCache: false, publishedOnly: true });
    if (res.success && res.data.length > 0) {
      latestEdition = r2ItemToEdition(res.data[0]);
      if (res.data.length > 1) {
        previousEditions = res.data.slice(1, 5).map(r2ItemToEdition);
      }
    }
  } catch {
    // Graceful fallback to placeholders
  }

  const hasDirectPdf = !!latestEdition.pdfUrl && latestEdition.pdfUrl.startsWith("http");

  return (
    <div className="pb-16">
      {/* ═══════════════════════════════════════════════════════
          SECTION 1 — HERO (Two-Column Editorial Layout)
          ═══════════════════════════════════════════════════════ */}
      <section className="relative bg-[#172B4D] text-white overflow-hidden border-b-4 border-[#C62828]">
        {/* Subtle dot-grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        {/* Ambient glows */}
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#C62828]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-blue-500/8 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* ── LEFT: Text Content ── */}
            <div className="space-y-6 order-2 lg:order-1">
              {/* Brand Title Graphic & Logo */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl p-0.5 bg-white/10 border border-white/20 shadow-md">
                  <Image
                    src="/logo.png"
                    alt="ನ್ಯಾಯ ಘರ್ಜನೆ"
                    width={968}
                    height={968}
                    priority
                    className="w-full h-full object-contain rounded-lg drop-shadow-xs"
                  />
                </div>
                <Image
                  src="/nyaayagharjane-title.png"
                  alt="ನ್ಯಾಯ ಘರ್ಜನೆ"
                  width={918}
                  height={198}
                  priority
                  className="h-10 sm:h-12 lg:h-14 w-auto object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.4)]"
                />
              </div>

              {/* Brand pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-[#FF8A80] text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ</span>
              </div>

              {/* Headings */}
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight font-serif">
                  &ldquo;ಸಮಾಜದ ಧ್ವನಿಗೆ&nbsp;
                  <br className="hidden sm:block" />
                  ಅಕ್ಷರಗಳ ರೂಪ...&rdquo;
                </h1>
                <p className="text-lg sm:text-xl font-bold text-[#FF8A80]">
                  ನ್ಯಾಯದ ಪರವಾಗಿ, ಸತ್ಯದ ಹಾದಿಯಲ್ಲಿ!
                </p>
              </div>

              {/* Description */}
              <p className="text-sm sm:text-base text-neutral-300 leading-relaxed max-w-lg">
                ಜನರ ಸಮಸ್ಯೆಗಳು, ಸಮಾಜದ ಬೆಳವಣಿಗೆಗಳು ಮತ್ತು ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿಯ ವಿಚಾರಗಳನ್ನು ಓದುಗರ ಮುಂದೆ ತರುವ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/latest"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C62828] hover:bg-[#B71C1C] text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
                >
                  <BookOpen className="w-4 h-4" />
                  ಇತ್ತೀಚಿನ ಪತ್ರಿಕೆ ಓದಿ
                </Link>
                <Link
                  href="/archives"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/25 text-sm font-semibold rounded-lg transition-all"
                >
                  <Archive className="w-4 h-4 text-neutral-300" />
                  ಹಿಂದಿನ ಸಂಚಿಕೆಗಳನ್ನು ನೋಡಿ
                </Link>
              </div>

              {/* Quick feature pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[
                  "ಪ್ರತಿ ತಿಂಗಳು ಹೊಸ ಸಂಚಿಕೆ",
                  "ಡಿಜಿಟಲ್ ಫ್ಲಿಪ್‌ಬುಕ್",
                  "PDF ಡೌನ್‌ಲೋಡ್",
                ].map((f) => (
                  <span
                    key={f}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/8 border border-white/15 text-[11px] text-neutral-300"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {f}
                  </span>
                ))}
              </div>
            </div>

            {/* ── RIGHT: Newspaper Cover Preview ── */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-xs sm:max-w-sm">
                {/* Shadow layers for depth */}
                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-xl bg-black/25 blur-sm" />
                <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-xl bg-[#C62828]/20" />

                {/* Cover card */}
                <div className="relative bg-gradient-to-b from-stone-50 to-stone-100 rounded-xl border-2 border-stone-300 shadow-2xl overflow-hidden aspect-[1/1.41] flex flex-col">
                  {/* Status badge */}
                  {hasDirectPdf && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-700 text-white shadow-sm">
                        <CheckCircle2 className="w-3 h-3" />
                        ಪ್ರಕಟಿತ ಆವೃತ್ತಿ
                      </span>
                    </div>
                  )}

                  {/* Masthead */}
                  <div className="px-4 pt-3.5 pb-2.5 border-b-2 border-stone-300 text-center bg-white flex flex-col items-center">
                    <Image
                      src="/nyaayagharjane-title.png"
                      alt="ನ್ಯಾಯ ಘರ್ಜನೆ"
                      width={918}
                      height={198}
                      className="h-8 sm:h-9 w-auto object-contain"
                    />
                    <div className="w-full flex items-center justify-between text-[9px] text-stone-500 mt-2 pt-1.5 border-t border-stone-200">
                      <span>ಸಂಪುಟ {latestEdition.volumeNumber ?? 1}</span>
                      <span className="font-semibold text-stone-700">{latestEdition.formattedDate}</span>
                      <span>ಸಂಚಿಕೆ {latestEdition.issueNumber ?? 1}</span>
                    </div>
                  </div>

                  {/* Cover body */}
                  <div className="flex-1 flex flex-col justify-center px-4 py-4 space-y-3">
                    <div className="bg-white/90 rounded-lg border border-stone-200 p-3 space-y-2">
                      <div className="inline-block px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[9px] font-bold">
                        {latestEdition.edition ?? "ರಾಜ್ಯ ಆವೃತ್ತಿ"}
                      </div>
                      <p className="text-xs font-bold text-[#172B4D] leading-snug line-clamp-2">
                        {latestEdition.title}
                      </p>
                      <p className="text-[10px] text-[#5A6A85] leading-relaxed line-clamp-2">
                        {latestEdition.description ?? "ಸತ್ಯ ಮತ್ತು ನ್ಯಾಯದ ಪರವಾದ ಸಮಗ್ರ ವಿಶ್ಲೇಷಣೆ ಮತ್ತು ರಾಜ್ಯದ ಪ್ರಮುಖ ವಿದ್ಯಮಾನಗಳು."}
                      </p>
                    </div>

                    {/* Decorative article lines */}
                    <div className="space-y-1.5 px-1">
                      {[80, 100, 65, 90].map((w, i) => (
                        <div key={i} className="h-1.5 rounded-full bg-stone-200" style={{ width: `${w}%` }} />
                      ))}
                    </div>
                  </div>

                  {/* Cover footer */}
                  <div className="px-4 py-2 bg-[#172B4D] flex items-center justify-between text-[9px] text-white/80">
                    <span>{latestEdition.totalPages} ಪುಟಗಳು</span>
                    <span className="text-[#FF8A80] font-bold">ಡಿಜಿಟಲ್ ಇ-ಪತ್ರಿಕೆ</span>
                    <span>{latestEdition.formattedFileSize ?? "೧೨.೪ MB"}</span>
                  </div>
                </div>

                {/* CTA below cover */}
                <div className="mt-4 flex gap-2 justify-center">
                  <Link
                    href={`/reader/${latestEdition.id}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-[#172B4D] text-xs font-semibold rounded-lg shadow-sm hover:shadow-md border border-white/50 transition-all hover:bg-white/90"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#C62828]" />
                    ಓದಿ
                  </Link>
                  {hasDirectPdf ? (
                    <a
                      href={latestEdition.pdfUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/15 text-white text-xs font-semibold rounded-lg border border-white/25 hover:bg-white/25 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </a>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/10 text-white/50 text-xs font-semibold rounded-lg border border-white/15 cursor-not-allowed">
                      <Download className="w-3.5 h-3.5" />
                      PDF
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 2 — ABOUT (Two-Column)
          ═══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Left: Text */}
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-[#C62828] text-xs font-bold border border-red-100">
              <Newspaper className="w-3.5 h-3.5" />
              ಪತ್ರಿಕೆಯ ಪರಿಚಯ
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-[#172B4D] tracking-tight leading-snug">
              <span className="text-[#C62828]">ನ್ಯಾಯ</span> <span className="text-[#D97706]">ಘರ್ಜನೆ</span> ಎಂದರೇನು?
            </h2>

            <div className="pl-4 border-l-4 border-[#C62828] py-1">
              <p className="text-base sm:text-lg text-[#172B4D] font-medium leading-relaxed font-serif">
                &ldquo;ನ್ಯಾಯ ಘರ್ಜನೆ ಕೇವಲ ಒಂದು ಪತ್ರಿಕೆಯಲ್ಲ; ಸಮಾಜದ ಆಗುಹೋಗುಗಳನ್ನು ಅರಿಯಲು, ಜನರ ಧ್ವನಿಯನ್ನು ಗುರುತಿಸಲು ಮತ್ತು ಸಾರ್ವಜನಿಕ ವಿಚಾರಗಳ ಬಗ್ಗೆ ಓದುಗರಲ್ಲಿ ಜಾಗೃತಿ ಮೂಡಿಸಲು ರೂಪುಗೊಂಡಿರುವ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ.&rdquo;
              </p>
            </div>

            <p className="text-sm text-[#5A6A85] leading-relaxed">
              ಪ್ರತಿ ತಿಂಗಳು ಪ್ರಕಟವಾಗುವ ಈ ಪತ್ರಿಕೆಯು, ಸಮಾಜದ ಪ್ರತಿಯೊಂದು ವರ್ಗದ ಜನರ ಹಿತಾಸಕ್ತಿಯನ್ನು ಗಮನದಲ್ಲಿಟ್ಟುಕೊಂಡು, ಆಡಳಿತ, ಸಮಾಜ, ಕೃಷಿ, ಕಾನೂನು ಮತ್ತು ನಾಗರಿಕ ಹಕ್ಕುಗಳ ಕುರಿತಾದ ನಿಖರ ಮಾಹಿತಿಗಳನ್ನು ನಿಷ್ಪಕ್ಷಪಾತವಾಗಿ ಓದುಗರಿಗೆ ತಲುಪಿಸಲು ಬದ್ಧವಾಗಿದೆ.
            </p>

            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#C62828] hover:text-[#B71C1C] transition-colors"
            >
              ಇನ್ನಷ್ಟು ತಿಳಿಯಿರಿ
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Right: Editorial visual */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
              {/* Top bar */}
              <div className="bg-[#172B4D] px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#C62828]" />
                  <span className="text-white text-xs font-bold">ಸಂಪಾದಕೀಯ ಮೌಲ್ಯಗಳು</span>
                </div>
                <Newspaper className="w-4 h-4 text-white/40" />
              </div>
              {/* Value rows */}
              <div className="divide-y divide-[#E2E8F0]">
                {[
                  { icon: Scale, label: "ನ್ಯಾಯದ ಪರ ನಿಲ್ಲುವ ಬದ್ಧತೆ", color: "text-[#C62828] bg-red-50" },
                  { icon: Users, label: "ಜನರ ಧ್ವನಿಗೆ ವೇದಿಕೆ", color: "text-[#172B4D] bg-blue-50" },
                  { icon: Lightbulb, label: "ನಿಖರ ಮತ್ತು ನ್ಯಾಯಸಮ್ಮತ ಮಾಹಿತಿ", color: "text-amber-700 bg-amber-50" },
                  { icon: CheckCircle2, label: "ಜವಾಬ್ದಾರಿಯುತ ಪತ್ರಿಕೋದ್ಯಮ", color: "text-emerald-700 bg-emerald-50" },
                ].map(({ icon: Icon, label, color }) => (
                  <div key={label} className="flex items-center gap-3 px-5 py-3.5">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-[#172B4D]">{label}</span>
                  </div>
                ))}
              </div>
              {/* Bottom caption */}
              <div className="px-5 py-3 bg-[#F8F9FA] border-t border-[#E2E8F0]">
                <p className="text-[11px] text-[#5A6A85] text-center">
                  ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ &nbsp;•&nbsp; ಡಿಜಿಟಲ್ ಆವೃತ್ತಿ
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════
          SECTION 4 — LATEST EDITION (Full LatestEditionHero)
          ═══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-6">
        {/* Section heading */}
        <div className="flex items-center gap-2.5 border-b border-[#E2E8F0] pb-4">
          <div className="w-1 h-7 bg-[#C62828] rounded-full shrink-0" />
          <h2 className="text-xl sm:text-2xl font-black text-[#172B4D] tracking-tight">
            ಇತ್ತೀಚಿನ ಸಂಚಿಕೆ
          </h2>
        </div>
        <LatestEditionHero edition={latestEdition} />
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 5 — PREVIOUS EDITIONS PREVIEW
          ═══════════════════════════════════════════════════════ */}
      <section className="bg-[#F8F9FA] border-t border-[#E2E8F0] py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Heading row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-1 h-7 bg-[#172B4D] rounded-full shrink-0" />
                <h2 className="text-xl sm:text-2xl font-black text-[#172B4D] tracking-tight">
                  ಹಿಂದಿನ ಸಂಚಿಕೆಗಳ ನೆನಪು
                </h2>
              </div>
              <p className="text-sm text-[#5A6A85] mt-1 ml-3.5">
                ನ್ಯಾಯ ಘರ್ಜನೆಯ ಹಿಂದಿನ ಪ್ರಕಟಿತ ಸಂಚಿಕೆಗಳನ್ನು ಒಂದೇ ಸ್ಥಳದಲ್ಲಿ ವೀಕ್ಷಿಸಿ.
              </p>
            </div>
            <Link
              href="/archives"
              className="inline-flex items-center gap-2 px-5 py-2 bg-[#172B4D] hover:bg-[#0F1C33] text-white text-sm font-semibold rounded-lg shadow-sm transition-colors shrink-0"
            >
              ಎಲ್ಲಾ ಸಂಚಿಕೆಗಳನ್ನು ನೋಡಿ
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Edition cards grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {previousEditions.map((edition) => (
              <EditionCard
                key={edition.id}
                edition={edition}
                isPlaceholder={!edition.pdfUrl || !edition.pdfUrl.startsWith("http")}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SECTION 6 — FINAL CTA
          ═══════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="bg-[#172B4D] text-white rounded-2xl px-8 py-10 sm:px-12 sm:py-12 text-center space-y-5 shadow-lg relative overflow-hidden">
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-[#C62828]/15 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-serif">
              ಸುದ್ದಿಗಳನ್ನು ಓದಿ, ಸಮಾಜವನ್ನು ಅರಿಯಿರಿ.
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              ನ್ಯಾಯ ಘರ್ಜನೆಯೊಂದಿಗೆ ಕನ್ನಡ ಓದಿನ ಹೊಸ ಡಿಜಿಟಲ್ ಅನುಭವಕ್ಕೆ ಸ್ವಾಗತ.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-1">
              <Link
                href="/latest"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#C62828] hover:bg-[#B71C1C] text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                <BookOpen className="w-4 h-4" />
                ಇತ್ತೀಚಿನ ಪತ್ರಿಕೆ ಓದಿ
              </Link>
              <Link
                href="/archives"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/25 text-sm font-semibold rounded-lg transition-all"
              >
                <Archive className="w-4 h-4 text-neutral-300" />
                ಸಂಚಿಕೆಗಳ ಸಂಗ್ರಹ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
