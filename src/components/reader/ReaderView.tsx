"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Scissors,
  X,
  AlertCircle,
  Download,
  Check,
} from "lucide-react";
import { Edition } from "@/types";
import { getStoredEditions } from "@/lib/editionsStore";
import { fetchR2Catalogue, r2ItemToEdition } from "@/lib/r2Service";
import ArticleClipModal from "./ArticleClipModal";
import { createBrandedClip } from "./cropHelper";
import { ThinArcLoader } from "@/components/shared/ThinArcLoader";

/* Light green accent for clip tool drag box */
const GREEN_DRAG = "#22C55E";
const GREEN_DRAG_BG = "rgba(34,197,94,0.25)";

interface ReaderViewProps {
  edition: Edition;
}

/** Proxy R2 URL through Next.js API to guarantee zero CORS issues */
function getPdfStreamUrl(url?: string): string {
  if (!url) return "";
  if (url.includes(".r2.dev/")) {
    const key = url.split(".r2.dev/")[1];
    return `/api/r2/file?key=${encodeURIComponent(key)}`;
  }
  return url;
}

/** Dynamically load PDF.js from official cdnjs */
let pdfjsPromise: Promise<any> | null = null;
function loadPdfJs(): Promise<any> {
  if (typeof window === "undefined") return Promise.reject(new Error("Window not available"));
  if ((window as any).pdfjsLib) return Promise.resolve((window as any).pdfjsLib);
  if (pdfjsPromise) return pdfjsPromise;

  pdfjsPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.async = true;
    script.onload = () => {
      const pdfjs = (window as any).pdfjsLib;
      if (pdfjs) {
        pdfjs.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(pdfjs);
      } else {
        reject(new Error("pdfjsLib not available on window"));
      }
    };
    script.onerror = () => reject(new Error("Failed to load PDF.js from CDN"));
    document.head.appendChild(script);
  });
  return pdfjsPromise;
}

export default function ReaderView({ edition: initialEdition }: ReaderViewProps) {
  const router = useRouter();
  const [edition, setEdition] = useState<Edition>(initialEdition);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialEdition.totalPages || 4);
  const [zoom, setZoom] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // PDF.js State (Real database newspaper)
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const [pdfLoadError, setPdfLoadError] = useState(false);
  const [pageAspectRatio, setPageAspectRatio] = useState<number>(944 / 1488);
  const [slideDirection, setSlideDirection] = useState<"next" | "prev" | "none">("none");
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const renderTaskRef = useRef<any>(null);

  // Clipping & Article Modal State
  const [clippedImageUrl, setClippedImageUrl] = useState<string | null>(null);
  const [activeArticleTitle, setActiveArticleTitle] = useState<string>("");
  const [isClipToolActive, setIsClipToolActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isDownloadingPage, setIsDownloadingPage] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Drag selection state for custom crop tool
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);

  const readerContainerRef = useRef<HTMLDivElement>(null);
  const mainScrollRef = useRef<HTMLDivElement>(null);
  const pageContainerRef = useRef<HTMLDivElement>(null);

  /* ── Navigation ── */
  const handleBack = useCallback(() => {
    if (typeof window !== "undefined") {
      if (document.referrer && document.referrer.includes(window.location.host)) {
        try {
          const referrerUrl = new URL(document.referrer);
          if (!referrerUrl.pathname.startsWith("/reader")) {
            router.push(referrerUrl.pathname + referrerUrl.search);
            return;
          }
        } catch {
          // Fall through
        }
      }

      if (window.history.length > 1) {
        router.back();
        return;
      }

      router.push("/archives");
    }
  }, [router]);

  /* ── Sync with R2 or stored editions ── */
  useEffect(() => {
    let isMounted = true;

    fetchR2Catalogue({ bypassCache: false, publishedOnly: false }).then((res) => {
      if (!isMounted) return;
      if (res.success && res.data.length > 0) {
        const found = res.data.find((item) => item.id === initialEdition.id);
        if (found) {
          const converted = r2ItemToEdition(found);
          setEdition(converted);
          if (converted.totalPages) setTotalPages(converted.totalPages);
          return;
        }
      }

      const stored = getStoredEditions();
      const foundStored = stored.find((e) => e.id === initialEdition.id);
      if (foundStored) {
        setEdition(foundStored);
        if (foundStored.totalPages) setTotalPages(foundStored.totalPages);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [initialEdition.id]);

  /* ── Load Real PDF from Database / R2 via PDF.js ── */
  useEffect(() => {
    const rawPdfUrl = edition.pdfUrl;
    if (!rawPdfUrl) return;

    let isCancelled = false;
    setIsPdfLoading(true);
    setPdfLoadError(false);

    const streamUrl = getPdfStreamUrl(rawPdfUrl);

    loadPdfJs()
      .then((pdfjs) => {
        if (isCancelled) return null;
        return pdfjs.getDocument({
          url: streamUrl,
          cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
          cMapPacked: true,
        }).promise;
      })
      .then((doc) => {
        if (isCancelled || !doc) return;
        setPdfDoc(doc);
        if (doc.numPages) {
          setTotalPages(doc.numPages);
        }
        setIsPdfLoading(false);
      })
      .catch((err) => {
        console.warn("PDF.js loading note:", err);
        if (!isCancelled) {
          setIsPdfLoading(false);
          setPdfLoadError(true);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [edition.pdfUrl]);

  /* ── Page Navigation with Slide Animation ── */
  const goToPage = useCallback(
    (targetPage: number) => {
      if (targetPage < 1 || targetPage > totalPages || targetPage === currentPage) return;
      setSlideDirection(targetPage > currentPage ? "next" : "prev");
      setCurrentPage(targetPage);
      if (mainScrollRef.current) {
        mainScrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
      const timer = setTimeout(() => setSlideDirection("none"), 300);
      return () => clearTimeout(timer);
    },
    [currentPage, totalPages]
  );

  /* ── Render Current Page of Real PDF onto Canvas ── */
  useEffect(() => {
    if (!pdfDoc || !pdfCanvasRef.current) return;
    let isCancelled = false;

    // Cancel in-flight render task to prevent canvas corruption / half-renders
    if (renderTaskRef.current) {
      try {
        renderTaskRef.current.cancel();
      } catch {}
      renderTaskRef.current = null;
    }

    pdfDoc
      .getPage(currentPage)
      .then((page: any) => {
        if (isCancelled || !pdfCanvasRef.current) return;
        const canvas = pdfCanvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Determine natural aspect ratio
        const naturalViewport = page.getViewport({ scale: 1.0 });
        if (naturalViewport.width && naturalViewport.height) {
          setPageAspectRatio(naturalViewport.width / naturalViewport.height);
        }

        // Ultra-HD scale (2.0) for crisp Kannada font rendering
        const viewport = page.getViewport({ scale: 2.0 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const renderTask = page.render({
          canvasContext: ctx,
          viewport,
        });
        renderTaskRef.current = renderTask;

        return renderTask.promise;
      })
      .then(() => {
        renderTaskRef.current = null;
      })
      .catch((err: any) => {
        if (err?.name !== "RenderingCancelledException") {
          console.warn("PDF render note:", err);
        }
      });

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch {}
        renderTaskRef.current = null;
      }
    };
  }, [pdfDoc, currentPage]);

  /* ── Keyboard navigation ── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (clippedImageUrl) return;

      if (e.key === "ArrowRight") {
        goToPage(currentPage + 1);
      } else if (e.key === "ArrowLeft") {
        goToPage(currentPage - 1);
      } else if (e.key === "+" || e.key === "=") {
        setZoom((z) => Math.min(200, z + 25));
      } else if (e.key === "-") {
        setZoom((z) => Math.max(50, z - 25));
      } else if (e.key === "Escape" && isClipToolActive) {
        setIsClipToolActive(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentPage, totalPages, clippedImageUrl, isClipToolActive, goToPage]);

  /* ── Fullscreen toggle ── */
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      readerContainerRef.current?.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);



  /* ── Download Current Single Page ── */
  const handleDownloadSinglePage = useCallback(() => {
    const canvas = pdfCanvasRef.current;
    if (!canvas) return;

    setIsDownloadingPage(true);
    try {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
      const link = document.createElement("a");
      const cleanTitle = (edition.title || "ನ್ಯಾಯಘರ್ಜನೆ")
        .replace(/[^a-zA-Z0-9\u0C80-\u0CFF_-]/g, "_")
        .slice(0, 30);
      link.download = `${cleanTitle}_ಪುಟ_${currentPage}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 2500);
    } catch (err) {
      console.error("Single page download failed:", err);
    } finally {
      setIsDownloadingPage(false);
    }
  }, [edition.title, currentPage]);

  /* ─────────────────────────────────────────────────
     DRAG-TO-CROP (Real PDF & Demo Paper)
     ───────────────────────────────────────────────── */
  const getEventPos = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    if (!pageContainerRef.current) return null;
    const rect = pageContainerRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    return { x, y };
  };

  const handleDragStart = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    // Only drag-select when the clip tool is active
    if (!isClipToolActive) return;
    const pos = getEventPos(e);
    if (!pos) return;
    setIsDragging(true);
    setDragStart(pos);
    setDragCurrent(pos);
  };

  const handleDragMove = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    if (!isDragging || !pageContainerRef.current) return;
    const pos = getEventPos(e);
    if (!pos) return;

    const unscaledWidth = pageContainerRef.current.offsetWidth;
    const unscaledHeight = pageContainerRef.current.offsetHeight;
    const x = Math.max(0, Math.min(unscaledWidth, pos.x));
    const y = Math.max(0, Math.min(unscaledHeight, pos.y));
    setDragCurrent({ x, y });
  };

  const handleDragEnd = async () => {
    if (!isDragging || !dragStart || !dragCurrent || !pageContainerRef.current) {
      setIsDragging(false);
      return;
    }

    const x = Math.min(dragStart.x, dragCurrent.x);
    const y = Math.min(dragStart.y, dragCurrent.y);
    const width = Math.abs(dragCurrent.x - dragStart.x);
    const height = Math.abs(dragCurrent.y - dragStart.y);

    setIsDragging(false);
    setDragStart(null);
    setDragCurrent(null);
    setIsClipToolActive(false);

    // Use dragged rectangle, or if clicked at a point, crop an article window around the click
    const cropBoxW = width >= 30 ? width : 360;
    const cropBoxH = height >= 30 ? height : 440;
    const cropBoxX = width >= 30 ? x : Math.max(0, x - 180);
    const cropBoxY = height >= 30 ? y : Math.max(0, y - 100);

    setIsCapturing(true);
    setActiveArticleTitle(`${edition.title} - ಪುಟ ${currentPage}`);

    try {
      let brandedClipUrl: string | null = null;
      const pdfCanvas = pdfCanvasRef.current;

      // LIVE CLIP DIRECTLY FROM REAL NEWSPAPER PDF CANVAS
      if (pdfCanvas && pdfDoc) {
        const scaleX = pdfCanvas.width / pdfCanvas.offsetWidth;
        const scaleY = pdfCanvas.height / pdfCanvas.offsetHeight;

        const cropCanvas = document.createElement("canvas");
        cropCanvas.width = Math.round(cropBoxW * scaleX);
        cropCanvas.height = Math.round(cropBoxH * scaleY);
        const cropCtx = cropCanvas.getContext("2d");

        if (cropCtx) {
          cropCtx.drawImage(
            pdfCanvas,
            Math.round(cropBoxX * scaleX),
            Math.round(cropBoxY * scaleY),
            cropCanvas.width,
            cropCanvas.height,
            0,
            0,
            cropCanvas.width,
            cropCanvas.height
          );
          brandedClipUrl = createBrandedClip(cropCanvas, edition, currentPage);
        }
      }

      if (brandedClipUrl) {
        setClippedImageUrl(brandedClipUrl);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  const hasRealPdf = !!pdfDoc && !pdfLoadError;

  return (
    <div
      ref={readerContainerRef}
      className="flex flex-col h-screen w-screen overflow-hidden bg-neutral-900 text-white select-none"
    >
      {/* ════════════════════════════════════════════════
          1. COMPACT TOP TOOLBAR — icon-driven, minimal text
          ════════════════════════════════════════════════ */}
      <header className="h-12 sm:h-14 bg-neutral-950 border-b border-neutral-800 px-2 sm:px-4 flex items-center justify-between shrink-0 z-30 shadow-md">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          <button
            type="button"
            onClick={handleBack}
            className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors shrink-0 cursor-pointer"
            aria-label="ಹಿಂದಕ್ಕೆ"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="hidden sm:block h-4 w-px bg-neutral-800 shrink-0" />
          <div className="flex flex-col min-w-0">
            <h1 className="text-xs sm:text-sm font-bold text-neutral-100 flex items-center gap-1.5 truncate">
              <span className="truncate">{edition.title}</span>
              
            </h1>
            <p className="text-[10px] text-neutral-500 hidden sm:block truncate">
              {edition.formattedDate} • {edition.edition || "ರಾಜ್ಯ ಆವೃತ್ತಿ"}
            </p>
          </div>
        </div>

        {/* Center: Page Navigation (Mobile shows clean badge; prev/next are on screen sides) */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 sm:px-3 py-1 rounded-lg shrink-0">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => goToPage(currentPage - 1)}
              className="hidden sm:inline-flex p-0.5 sm:p-1 rounded hover:bg-neutral-800 text-neutral-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              aria-label="ಹಿಂದಿನ ಪುಟ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1 text-xs font-semibold px-1 text-neutral-200">
              <span className="font-mono text-white bg-neutral-800 px-1.5 py-0.5 rounded text-[11px]">
                {currentPage}
              </span>
              <span className="text-neutral-500">/</span>
              <span className="font-mono text-neutral-400">{totalPages}</span>
            </div>

            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => goToPage(currentPage + 1)}
              className="hidden sm:inline-flex p-0.5 sm:p-1 rounded hover:bg-neutral-800 text-neutral-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              aria-label="ಮುಂದಿನ ಪುಟ"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Download Page, Clip, Zoom, Fullscreen */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Download Current Single Page (Icon Only) */}
          <button
            type="button"
            onClick={handleDownloadSinglePage}
            disabled={isDownloadingPage || isPdfLoading}
            className={`p-1.5 sm:p-2 rounded-lg transition-all cursor-pointer inline-flex items-center justify-center ${
              downloadSuccess
                ? "bg-emerald-600 text-white ring-2 ring-emerald-300"
                : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white"
            } disabled:opacity-40`}
            title={`ಪುಟ ${currentPage} ಡೌನ್‌ಲೋಡ್ (Download Page ${currentPage})`}
            aria-label={`ಪುಟ ${currentPage} ಡೌನ್‌ಲೋಡ್`}
          >
            {downloadSuccess ? (
              <Check className="w-4 h-4 text-emerald-200" />
            ) : (
              <Download className="w-4 h-4 text-neutral-200" />
            )}
          </button>

          {/* Clip Tool Toggle */}
          <button
            type="button"
            onClick={() => setIsClipToolActive(!isClipToolActive)}
            className={`p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 ${
              isClipToolActive
                ? "bg-emerald-600 text-white ring-2 ring-emerald-400 shadow-lg"
                : "bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white"
            }`}
            title="✂️ ಯಾವುದೇ ಭಾಗವನ್ನು ಡ್ರ್ಯಾಗ್ ಮಾಡಿ ಕತ್ತರಿಸಿ"
          >
            <Scissors className="w-4 h-4" />
            <span className="hidden sm:inline">
              {isClipToolActive ? "ಸಕ್ರಿಯ" : "Clip"}
            </span>
          </button>

          {/* Zoom controls */}
          <div className="hidden sm:flex items-center gap-0.5 bg-neutral-900 border border-neutral-800 p-0.5 rounded-lg">
            <button
              type="button"
              disabled={zoom <= 50}
              onClick={() => setZoom((z) => Math.max(50, z - 20))}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-300 disabled:opacity-30 transition-colors cursor-pointer"
              aria-label="Zoom out"
              title="ಕಿರಿದಾಗಿಸು (Zoom Out)"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="text-[11px] font-mono px-1.5 text-neutral-300 font-bold min-w-[40px] text-center">
              {zoom}%
            </span>

            <button
              type="button"
              disabled={zoom >= 200}
              onClick={() => setZoom((z) => Math.min(200, z + 20))}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-300 disabled:opacity-30 transition-colors cursor-pointer"
              aria-label="Zoom in"
              title="ದೊಡ್ಡದಾಗಿಸು (Zoom In)"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setZoom(100)}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Reset zoom"
              title="ಸಾಮಾನ್ಯ ಗಾತ್ರಕ್ಕೆ ಮರುಹೊಂದಿಸಿ (Reset zoom)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            aria-label={isFullscreen ? "ಪೂರ್ಣ ಪರದೆ ಮುಕ್ತಾಯ" : "ಪೂರ್ಣ ಪರದೆ"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* ── Clip Mode Helper Bar ── */}
      {isClipToolActive && (
        <div className="bg-emerald-600 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center gap-2 mx-auto">
            <Scissors className="w-3.5 h-3.5" />
            <span>ಪತ್ರಿಕೆಯ ಯಾವುದೇ ಭಾಗವನ್ನು ಡ್ರ್ಯಾಗ್ ಮಾಡಿ ಕತ್ತರಿಸಿ (Drag any region to crop)</span>
          </div>
          <button
            type="button"
            onClick={() => setIsClipToolActive(false)}
            className="p-0.5 rounded hover:bg-white/20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Capturing Loading Overlay ── */}
      {isCapturing && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-white text-neutral-900 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 font-bold text-sm border border-neutral-200">
            <ThinArcLoader className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
            <span>ಪತ್ರಿಕಾ ತುಣುಕು ರಚಿಸಲಾಗುತ್ತಿದೆ...</span>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════
          2. MAIN CANVAS: REAL NEWSPAPER FROM DATABASE (PDF)
          ════════════════════════════════════════════════ */}
      <main
        ref={mainScrollRef}
        className="flex-1 overflow-y-auto overflow-x-auto bg-[#141824] relative flex flex-col items-center justify-start p-2 sm:p-4 md:py-6 select-none [scrollbar-width:thin]"
      >
        {/* PDF Loading Indicator */}
        {isPdfLoading && (
          <div className="m-auto flex flex-col items-center gap-3 text-neutral-300 py-24">
            <ThinArcLoader className="w-8 h-8 text-emerald-500" strokeWidth={1.5} />
            <p className="text-xs font-semibold tracking-wide">
              ಮೂಲ ಪತ್ರಿಕೆಯನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...
            </p>
          </div>
        )}

        {/* ── Left & Right Page Navigation Buttons (Centered vertically on sides, larger for mobile/desktop) ── */}
        {/* Previous Page Button (Left Center) */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => goToPage(currentPage - 1)}
          className="fixed left-1.5 sm:left-4 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-neutral-950/85 hover:bg-emerald-600 active:bg-emerald-700 text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl backdrop-blur-md transition-all cursor-pointer hover:scale-110 active:scale-90 border border-white/25 flex items-center justify-center group"
          aria-label="ಹಿಂದಿನ ಪುಟ"
          title={currentPage <= 1 ? "ಇದು ಮೊದಲ ಪುಟ" : "ಹಿಂದಿನ ಪುಟ (Previous Page)"}
        >
          <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
          <span className="sr-only">ಹಿಂದಿನ ಪುಟ</span>
        </button>

        {/* Next Page Button (Right Center) */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => goToPage(currentPage + 1)}
          className="fixed right-1.5 sm:right-4 top-1/2 -translate-y-1/2 z-40 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-neutral-950/85 hover:bg-emerald-600 active:bg-emerald-700 text-white disabled:opacity-30 disabled:cursor-not-allowed shadow-2xl backdrop-blur-md transition-all cursor-pointer hover:scale-110 active:scale-90 border border-white/25 flex items-center justify-center group"
          aria-label="ಮುಂದಿನ ಪುಟ"
          title={currentPage >= totalPages ? "ಇದು ಕೊನೆಯ ಪುಟ" : "ಮುಂದಿನ ಪುಟ (Next Page)"}
        >
          <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
          <span className="sr-only">ಮುಂದಿನ ಪುಟ</span>
        </button>

        {/* Real Newspaper PDF Canvas / Fallback Broadsheet */}
        {!isPdfLoading && (
          <div
            ref={pageContainerRef}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragMove}
            onMouseUp={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            style={{
              width: zoom === 100 ? undefined : `${Math.round(1020 * (zoom / 100))}px`,
              maxWidth: zoom > 100 ? "none" : undefined,
              aspectRatio: hasRealPdf ? pageAspectRatio : undefined,
              transition: isDragging ? "none" : "width 0.15s ease-out",
            }}
            className={`relative bg-[#FDFBF7] text-neutral-900 shadow-2xl rounded-sm border border-neutral-700/40 shrink-0 ${
              isClipToolActive ? "cursor-crosshair select-none" : "cursor-default"
            } ${
              hasRealPdf
                ? "p-0 overflow-hidden flex items-center justify-center w-full max-w-[1020px] my-2 sm:my-4"
                : "w-full max-w-4xl p-5 sm:p-8 lg:p-10 flex flex-col justify-between my-4"
            } ${
              slideDirection === "next"
                ? "animate-in slide-in-from-right-8 duration-200"
                : slideDirection === "prev"
                ? "animate-in slide-in-from-left-8 duration-200"
                : ""
            }`}
          >
            {/* Live Drag Selection Box (Green dashed outline) */}
            {isDragging && dragStart && dragCurrent && (
              <div
                style={{
                  left: `${Math.min(dragStart.x, dragCurrent.x)}px`,
                  top: `${Math.min(dragStart.y, dragCurrent.y)}px`,
                  width: `${Math.abs(dragCurrent.x - dragStart.x)}px`,
                  height: `${Math.abs(dragCurrent.y - dragStart.y)}px`,
                  borderColor: GREEN_DRAG,
                  backgroundColor: GREEN_DRAG_BG,
                }}
                className="absolute z-50 pointer-events-none border-2 border-dashed shadow-lg"
              />
            )}

            {/* REAL PDF RENDERING: Canvas directly from Database */}
            {hasRealPdf ? (
              <div className="relative w-full h-full flex items-center justify-center bg-neutral-100">
                <canvas
                  ref={pdfCanvasRef}
                  className="block select-none shadow-sm w-full h-auto object-contain"
                />
              </div>
            ) : pdfLoadError ? (
              <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center text-neutral-300 space-y-4">
                <AlertCircle className="w-12 h-12 text-amber-500" />
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white">ಪತ್ರಿಕೆಯನ್ನು ಲೋಡ್ ಮಾಡಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ</h3>
                  <p className="text-xs text-neutral-400">ದಯವಿಟ್ಟು ಪುಟವನ್ನು ರಿಫ್ರೆಶ್ ಮಾಡಿ.</p>
                </div>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  ಮರುಪ್ರಯತ್ನಿಸಿ (Reload)
                </button>
              </div>
            ) : null}
          </div>
        )}
      </main>

      {/* ════════════════════════════════════════════════
          3. ARTICLE CLIP MODAL
          ════════════════════════════════════════════════ */}
      {clippedImageUrl && (
        <ArticleClipModal
          clippedImageUrl={clippedImageUrl}
          articleTitle={activeArticleTitle}
          edition={edition}
          currentPage={currentPage}
          onClose={() => setClippedImageUrl(null)}
        />
      )}
    </div>
  );
}
