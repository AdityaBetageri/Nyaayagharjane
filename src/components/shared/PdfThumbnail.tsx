"use client";

import { useState, useEffect, useRef } from "react";
import { ThinArcLoader } from "./ThinArcLoader";

interface PdfThumbnailProps {
  pdfUrl?: string;
  className?: string;
  fallback?: React.ReactNode;
}

const THUMBNAIL_CACHE_NAME = "nyaayagharjane-pdf-thumbnails-v1";
const memoryThumbnailCache = new Map<string, string>();

function getPdfStreamUrl(url?: string): string {
  if (!url) return "";
  if (url.includes(".r2.dev/")) {
    const rawKey = url.split(".r2.dev/")[1];
    try {
      const decodedKey = decodeURIComponent(rawKey);
      return `/api/r2/file?key=${encodeURIComponent(decodedKey)}`;
    } catch {
      return `/api/r2/file?key=${encodeURIComponent(rawKey)}`;
    }
  }
  return url;
}

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

export default function PdfThumbnail({
  pdfUrl,
  className = "",
  fallback,
}: PdfThumbnailProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [cachedImg, setCachedImg] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!pdfUrl) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    let isCancelled = false;
    let currentRenderTask: any = null;

    // 1. Check in-memory thumbnail cache
    if (memoryThumbnailCache.has(pdfUrl)) {
      setCachedImg(memoryThumbnailCache.get(pdfUrl)!);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    const cacheKey = `https://nyaayagharjane.local/thumbnail/${encodeURIComponent(pdfUrl)}`;

    // 2. Check persistent browser Cache Storage
    const checkBrowserCache = async () => {
      if (typeof window !== "undefined" && "caches" in window) {
        try {
          const cache = await caches.open(THUMBNAIL_CACHE_NAME);
          const cachedResponse = await cache.match(cacheKey);
          if (cachedResponse) {
            const blob = await cachedResponse.blob();
            if (!isCancelled && blob && blob.size > 0) {
              const objUrl = URL.createObjectURL(blob);
              memoryThumbnailCache.set(pdfUrl, objUrl);
              setCachedImg(objUrl);
              setIsLoading(false);
              setHasError(false);
              return true;
            }
          }
        } catch {
          // Cache storage check non-fatal
        }
      }
      return false;
    };

    setIsLoading(true);
    setHasError(false);

    checkBrowserCache().then((foundInCache) => {
      if (foundInCache || isCancelled) return;

      const streamUrl = getPdfStreamUrl(pdfUrl);

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
          if (isCancelled || !doc) return null;
          return doc.getPage(1);
        })
        .then((page) => {
          if (isCancelled || !page || !canvasRef.current) return;
          const canvas = canvasRef.current;
          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          // Render at crisp 1.5x scale
          const viewport = page.getViewport({ scale: 1.5 });
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          currentRenderTask = page.render({
            canvasContext: ctx,
            viewport,
          });
          return currentRenderTask.promise.then(() => {
            if (isCancelled || !canvas) return;
            // Store thumbnail in browser cache
            try {
              canvas.toBlob(async (blob) => {
                if (isCancelled || !blob) return;
                const objUrl = URL.createObjectURL(blob);
                memoryThumbnailCache.set(pdfUrl, objUrl);
                setCachedImg(objUrl);
                if (typeof window !== "undefined" && "caches" in window) {
                  try {
                    const cache = await caches.open(THUMBNAIL_CACHE_NAME);
                    await cache.put(
                      cacheKey,
                      new Response(blob, {
                        headers: {
                          "Content-Type": "image/jpeg",
                          "Cache-Control": "public, max-age=31536000",
                        },
                      })
                    );
                  } catch {
                    // Non-fatal cache store
                  }
                }
              }, "image/jpeg", 0.85);
            } catch {
              // Canvas toBlob non-fatal
            }
          });
        })
        .then(() => {
          if (!isCancelled) {
            setIsLoading(false);
          }
        })
        .catch((err) => {
          if (err?.name === "RenderingCancelledException") return;
          console.warn("PdfThumbnail note:", err);
          if (!isCancelled) {
            setIsLoading(false);
            setHasError(true);
          }
        });
    });

    return () => {
      isCancelled = true;
      if (currentRenderTask) {
        try {
          currentRenderTask.cancel();
        } catch {}
      }
    };
  }, [pdfUrl]);

  if (hasError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={`relative w-full h-full flex items-center justify-center overflow-hidden bg-neutral-100 ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-neutral-100/90 z-10 text-neutral-500">
          <ThinArcLoader className="w-6 h-6 text-emerald-600" strokeWidth={1.5} />
          <span className="text-[11px] font-medium">Loading preview...</span>
        </div>
      )}
      {cachedImg ? (
        <img
          src={cachedImg}
          alt="Newspaper Preview"
          className={`w-full h-auto max-h-full object-contain block transition-opacity duration-200 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
          loading="lazy"
        />
      ) : (
        <canvas
          ref={canvasRef}
          className={`w-full h-auto max-h-full object-contain block transition-opacity duration-200 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
        />
      )}
    </div>
  );
}
