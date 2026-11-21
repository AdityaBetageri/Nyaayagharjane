"use client";

import { useState, useEffect, useRef } from "react";
import { ThinArcLoader } from "./ThinArcLoader";

interface PdfThumbnailProps {
  pdfUrl?: string;
  className?: string;
  fallback?: React.ReactNode;
}

function getPdfStreamUrl(url?: string): string {
  if (!url) return "";
  if (url.includes(".r2.dev/")) {
    const key = url.split(".r2.dev/")[1];
    return `/api/r2/file?key=${encodeURIComponent(key)}`;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!pdfUrl) {
      setIsLoading(false);
      setHasError(true);
      return;
    }

    let isCancelled = false;
    setIsLoading(true);
    setHasError(false);

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

        return page.render({
          canvasContext: ctx,
          viewport,
        }).promise;
      })
      .then(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.warn("PdfThumbnail error:", err);
        if (!isCancelled) {
          setIsLoading(false);
          setHasError(true);
        }
      });

    return () => {
      isCancelled = true;
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
          <span className="text-[11px] font-medium">ಪತ್ರಿಕೆ ಮುನ್ನೋಟ...</span>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className={`w-full h-auto max-h-full object-contain block transition-opacity duration-200 ${
          isLoading ? "opacity-0" : "opacity-100"
        }`}
      />
    </div>
  );
}
