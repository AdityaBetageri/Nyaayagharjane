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
} from "lucide-react";
import { Edition } from "@/types";
import { getStoredEditions } from "@/lib/editionsStore";
import { fetchR2Catalogue, r2ItemToEdition } from "@/lib/r2Service";
import { EPAPER_PAGES_ARTICLES, EpaperArticle } from "./articleData";
import ArticleClipModal from "./ArticleClipModal";
import {
  captureElementAsClip,
  captureRegionAsClip,
  createBrandedClip,
} from "./cropHelper";
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
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);

  // Clipping & Article Modal State
  const [clippedImageUrl, setClippedImageUrl] = useState<string | null>(null);
  const [activeArticleTitle, setActiveArticleTitle] = useState<string>("");
  const [isClipToolActive, setIsClipToolActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Drag selection state for custom crop tool
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragCurrent, setDragCurrent] = useState<{ x: number; y: number } | null>(null);

  const readerContainerRef = useRef<HTMLDivElement>(null);
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

  /* ── Render Current Page of Real PDF onto Canvas ── */
  useEffect(() => {
    if (!pdfDoc || !pdfCanvasRef.current) return;
    let isCancelled = false;

    pdfDoc.getPage(currentPage).then((page: any) => {
      if (isCancelled || !pdfCanvasRef.current) return;
      const canvas = pdfCanvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Ultra-HD scale (2.0) for crisp Kannada font rendering
      const viewport = page.getViewport({ scale: 2.0 });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderTask = page.render({
        canvasContext: ctx,
        viewport,
      });

      renderTask.promise.catch(() => {});
    }).catch(() => {});

    return () => {
      isCancelled = true;
    };
  }, [pdfDoc, currentPage]);

  /* ── Keyboard navigation ── */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (clippedImageUrl) return;

      if (e.key === "ArrowRight") {
        setCurrentPage((p) => Math.min(totalPages, p + 1));
      } else if (e.key === "ArrowLeft") {
        setCurrentPage((p) => Math.max(1, p - 1));
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
  }, [totalPages, clippedImageUrl, isClipToolActive]);

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

  /* ─────────────────────────────────────────────────
     CLICK ON ARTICLE (Demo Mode Fallback)
     ───────────────────────────────────────────────── */
  const handleArticleClick = async (
    e: React.MouseEvent<HTMLDivElement>,
    art: EpaperArticle
  ) => {
    if (isClipToolActive) return;

    const el = e.currentTarget;
    setIsCapturing(true);
    setActiveArticleTitle(art.title);

    try {
      const brandedClipUrl = await captureElementAsClip(el, edition, currentPage);
      if (brandedClipUrl) {
        setClippedImageUrl(brandedClipUrl);
      }
    } finally {
      setIsCapturing(false);
    }
  };

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
    const x = (clientX - rect.left) / (zoom / 100);
    const y = (clientY - rect.top) / (zoom / 100);
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

    // Minimum 40×40px selection
    if (width >= 40 && height >= 40) {
      setIsCapturing(true);
      setActiveArticleTitle(`ಪತ್ರಿಕಾ ತುಣುಕು (ಪುಟ ${currentPage})`);

      try {
        let brandedClipUrl: string | null = null;
        const pdfCanvas = pdfCanvasRef.current;

        // A) LIVE CLIP DIRECTLY FROM REAL NEWSPAPER PDF CANVAS
        if (pdfCanvas && pdfDoc) {
          const scaleX = pdfCanvas.width / pdfCanvas.offsetWidth;
          const scaleY = pdfCanvas.height / pdfCanvas.offsetHeight;

          const cropCanvas = document.createElement("canvas");
          cropCanvas.width = Math.round(width * scaleX);
          cropCanvas.height = Math.round(height * scaleY);
          const cropCtx = cropCanvas.getContext("2d");

          if (cropCtx) {
            cropCtx.drawImage(
              pdfCanvas,
              Math.round(x * scaleX),
              Math.round(y * scaleY),
              cropCanvas.width,
              cropCanvas.height,
              0,
              0,
              cropCanvas.width,
              cropCanvas.height
            );
            brandedClipUrl = createBrandedClip(cropCanvas, edition, currentPage);
          }
        } else if (pageContainerRef.current) {
          // B) Fallback to DOM capture
          brandedClipUrl = await captureRegionAsClip(
            pageContainerRef.current,
            { x, y, width, height },
            edition,
            currentPage
          );
        }

        if (brandedClipUrl) {
          setClippedImageUrl(brandedClipUrl);
        }
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const hasRealPdf = !!pdfDoc && !pdfLoadError;
  const pageArticles = EPAPER_PAGES_ARTICLES[currentPage] || EPAPER_PAGES_ARTICLES[1] || [];

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
              <span className="shrink-0 px-1.5 py-0.5 text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-bold">
                {hasRealPdf ? "ಮೂಲ ಪತ್ರಿಕೆ" : "ಇ-ಪತ್ರಿಕೆ"}
              </span>
            </h1>
            <p className="text-[10px] text-neutral-500 hidden sm:block truncate">
              {edition.formattedDate} • {edition.edition || "ರಾಜ್ಯ ಆವೃತ್ತಿ"}
            </p>
          </div>
        </div>

        {/* Center: Page Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 px-2 sm:px-3 py-1 rounded-lg shrink-0">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-0.5 sm:p-1 rounded hover:bg-neutral-800 text-neutral-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-0.5 sm:p-1 rounded hover:bg-neutral-800 text-neutral-300 disabled:opacity-30 disabled:hover:bg-transparent transition-colors cursor-pointer"
              aria-label="ಮುಂದಿನ ಪುಟ"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right: Clip, Zoom, Fullscreen */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
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
          <div className="hidden md:flex items-center gap-0.5 bg-neutral-900 border border-neutral-800 p-0.5 rounded-lg">
            <button
              type="button"
              disabled={zoom <= 60}
              onClick={() => setZoom((z) => Math.max(60, z - 20))}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-300 disabled:opacity-30 transition-colors cursor-pointer"
              aria-label="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>

            <span className="text-[11px] font-mono px-1 text-neutral-400">
              {zoom}%
            </span>

            <button
              type="button"
              disabled={zoom >= 180}
              onClick={() => setZoom((z) => Math.min(180, z + 20))}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-300 disabled:opacity-30 transition-colors cursor-pointer"
              aria-label="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setZoom(100)}
              className="p-1 rounded hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Reset zoom"
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
      <main className="flex-1 overflow-auto bg-[#1A1F2C] relative flex flex-col items-center p-3 sm:p-6 lg:p-8 [scrollbar-width:thin]">
        {/* PDF Loading Indicator */}
        {isPdfLoading && (
          <div className="m-auto flex flex-col items-center gap-3 text-neutral-300">
            <ThinArcLoader className="w-8 h-8 text-emerald-500" strokeWidth={1.5} />
            <p className="text-xs font-semibold tracking-wide">
              ಮೂಲ ಪತ್ರಿಕೆಯನ್ನು ಲೋಡ್ ಮಾಡಲಾಗುತ್ತಿದೆ...
            </p>
          </div>
        )}

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
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
              transition: isDragging ? "none" : "transform 0.15s ease-out",
            }}
            className={`relative w-full max-w-4xl bg-[#FDFBF7] text-neutral-900 shadow-2xl rounded-sm border-2 border-neutral-300 my-4 sm:my-8 ${
              isClipToolActive ? "cursor-crosshair select-none" : "cursor-default"
            } ${hasRealPdf ? "p-0 overflow-hidden" : "p-5 sm:p-8 lg:p-10 flex flex-col justify-between"}`}
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

            {/* A. REAL PDF RENDERING: Canvas directly from Database */}
            {hasRealPdf ? (
              <div className="relative w-full flex justify-center bg-neutral-100">
                <canvas
                  ref={pdfCanvasRef}
                  className="w-full h-auto block select-none shadow-sm"
                />
              </div>
            ) : (
              /* B. FALLBACK INTERACTIVE BROADSHEET (If no PDF available) */
              <>
                {/* ── TOP MASTHEAD ── */}
                <div className="border-b-4 border-neutral-950 pb-3 text-center space-y-2">
                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-bold text-neutral-600 border-b border-neutral-400 pb-1">
                    <span>ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ</span>
                    <span className="text-emerald-700">ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ</span>
                    <span>{edition.formattedDate}</span>
                  </div>

                  <div className="flex items-center justify-center gap-3 py-3">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0">
                      <Image
                        src="/logo.png"
                        alt="ನ್ಯಾಯ ಘರ್ಜನೆ"
                        width={968}
                        height={968}
                        className="w-full h-full object-contain rounded-md"
                      />
                    </div>
                    <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#172B4D] font-serif">
                      ನ್ಯಾಯ ಘರ್ಜನೆ
                    </h2>
                  </div>

                  <div className="flex items-center justify-between text-[10px] sm:text-xs text-neutral-600 pt-2 mt-1 border-t-2 border-neutral-950 font-semibold">
                    <span>ಸಂಪುಟ {edition.volumeNumber ?? 1}</span>
                    <span className="px-2 py-0.5 bg-emerald-600 text-white rounded font-bold text-[10px] tracking-wide">
                      ಪುಟ {currentPage} / {totalPages}
                    </span>
                    <span>ಸಂಚಿಕೆ {edition.issueNumber ?? 1} • {edition.edition || "ರಾಜ್ಯ ಆವೃತ್ತಿ"}</span>
                  </div>
                </div>

                {/* ── ARTICLES GRID ── */}
                <div className="py-6 space-y-6">
                  {pageArticles
                    .filter((art) => art.colSpan === "full")
                    .map((art) => (
                      <div
                        key={art.id}
                        onClick={(e) => handleArticleClick(e, art)}
                        className="group relative p-5 sm:p-7 rounded bg-white/70 shadow-xs cursor-pointer transition-shadow hover:shadow-md"
                      >
                        <div className="dashed-hover-overlay pointer-events-none absolute inset-0 rounded border-2 border-dashed border-transparent group-hover:border-emerald-600 group-hover:bg-emerald-500/15 transition-all duration-150 z-10" />
                        <div className="space-y-2">
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                            ● {art.category}
                          </span>
                          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-[#172B4D] font-serif leading-tight">
                            {art.title}
                          </h3>
                          {art.subtitle && (
                            <p className="text-xs sm:text-sm font-semibold text-[#5A6A85]">
                              {art.subtitle}
                            </p>
                          )}
                          <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed pt-1 line-clamp-3">
                            {art.excerpt}
                          </p>
                        </div>
                        {art.author && (
                          <p className="text-[10px] font-bold text-neutral-500 mt-3 pt-2 border-t border-neutral-200">
                            — ವರದಿ: {art.author}
                          </p>
                        )}
                      </div>
                    ))}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    {pageArticles
                      .filter((art) => art.colSpan !== "full")
                      .map((art) => (
                        <div
                          key={art.id}
                          onClick={(e) => handleArticleClick(e, art)}
                          className="group relative p-5 rounded bg-white/70 shadow-xs cursor-pointer flex flex-col justify-between transition-shadow hover:shadow-md"
                        >
                          <div className="dashed-hover-overlay pointer-events-none absolute inset-0 rounded border-2 border-dashed border-transparent group-hover:border-emerald-600 group-hover:bg-emerald-500/15 transition-all duration-150 z-10" />
                          <div className="space-y-2">
                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                              ● {art.category}
                            </span>
                            <h4 className="text-base sm:text-lg font-bold text-[#172B4D] font-serif leading-snug">
                              {art.title}
                            </h4>
                            <p className="text-xs text-neutral-700 leading-relaxed line-clamp-4">
                              {art.excerpt}
                            </p>
                          </div>
                          {art.author && (
                            <p className="text-[10px] font-bold text-neutral-500 mt-4 pt-2 border-t border-neutral-200">
                              — {art.author}
                            </p>
                          )}
                        </div>
                      ))}
                  </div>
                </div>

                {/* ── FOOTER ── */}
                <div className="border-t-2 border-neutral-900 pt-3 flex items-center justify-between text-[10px] sm:text-xs text-neutral-600 font-semibold">
                  <span>ನ್ಯಾಯ ಘರ್ಜನೆ ಡಿಜಿಟಲ್ ಇ-ಪತ್ರಿಕೆ</span>
                  <span>www.nyaayagharjane.com</span>
                  <span>ಪುಟ {currentPage}</span>
                </div>
              </>
            )}
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
