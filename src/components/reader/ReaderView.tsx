"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Download,
  BookOpen,
  Sparkles,
  Info,
} from "lucide-react";
import { Edition } from "@/types";
import { getStoredEditions } from "@/lib/editionsStore";

interface ReaderViewProps {
  edition: Edition;
}

export default function ReaderView({ edition: initialEdition }: ReaderViewProps) {
  const [edition, setEdition] = useState<Edition>(initialEdition);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const readerContainerRef = useRef<HTMLDivElement>(null);

  // Sync with stored editions if available on client
  useEffect(() => {
    const stored = getStoredEditions();
    const found = stored.find((e) => e.id === initialEdition.id);
    if (found) {
      setEdition(found);
    }
  }, [initialEdition.id]);

  const totalPages = edition.totalPages || 16;

  // Handle keyboard navigation for page turn and zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        setCurrentPage((p) => Math.min(totalPages, p + 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentPage((p) => Math.max(1, p - 1));
      } else if (e.key === "+" || e.key === "=") {
        setZoom((z) => Math.min(200, z + 25));
      } else if (e.key === "-") {
        setZoom((z) => Math.max(50, z - 25));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [totalPages]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      readerContainerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  return (
    <div
      ref={readerContainerRef}
      className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-900 text-white select-none"
    >
      {/* 1. READER TOP TOOLBAR */}
      <header className="h-14 bg-neutral-950 border-b border-neutral-800 px-3 sm:px-6 flex items-center justify-between shrink-0 z-30">
        {/* Left: Back & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <Link
            href="/"
            className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors shrink-0"
            title="ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="h-4 w-px bg-neutral-800 hidden sm:block shrink-0" />
          <div className="flex flex-col min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-neutral-100 flex items-center gap-1.5 truncate">
              <span className="truncate">{edition.title}</span>
              <span className="shrink-0 px-1.5 py-0.5 text-[9px] bg-amber-950 text-amber-300 border border-amber-700 rounded font-bold">
                ಮಾದರಿ ಮುನ್ನೋಟ
              </span>
            </h1>
            <p className="text-[10px] text-neutral-400 hidden sm:block truncate">
              {edition.formattedDate} • ಸಂಪುಟ {edition.volumeNumber ?? 1} • ಸಂಚಿಕೆ {edition.issueNumber ?? 1}
            </p>
          </div>
        </div>

        {/* Center: Page Controls */}
        <div className="flex items-center gap-1 sm:gap-2 bg-neutral-900 border border-neutral-800 px-2 sm:px-3 py-1 rounded-lg shrink-0">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="ಹಿಂದಿನ ಪುಟ (Arrow Left)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-1 text-xs font-semibold px-1 text-neutral-200">
            <span className="hidden xs:inline">ಪುಟ</span>
            <span className="font-mono text-white bg-neutral-800 px-1.5 py-0.5 rounded text-[11px]">
              {currentPage}
            </span>
            <span className="text-neutral-500">/</span>
            <span className="font-mono text-neutral-400">{totalPages}</span>
          </div>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="p-1 rounded hover:bg-neutral-800 text-neutral-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
            title="ಮುಂದಿನ ಪುಟ (Arrow Right)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Zoom & Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Zoom controls */}
          <div className="hidden md:flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-0.5 rounded-lg">
            <button
              type="button"
              disabled={zoom <= 50}
              onClick={() => setZoom((z) => Math.max(50, z - 25))}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-300 disabled:opacity-30 transition-colors"
              title="ಜೂಮ್ ಕಡಿಮೆ (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="text-[11px] font-mono px-1.5 text-neutral-300">
              {zoom}%
            </span>

            <button
              type="button"
              disabled={zoom >= 200}
              onClick={() => setZoom((z) => Math.min(200, z + 25))}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-300 disabled:opacity-30 transition-colors"
              title="ಜೂಮ್ ಹೆಚ್ಚು (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setZoom(100)}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="ರೀಸೆಟ್ (100%)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Download PDF button */}
          <button
            type="button"
            onClick={() => {
              alert(`"${edition.title}" ಪತ್ರಿಕೆಯು ಡೆವಲಪ್‌ಮೆಂಟ್ ಪ್ರಿವ್ಯೂ ಆಗಿದೆ. ನೈಜ ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್ ಮುಂದಿನ ಹಂತದಲ್ಲಿ ಅಪ್‌ಲೋಡ್ ಆದ ನಂತರ ಲಭ್ಯವಾಗಲಿದೆ.`);
            }}
            className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
            title="ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್ (ಮಾದರಿ)"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
            title={isFullscreen ? "ಪೂರ್ಣ ಪರದೆ ಮುಕ್ತಾಯ" : "ಪೂರ್ಣ ಪರದೆ (Fullscreen)"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* 2. MAIN NEWSPAPER DISPLAY CANVAS AREA */}
      <main className="flex-1 overflow-auto bg-neutral-900 p-3 sm:p-6 lg:p-8 flex items-center justify-center relative">
        <div
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: "center center",
            transition: "transform 0.15s ease-out",
          }}
          className="relative w-full max-w-2xl aspect-[1/1.414] bg-white text-neutral-900 shadow-2xl rounded-sm p-5 sm:p-8 lg:p-10 flex flex-col justify-between border border-neutral-300 my-auto"
        >
          {/* Header of Simulated Page */}
          <div className="border-b-2 border-neutral-900 pb-2.5 text-center">
            <div className="flex items-baseline justify-between text-[10px] sm:text-[11px] font-bold text-neutral-600 pb-1">
              <span>ನ್ಯಾಯಘರ್ಜನೆ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ</span>
              <span className="text-[#C62828] hidden xs:inline">ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ</span>
              <span>{edition.formattedDate}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-[#172B4D] font-serif">
              ನ್ಯಾಯಘರ್ಜನೆ
            </h2>
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] text-neutral-500 pt-1 border-t border-neutral-300 mt-1">
              <span>ಸಂಪುಟ {edition.volumeNumber ?? 1}</span>
              <span className="font-bold text-[#C62828]">ಪುಟ: {currentPage} / {totalPages} (ಮಾದರಿ)</span>
              <span>ಸಂಚಿಕೆ {edition.issueNumber ?? 1}</span>
            </div>
          </div>

          {/* Body Simulation Area with clearly marked Phase 2 notice */}
          <div className="my-auto py-6 sm:py-8 text-center space-y-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-red-50 text-[#C62828] flex items-center justify-center mx-auto shadow-xs">
              <BookOpen className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>

            <div className="space-y-2 max-w-md mx-auto px-2">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>ವಾಚಕ ವಿನ್ಯಾಸ ಮುನ್ನೋಟ (Development Preview)</span>
              </span>

              <h3 className="text-base sm:text-lg lg:text-xl font-bold text-[#172B4D]">
                ಪುಟ {currentPage} — {edition.title}
              </h3>

              <p className="text-xs text-[#5A6A85] leading-relaxed">
                ಇ-ಪತ್ರಿಕೆಯ ವಾಚಕ ಇಂಟರ್‌ಫೇಸ್ (Toolbar, Zoom, Page Controls, Fullscreen) ಸಂಪೂರ್ಣ ಸಿದ್ಧವಾಗಿದೆ. ಮುಂದಿನ ಹಂತದಲ್ಲಿ ನೈಜ ಪಿಡಿಎಫ್ ಫ್ಲಿಪ್‌ಬುಕ್ ರೆಂಡರಿಂಗ್ ಅಳವಡಿಸಲಾಗುವುದು.
              </p>
            </div>

            {/* Quick page flip prompt */}
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded disabled:opacity-30"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>ಹಿಂದಿನ ಪುಟ</span>
              </button>
              <span className="text-xs font-bold text-neutral-600">
                {currentPage} / {totalPages}
              </span>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-[#172B4D] hover:bg-[#0F1C33] text-white rounded disabled:opacity-30"
              >
                <span>ಮುಂದಿನ ಪುಟ</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Footer of Simulated Page */}
          <div className="border-t border-neutral-300 pt-2 flex items-center justify-between text-[9px] sm:text-[10px] text-neutral-500">
            <span>ನ್ಯಾಯಘರ್ಜನೆ — ಕನ್ನಡ ಮಾಸಿಕ ಪತ್ರಿಕೆ</span>
            <span className="hidden sm:inline">www.nyaayagharjane.com</span>
            <span>ಪುಟ: {currentPage} (ಮಾದರಿ)</span>
          </div>
        </div>
      </main>

      {/* 3. BOTTOM THUMBNAILS & KEYBOARD SHORTCUTS BAR */}
      <footer className="h-10 bg-neutral-950 border-t border-neutral-800 px-3 sm:px-4 flex items-center justify-between text-[10px] sm:text-[11px] text-neutral-400 shrink-0">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          <span className="hidden sm:inline">ಕೀಬೋರ್ಡ್ ಶಾರ್ಟ್‌ಕಟ್:</span>
          <span>← ಮತ್ತು → ಪುಟ ತಿರುಗಿಸಲು</span>
          <span className="hidden md:inline">• + ಮತ್ತು - ಜೂಮ್ ಮಾಡಲು</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden xs:inline">ಸಂಚಿಕೆ: {edition.formattedDate}</span>
          <span className="hidden xs:inline">•</span>
          <span className="text-neutral-300 font-medium">ಒಟ್ಟು {totalPages} ಪುಟಗಳು</span>
        </div>
      </footer>
    </div>
  );
}
