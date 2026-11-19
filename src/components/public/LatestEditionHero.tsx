"use client";

import Link from "next/link";
import {
  BookOpen,
  Download,
  Calendar,
  Layers,
  HardDrive,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Edition } from "@/types";

interface LatestEditionHeroProps {
  edition: Edition;
  showAllButtons?: boolean;
}

export default function LatestEditionHero({
  edition,
  showAllButtons = true,
}: LatestEditionHeroProps) {
  const hasDirectPdf = !!edition.pdfUrl && edition.pdfUrl.startsWith("http");

  return (
    <section className="w-full bg-white border border-[#E2E8F0] rounded-xl p-5 sm:p-8 lg:p-10 shadow-xs">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left: Newspaper Cover Preview */}
        <div className="lg:col-span-5 flex justify-center w-full">
          <div className="relative w-full max-w-sm aspect-[1/1.41] bg-linear-to-b from-stone-50 via-stone-100 to-stone-200 rounded-lg border-2 border-stone-300 shadow-md p-4 sm:p-5 flex flex-col justify-between overflow-hidden">
            {/* Top Stamp */}
            {hasDirectPdf && (
              <div className="absolute top-3 right-3 z-10">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-700 text-white shadow-xs">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ಪ್ರಕಟಿತ ಆವೃತ್ತಿ</span>
                </span>
              </div>
            )}

            {/* Newspaper Front Page Masthead Simulation */}
            <div className="text-center pt-2 border-b-2 border-stone-400 pb-2.5">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#172B4D] tracking-tight font-serif pb-1">
                ನ್ಯಾಯ ಘರ್ಜನೆ
              </h3>
              <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-stone-600 mt-2 pt-1 border-t border-stone-300">
                <span>ಸಂಪುಟ {edition.volumeNumber ?? 1}</span>
                <span className="font-semibold text-stone-900">{edition.formattedDate}</span>
                <span>ಸಂಚಿಕೆ {edition.issueNumber ?? 1}</span>
              </div>
            </div>

            {/* Front Page Spotlight */}
            <div className="my-auto space-y-2.5 bg-white/85 p-3.5 rounded-md border border-stone-200 backdrop-blur-xs">
              <div className="inline-block px-2 py-0.5 bg-amber-100 text-amber-900 rounded text-[10px] sm:text-[11px] font-bold">
                {edition.edition || "ರಾಜ್ಯ ಆವೃತ್ತಿ"}
              </div>
              <h4 className="text-sm sm:text-base font-bold text-[#172B4D] leading-snug">
                {edition.title}
              </h4>
              <p className="text-xs text-[#5A6A85] leading-relaxed line-clamp-3">
                {edition.description || "ಸತ್ಯ ಮತ್ತು ನ್ಯಾಯದ ಪರವಾದ ಸಮಗ್ರ ವಿಶ್ಲೇಷಣೆ, ರಾಜ್ಯದ ಪ್ರಮುಖ ವಿದ್ಯಮಾನಗಳು ಮತ್ತು ವಿಶೇಷ ತನಿಖಾ ಲೇಖನಗಳು."}
              </p>
            </div>

            {/* Cover Bottom Dateline */}
            <div className="flex items-center justify-between text-[11px] font-semibold text-stone-700 bg-white/95 p-2 rounded-sm border border-stone-200">
              <span>{edition.totalPages} ಪುಟಗಳು</span>
              <span className="text-[#C62828] font-bold text-[10px]">ಡಿಜಿಟಲ್ ಇ-ಪತ್ರಿಕೆ</span>
              <span>{edition.formattedFileSize ?? "೧೨.೪ MB"}</span>
            </div>
          </div>
        </div>

        {/* Right: Edition Details & Actions */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
              <Calendar className="w-3.5 h-3.5 text-amber-700" />
              <span>ಪ್ರಸ್ತುತ ಮಾಸಿಕ ಆವೃತ್ತಿ</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#172B4D] tracking-tight">
              {edition.title}
            </h2>
            <p className="text-sm sm:text-base font-medium text-[#C62828]">
              ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ
            </p>
            <p className="text-xs sm:text-sm text-[#5A6A85] leading-relaxed pt-1">
              ನ್ಯಾಯ ಘರ್ಜನೆ ಮಾಸಿಕ ಪತ್ರಿಕೆಯ ಈ ಸಂಚಿಕೆಯನ್ನು ನೀವು ಸುಲಭವಾಗಿ ಕಂಪ್ಯೂಟರ್, ಟ್ಯಾಬ್ಲೆಟ್ ಅಥವಾ ಮೊಬೈಲ್ ಪರದೆಯ ಮೂಲಕ ನೇರವಾಗಿ ಓದಬಹುದು ಅಥವಾ ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಓದಲು ಉಚಿತವಾಗಿ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿಕೊಳ್ಳಬಹುದು.
            </p>
          </div>

          {/* Key Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 py-3 border-y border-[#E2E8F0]">
            <div className="bg-[#F8F9FA] p-3 rounded-lg border border-[#E2E8F0]">
              <span className="text-[11px] sm:text-xs text-[#5A6A85] flex items-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-[#C62828]" />
                ಪ್ರಕಟಣಾ ಮಾಹೆ
              </span>
              <p className="text-xs sm:text-sm font-bold text-[#172B4D]">{edition.formattedDate}</p>
            </div>
            <div className="bg-[#F8F9FA] p-3 rounded-lg border border-[#E2E8F0]">
              <span className="text-[11px] sm:text-xs text-[#5A6A85] flex items-center gap-1.5 mb-1">
                <Layers className="w-3.5 h-3.5 text-[#C62828]" />
                ಒಟ್ಟು ಪುಟಗಳು
              </span>
              <p className="text-xs sm:text-sm font-bold text-[#172B4D]">{edition.totalPages} ಪುಟಗಳು</p>
            </div>
            <div className="bg-[#F8F9FA] p-3 rounded-lg border border-[#E2E8F0] col-span-2 sm:col-span-1">
              <span className="text-[11px] sm:text-xs text-[#5A6A85] flex items-center gap-1.5 mb-1">
                <HardDrive className="w-3.5 h-3.5 text-[#C62828]" />
                ಫೈಲ್ ಗಾತ್ರ
              </span>
              <p className="text-xs sm:text-sm font-bold text-[#172B4D]">{edition.formattedFileSize ?? "೧೨.೪ MB"}</p>
            </div>
          </div>

          {/* Highlights checklist */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-[#172B4D] uppercase tracking-wider">
              ವಿಶೇಷ ಸೌಲಭ್ಯಗಳು:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#5A6A85]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Cloudflare R2 ವೇಗದ CDN ವಿತರಣೆ</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ಹೈ-ರೆಸಲ್ಯೂಶನ್ ಜೂಮ್ ಸೌಲಭ್ಯ</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ಮೊಬೈಲ್ ಮತ್ತು ಡೆಸ್ಕ್‌ಟಾಪ್ ಬೆಂಬಲ</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ನೇರ ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್ ವ್ಯವಸ್ಥೆ</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1">
            <Link
              href={`/reader/${edition.id}`}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs transition-all hover:shadow-md"
            >
              <BookOpen className="w-4 h-4" />
              <span>ಪತ್ರಿಕೆ ಓದಿ (ವಾಚಕ)</span>
            </Link>

            {hasDirectPdf ? (
              <a
                href={edition.pdfUrl}
                download={edition.fileName || `${edition.id}.pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white hover:bg-neutral-50 text-[#172B4D] border border-[#E2E8F0] text-xs sm:text-sm font-semibold rounded-lg shadow-2xs transition-colors"
              >
                <Download className="w-4 h-4 text-[#C62828]" />
                <span>ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್</span>
              </a>
            ) : (
              <button
                type="button"
                onClick={() => {
                  alert(
                    `"${edition.title}" ಪತ್ರಿಕೆಯ ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್ ಸದ್ಯದಲ್ಲೇ ಲಭ್ಯವಾಗಲಿದೆ.`
                  );
                }}
                className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-white hover:bg-neutral-50 text-[#172B4D] border border-[#E2E8F0] text-xs sm:text-sm font-semibold rounded-lg shadow-2xs transition-colors"
              >
                <Download className="w-4 h-4 text-[#C62828]" />
                <span>ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್</span>
              </button>
            )}

            {showAllButtons && (
              <Link
                href="/archives"
                className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-[#172B4D] hover:text-[#C62828] transition-colors sm:ml-auto"
              >
                <span>ಹಿಂದಿನ ಸಂಚಿಕೆಗಳು</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
