"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, Calendar, FileText } from "lucide-react";
import { Edition } from "@/types";
import PdfThumbnail from "./PdfThumbnail";
import { formatSizeInEnglishNumbers } from "@/lib/r2Service";

interface EditionCardProps {
  edition: Edition;
  isPlaceholder?: boolean;
}

export default function EditionCard({ edition }: EditionCardProps) {
  const hasDirectPdf = Boolean(
    edition.pdfUrl &&
    (edition.pdfUrl.startsWith("http") || edition.pdfUrl.startsWith("/")) &&
    !edition.pdfUrl.includes("files.yourdomain.com")
  );

  return (
    <article className="group bg-white rounded-lg border border-[#E2E8F0] shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden min-w-0">
      {/* Newspaper Cover Preview Area (Tabloid Ratio: ~ 1:1.38) */}
      <Link
        href={`/reader/${edition.id}`}
        className="relative aspect-[1/1.38] bg-neutral-100 border-b border-[#E2E8F0] overflow-hidden flex items-center justify-center cursor-pointer group/cover"
        title="ಪತ್ರಿಕೆ ಓದಲು ಕ್ಲಿಕ್ ಮಾಡಿ"
      >
        {/* Hover overlay hint */}
        <div className="absolute inset-0 bg-black/0 group-hover/cover:bg-black/20 transition-all z-10 flex items-center justify-center pointer-events-none">
          <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-md opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>ಓದಿ</span>
          </span>
        </div>

        {hasDirectPdf ? (
          <PdfThumbnail
            pdfUrl={edition.pdfUrl}
            className="w-full h-full"
            fallback={
              <div className="p-4 flex flex-col justify-between w-full h-full bg-linear-to-b from-neutral-100 to-neutral-200">
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

                <div className="my-auto text-center px-3 py-4 bg-white/80 rounded-md border border-neutral-200 backdrop-blur-xs">
                  <FileText className="w-8 h-8 text-[#172B4D]/60 mx-auto mb-1.5" />
                  <p className="text-xs font-bold text-[#172B4D] line-clamp-1">
                    {edition.title}
                  </p>
                  <p className="text-[10px] text-[#C62828] font-semibold mt-0.5">
                    ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-neutral-600 bg-white/90 px-2.5 py-1 rounded-sm border border-neutral-200">
                  <span>ಒಟ್ಟು {edition.totalPages} ಪುಟಗಳು</span>
                  <span className="text-[10px] text-neutral-500 font-sans">{formatSizeInEnglishNumbers(edition.formattedFileSize)}</span>
                </div>
              </div>
            }
          />
        ) : (
          <div className="p-4 flex flex-col justify-between w-full h-full bg-linear-to-b from-neutral-100 to-neutral-200">
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

            <div className="my-auto text-center px-3 py-4 bg-white/80 rounded-md border border-neutral-200 backdrop-blur-xs">
              <FileText className="w-8 h-8 text-[#172B4D]/60 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-[#172B4D] line-clamp-1">
                {edition.title}
              </p>
              <p className="text-[10px] text-[#C62828] font-semibold mt-0.5">
                ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ
              </p>
            </div>

            <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-neutral-600 bg-white/90 px-2.5 py-1 rounded-sm border border-neutral-200">
              <span>ಒಟ್ಟು {edition.totalPages} ಪುಟಗಳು</span>
              <span className="text-[10px] text-neutral-500 font-sans">{formatSizeInEnglishNumbers(edition.formattedFileSize)}</span>
            </div>
          </div>
        )}
      </Link>

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

        {/* Action Button - Single Prominent Button */}
        <div className="pt-2 border-t border-[#E2E8F0]">
          <Link
            href={`/reader/${edition.id}`}
            className="w-full cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#172B4D] hover:bg-[#0F1C33] text-white text-xs sm:text-sm font-semibold rounded-md transition-colors text-center shadow-2xs"
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0 text-amber-300" />
            <span>ಪತ್ರಿಕೆ ಓದಿ</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
