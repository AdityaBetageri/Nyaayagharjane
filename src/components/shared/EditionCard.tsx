"use client";

import Link from "next/link";
import { BookOpen, Download, Calendar, FileText, Sparkles } from "lucide-react";
import { Edition } from "@/types";

interface EditionCardProps {
  edition: Edition;
  isPlaceholder?: boolean;
}

export default function EditionCard({ edition, isPlaceholder = true }: EditionCardProps) {
  return (
    <article className="group bg-white rounded-lg border border-[#E2E8F0] shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden min-w-0">
      {/* Newspaper Cover Preview Area (Tabloid Ratio: ~ 1:1.38) */}
      <div className="relative aspect-[1/1.38] bg-linear-to-b from-neutral-100 to-neutral-200 border-b border-[#E2E8F0] p-4 flex flex-col justify-between overflow-hidden">
        {/* Placeholder Badge */}
        {isPlaceholder && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
              <Sparkles className="w-3 h-3 text-amber-700 shrink-0" />
              <span>ಮಾದರಿ ಮುನ್ನೋಟ</span>
            </span>
          </div>
        )}

        {/* Newspaper Cover Mock Header */}
        <div className="text-center pt-1">
          <div className="border-b border-neutral-300 pb-1.5">
            <h4 className="text-xl sm:text-2xl font-black text-[#172B4D] tracking-tight font-serif">
              ನ್ಯಾಯಘರ್ಜನೆ
            </h4>
            <p className="text-[9px] sm:text-[10px] font-bold tracking-widest text-[#C62828] uppercase">
              NYAAYAGHARJANE
            </p>
          </div>
          <div className="flex items-center justify-between text-[10px] text-neutral-500 py-1 border-b border-neutral-300">
            <span>ಸಂಪುಟ {edition.volumeNumber ?? 1}</span>
            <span className="font-semibold text-neutral-700">{edition.formattedDate}</span>
            <span>ಸಂಚಿಕೆ {edition.issueNumber ?? 1}</span>
          </div>
        </div>

        {/* Cover Center Content Simulation */}
        <div className="my-auto text-center px-3 py-4 bg-white/80 rounded-md border border-neutral-200 backdrop-blur-xs">
          <FileText className="w-8 h-8 text-[#172B4D]/60 mx-auto mb-1.5" />
          <p className="text-xs font-bold text-[#172B4D] line-clamp-1">
            {edition.title}
          </p>
          <p className="text-[10px] text-[#C62828] font-semibold mt-0.5">
            ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ
          </p>
          <p className="text-[9px] text-amber-800 bg-amber-50 rounded py-0.5 px-1.5 font-medium mt-1.5 inline-block">
            * ಡೆವಲಪ್‌ಮೆಂಟ್ ಪ್ರಿವ್ಯೂ ಮಾದರಿ
          </p>
        </div>

        {/* Cover Bottom Bar */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-neutral-600 bg-white/90 px-2.5 py-1 rounded-sm border border-neutral-200">
          <span>ಒಟ್ಟು {edition.totalPages} ಪುಟಗಳು</span>
          <span className="text-[10px] text-neutral-500">{edition.formattedFileSize ?? "PDF ಮಾದರಿ"}</span>
        </div>
      </div>

      {/* Card Body & Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#5A6A85] mb-1">
            <Calendar className="w-3.5 h-3.5 text-[#C62828] shrink-0" />
            <span>{edition.formattedDate}</span>
            <span className="text-neutral-300">•</span>
            <span className="text-[11px] text-amber-700 font-medium">ಮಾದರಿ ಆವೃತ್ತಿ</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#172B4D] group-hover:text-[#C62828] transition-colors line-clamp-1">
            {edition.title}
          </h3>
          <p className="text-xs text-[#5A6A85] mt-1 line-clamp-2 leading-relaxed">
            {edition.description ?? "ಅಭಿವೃದ್ಧಿ ಮತ್ತು ವಿನ್ಯಾಸ ಪರಿಶೀಲನೆಗಾಗಿ ಮಾದರಿ ಸಂಚಿಕೆ (Preview Data)."}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E2E8F0]">
          <Link
            href={`/reader/${edition.id}`}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 bg-[#172B4D] hover:bg-[#0F1C33] text-white text-xs font-semibold rounded-md transition-colors text-center"
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span>ಪತ್ರಿಕೆ ಓದಿ</span>
          </Link>
          <button
            type="button"
            onClick={() => {
              alert(`"${edition.title}" ಪತ್ರಿಕೆಯು ಡೆವಲಪ್‌ಮೆಂಟ್ ಮಾದರಿಯಾಗಿದೆ (Development Preview). ಅಧಿಕೃತ ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್ ಮುಂದಿನ ಹಂತದಲ್ಲಿ ಲಭ್ಯವಾಗಲಿದೆ.`);
            }}
            className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 bg-white hover:bg-neutral-50 text-[#172B4D] border border-[#E2E8F0] text-xs font-semibold rounded-md transition-colors text-center"
            title="ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್ (ಮಾದರಿ)"
          >
            <Download className="w-3.5 h-3.5 text-[#C62828] shrink-0" />
            <span>ಡೌನ್‌ಲೋಡ್</span>
          </button>
        </div>
      </div>
    </article>
  );
}
