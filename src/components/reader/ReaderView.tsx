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
  ExternalLink,
  BookOpen,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Edition } from "@/types";
import { getStoredEditions } from "@/lib/editionsStore";
import { fetchR2Catalogue, r2ItemToEdition } from "@/lib/r2Service";

interface ReaderViewProps {
  edition: Edition;
}

export default function ReaderView({ edition: initialEdition }: ReaderViewProps) {
  const [edition, setEdition] = useState<Edition>(initialEdition);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const readerContainerRef = useRef<HTMLDivElement>(null);

  // Sync with R2 or stored editions if available on client
  useEffect(() => {
    let isMounted = true;

    // Check R2 catalogue first
    fetchR2Catalogue({ bypassCache: false, publishedOnly: false }).then((res) => {
      if (!isMounted) return;
      if (res.success && res.data.length > 0) {
        const found = res.data.find((item) => item.id === initialEdition.id);
        if (found) {
          setEdition(r2ItemToEdition(found));
          return;
        }
      }

      // Check local storage fallback
      const stored = getStoredEditions();
      const foundStored = stored.find((e) => e.id === initialEdition.id);
      if (foundStored) {
        setEdition(foundStored);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [initialEdition.id]);

  const totalPages = edition.totalPages || 16;
  const hasDirectPdf = !!edition.pdfUrl && edition.pdfUrl.startsWith("http");

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

  const handleRetryPdf = () => {
    setPdfLoadError(false);
    setIframeKey((prev) => prev + 1);
  };

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
              {hasDirectPdf ? (
                <span className="shrink-0 px-1.5 py-0.5 text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700 rounded font-bold">
                  R2 PDF
                </span>
              ) : (
                <span className="shrink-0 px-1.5 py-0.5 text-[9px] bg-amber-950 text-amber-300 border border-amber-700 rounded font-bold">
                  ಮಾದರಿ ಮುನ್ನೋಟ
                </span>
              )}
            </h1>
            <p className="text-[10px] text-neutral-400 hidden sm:block truncate">
              {edition.formattedDate} • {edition.edition || "ರಾಜ್ಯ ಆವೃತ್ತಿ"}
            </p>
          </div>
        </div>

        {/* Center: Page Controls (When not in iframe native controls or for simulated pages) */}
        {!hasDirectPdf && (
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
        )}

        {/* Right: Zoom & Actions */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Zoom controls for simulated view */}
          {!hasDirectPdf && (
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
          )}

          {/* Open in New Tab Button (When PDF URL is present) */}
          {hasDirectPdf && (
            <a
              href={edition.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-medium transition-colors"
              title="ಹೊಸ ಟ್ಯಾಬ್‌ನಲ್ಲಿ ತೆರೆಯಿರಿ"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ಹೊಸ ಟ್ಯಾಬ್</span>
            </a>
          )}

          {/* Direct Download PDF Button */}
          {hasDirectPdf ? (
            <a
              href={edition.pdfUrl}
              download={edition.fileName || `${edition.id}.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-semibold shadow-xs transition-colors"
              title="ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್ ಮಾಡಿ"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ಡೌನ್‌ಲೋಡ್</span>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => {
                alert(
                  `"${edition.title}" ಪತ್ರಿಕೆಯು ಡೆವಲಪ್‌ಮೆಂಟ್ ಪ್ರಿವ್ಯೂ ಆಗಿದೆ. ನೈಜ R2 ಪಿಡಿಎಫ್ ಲಿಂಕ್ ಅಪ್‌ಲೋಡ್ ಆದ ನಂತರ ನೇರ ಡೌನ್‌ಲೋಡ್ ಲಭ್ಯವಾಗಲಿದೆ.`
                );
              }}
              className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
              title="ಪಿಡಿಎಫ್ ಡೌನ್‌ಲೋಡ್ (ಮಾದರಿ)"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

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

      {/* 2. MAIN DISPLAY CANVAS / R2 PDF VIEWER */}
      <main className="flex-1 overflow-hidden bg-neutral-900 relative flex flex-col items-center justify-center">
        {hasDirectPdf ? (
          /* ========================================================
             A. DIRECT CLOUDFLARE R2 PDF VIEWER
             ======================================================== */
          <div className="w-full h-full relative flex flex-col bg-neutral-950">
            {pdfLoadError ? (
              /* PDF Load Failure Error Display */
              <div className="m-auto max-w-md p-6 bg-neutral-900 border border-neutral-800 rounded-xl text-center space-y-4 shadow-xl">
                <div className="w-12 h-12 rounded-full bg-red-950 text-red-400 border border-red-800 flex items-center justify-center mx-auto">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-neutral-100">
                    ಪಿಡಿಎಫ್ ಫೈಲ್ ಲೋಡ್ ಆಗುತ್ತಿಲ್ಲ
                  </h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">
                    Cloudflare R2 ಸಾರ್ವಜನಿಕ ಡೊಮೈನ್ ಅಥವಾ ಫೈಲ್ ವಿಳಾಸವನ್ನು ಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಿಲ್ಲ.
                  </p>
                </div>
                <div className="bg-neutral-950 p-2.5 rounded-md text-[11px] font-mono text-neutral-400 break-all border border-neutral-800">
                  {edition.pdfUrl}
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleRetryPdf}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold rounded-md transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>ಮತ್ತೊಮ್ಮೆ ಪ್ರಯತ್ನಿಸಿ</span>
                  </button>
                  <a
                    href={edition.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-semibold rounded-md transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>ನೇರ ಲಿಂಕ್ ಮೂಲಕ ತೆರೆಯಿರಿ</span>
                  </a>
                </div>
              </div>
            ) : (
              /* Direct R2 PDF iframe (Direct stream from Cloudflare R2 custom domain) */
              <iframe
                key={iframeKey}
                src={`${edition.pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                title={edition.title}
                className="w-full h-full border-none"
                loading="lazy"
                onError={() => setPdfLoadError(true)}
              />
            )}
          </div>
        ) : (
          /* ========================================================
             B. SIMULATED DEMO CANVAS (When no real PDF is attached)
             ======================================================== */
          <div className="flex-1 overflow-auto w-full p-3 sm:p-6 lg:p-8 flex items-center justify-center">
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
                  <span className="font-bold text-[#C62828]">
                    ಪುಟ: {currentPage} / {totalPages} (ಮಾದರಿ)
                  </span>
                  <span>ಸಂಚಿಕೆ {edition.issueNumber ?? 1}</span>
                </div>
              </div>

              {/* Body Simulation Area */}
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
                    ಈ ಆವೃತ್ತಿಯು ಮಾದರಿ ಮುನ್ನೋಟವಾಗಿದೆ. ಅಡ್ಮಿನ್ ಪ್ಯಾನೆಲ್ ಮೂಲಕ Cloudflare R2 ಗೆ PDF ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ಕ್ಯಾಟಲಾಗ್ ಸೇರಿಸಿದ ನಂತರ ನೈಜ PDF ಇಲ್ಲಿ ನೇರವಾಗಿ ಪ್ರದರ್ಶನಗೊಳ್ಳುತ್ತದೆ.
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-neutral-300 pt-2 flex items-center justify-between text-[10px] text-neutral-500">
                <span>ನ್ಯಾಯಘರ್ಜನೆ ಡಿಜಿಟಲ್ ಇ-ಪತ್ರಿಕೆ</span>
                <span>ಪುಟ {currentPage}</span>
                <span>ಮುದ್ರಣ & ಪ್ರಕಟಣೆ: ಬೆಂಗಳೂರು</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
