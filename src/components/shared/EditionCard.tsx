"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, Download, Calendar, FileText, CheckCircle2 } from "lucide-react";
import { Edition } from "@/types";

interface EditionCardProps {
  edition: Edition;
  isPlaceholder?: boolean;
}

export default function EditionCard({ edition }: EditionCardProps) {
  const hasDirectPdf = !!edition.pdfUrl && edition.pdfUrl.startsWith("http");

  return (
    <article className="group bg-white rounded-lg border border-[#E2E8F0] shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden min-w-0">
      {/* Newspaper Cover Preview Area (Tabloid Ratio: ~ 1:1.38) */}
      <div className="relative aspect-[1/1.38] bg-linear-to-b from-neutral-100 to-neutral-200 border-b border-[#E2E8F0] p-4 flex flex-col justify-between overflow-hidden">
        {/* Status Badge */}
        {hasDirectPdf && (
          <div className="absolute top-2.5 right-2.5 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
              <CheckCircle2 className="w-3 h-3 text-emerald-700 shrink-0" />
              <span>ಪ್ರಕಟಿತ ಆವೃತ್ತಿ</span>
            </span>
          </div>
        )}

        {/* Newspaper Cover Mock Header */}
        <div className="text-center pt-1 flex flex-col items-center">
          <div className="border-b border-neutral-300 pb-2 w-full flex justify-center">
            <Image
              src="/nyaayagharjane-title.png"
              alt="ನ್ಯಾಯ ಘರ್ಜನೆ"
              width={918}
              height={198}
              className="h-6 sm:h-7 w-auto object-contain"
            />
          </div>
          <div className="w-full flex items-center justify-between text-[10px] text-neutral-500 py-1 border-b border-neutral-300">
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
          <p className="text-[9px] text-neutral-600 bg-neutral-100 rounded py-0.5 px-1.5 font-medium mt-1.5 inline-block">
            {edition.edition || "ರಾಜ್ಯ ಆವೃತ್ತಿ"}
          </p>
        </div>

        {/* Cover Bottom Bar */}
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-neutral-600 bg-white/90 px-2.5 py-1 rounded-sm border border-neutral-200">
          <span>ಒಟ್ಟು {edition.totalPages} ಪುಟಗಳು</span>
          <span className="text-[10px] text-neutral-500">{edition.formattedFileSize ?? "೧೨.೪ MB"}</span>
        </div>
      </div>

      {/* Card Body & Details */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#5A6A85] mb-1">
            <Calendar className="w-3.5 h-3.5 text-[#C62828] shrink-0" />
            <span>{edition.formattedDate}</span>
            <span className="text-neutral-300">•</span>
            <span className="text-[11px] text-neutral-600 font-medium">
              {edition.edition || "ರಾಜ್ಯ ಆವೃತ್ತಿ"}
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#172B4D] group-hover:text-[#C62828] transition-colors line-clamp-1">
            {edition.title}
          </h3>
          <p className="text-xs text-[#5A6A85] mt-1 line-clamp-2 leading-relaxed">
            {edition.description ?? "ನ್ಯಾಯ ಘರ್ಜನೆ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ."}
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

          {hasDirectPdf ? (
            <a
              href={edition.pdfUrl}
              download={edition.fileName || `${edition.id}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 bg-white hover:bg-neutral-50 text-[#172B4D] border border-[#E2E8F0] text-xs font-semibold rounded-md transition-colors text-center"
              title="ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ"
            >
              <Download className="w-3.5 h-3.5 text-[#C62828] shrink-0" />
              <span>ಡೌನ್‌ಲೋಡ್</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                alert(
                  `"${edition.title}" ಪತ್ರಿಕೆಯ ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್ ಸದ್ಯದಲ್ಲೇ ಲಭ್ಯವಾಗಲಿದೆ.`
                );
              }}
              className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 bg-white hover:bg-neutral-50 text-[#172B4D] border border-[#E2E8F0] text-xs font-semibold rounded-md transition-colors text-center"
              title="ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್"
            >
              <Download className="w-3.5 h-3.5 text-[#C62828] shrink-0" />
              <span>ಡೌನ್‌ಲೋಡ್</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
