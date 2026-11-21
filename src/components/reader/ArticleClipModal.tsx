"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Download, X, Copy, Check, ZoomIn, ZoomOut } from "lucide-react";
import { Edition } from "@/types";

interface ArticleClipModalProps {
  clippedImageUrl: string | null;
  articleTitle?: string;
  edition: Edition;
  currentPage: number;
  onClose: () => void;
}

/* ─── Inline SVG social icons ─── */

function WhatsAppIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function FacebookIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function XTwitterIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function ShareIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function TelegramIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export default function ArticleClipModal({
  clippedImageUrl,
  articleTitle = "ನ್ಯಾಯ ಘರ್ಜನೆ ಪತ್ರಿಕಾ ತುಣುಕು",
  edition,
  currentPage,
  onClose,
}: ArticleClipModalProps) {
  const [isCopied, setIsCopied] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0, scrollLeft: 0, scrollTop: 0 });

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  if (!clippedImageUrl) return null;

  const pageUrl =
    typeof window !== "undefined"
      ? window.location.href
      : "https://www.nyaayagharjane.com";

  const shareText =
    `*ನ್ಯಾಯ ಘರ್ಜನೆ ಇ-ಪತ್ರಿಕೆ*\n📌 ${articleTitle}\n📅 ${edition.formattedDate} (ಪುಟ ${currentPage})\n👉 ${pageUrl}`;

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = clippedImageUrl;
    const cleanName = articleTitle
      .replace(/[^a-zA-Z0-9\u0C80-\u0CFF]/g, "-")
      .slice(0, 30);
    a.download = `nyaayagharjane-clip-${cleanName}-p${currentPage}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleWhatsApp = () => {
    window.open(
      `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
      "_blank"
    );
  };

  const handleFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent(articleTitle)}`,
      "_blank"
    );
  };

  const handleTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${articleTitle} - ನ್ಯಾಯ ಘರ್ಜನೆ`)}&url=${encodeURIComponent(pageUrl)}`,
      "_blank"
    );
  };

  const handleTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(articleTitle)}`,
      "_blank"
    );
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(pageUrl);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        const res = await fetch(clippedImageUrl);
        const blob = await res.blob();
        const file = new File([blob], "nyaayagharjane-clip.png", {
          type: "image/png",
        });

        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: articleTitle,
            text: `ನ್ಯಾಯ ಘರ್ಜನೆ - ${edition.formattedDate}`,
            files: [file],
          });
        } else {
          await navigator.share({
            title: articleTitle,
            text: `ನ್ಯಾಯ ಘರ್ಜನೆ - ${edition.formattedDate}`,
            url: pageUrl,
          });
        }
      } catch {
        // User cancelled
      }
    }
  };

  const onDragStart = (clientX: number, clientY: number) => {
    const container = imageContainerRef.current;
    if (!container) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      scrollLeft: container.scrollLeft,
      scrollTop: container.scrollTop,
    };
  };

  const onDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || !imageContainerRef.current) return;
    const dx = clientX - dragStartRef.current.x;
    const dy = clientY - dragStartRef.current.y;
    imageContainerRef.current.scrollLeft = dragStartRef.current.scrollLeft - dx;
    imageContainerRef.current.scrollTop = dragStartRef.current.scrollTop - dy;
  };

  const onDragEnd = () => {
    setIsDragging(false);
  };

  // Mouse drag to scroll
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with primary mouse button
    if (e.button !== 0) return;
    onDragStart(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    onDragMove(e.clientX, e.clientY);
  };

  const handleMouseUp = () => onDragEnd();

  // Touch drag (single finger pan / scroll)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      onDragStart(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      onDragMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => onDragEnd();

  // Double-click to toggle 100% and 150% zoom
  const handleDoubleClick = () => {
    if (zoom !== 100) {
      setZoom(100);
    } else {
      setZoom(150);
    }
  };

  const iconBtn =
    "w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 active:scale-95";

  return (
    <ModalWithZoom
      zoom={zoom}
      setZoom={setZoom}
      onClose={onClose}
    >
      {/* ═══ TOP: Social share icon row ═══ */}
      <div className="w-full max-w-5xl lg:max-w-6xl mx-auto px-4 pb-2 pt-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 sm:gap-2">
          {"share" in navigator && (
            <button
              type="button"
              onClick={handleNativeShare}
              className={`${iconBtn} bg-emerald-600 hover:bg-emerald-500 text-white`}
              title="ಹಂಚಿ"
            >
              <ShareIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            </button>
          )}

          <button
            type="button"
            onClick={handleDownload}
            className={`${iconBtn} bg-emerald-600 hover:bg-emerald-500 text-white`}
            title="ಡೌನ್‌ಲೋಡ್"
          >
            <Download className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </button>

          <button
            type="button"
            onClick={handleCopyLink}
            className={`${iconBtn} ${
              isCopied
                ? "bg-emerald-500 text-white"
                : "bg-amber-500 hover:bg-amber-400 text-white"
            }`}
            title={isCopied ? "ನಕಲಿಸಲಾಗಿದೆ!" : "ಲಿಂಕ್ ಕಾಪಿ"}
          >
            {isCopied ? (
              <Check className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            ) : (
              <Copy className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
            )}
          </button>

          <button
            type="button"
            onClick={handleFacebook}
            className={`${iconBtn} bg-[#1877F2] hover:bg-[#166FE5] text-white`}
            title="Facebook"
          >
            <FacebookIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </button>

          <button
            type="button"
            onClick={handleTwitter}
            className={`${iconBtn} bg-neutral-800 hover:bg-neutral-700 text-white`}
            title="X (Twitter)"
          >
            <XTwitterIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </button>

          <button
            type="button"
            onClick={handleWhatsApp}
            className={`${iconBtn} bg-[#25D366] hover:bg-[#20BA5A] text-white`}
            title="WhatsApp"
          >
            <WhatsAppIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </button>

          <button
            type="button"
            onClick={handleTelegram}
            className={`${iconBtn} bg-[#0088cc] hover:bg-[#0077b5] text-white`}
            title="Telegram"
          >
            <TelegramIcon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
          </button>
        </div>

        {/* Right: zoom + close */}
        <div className="flex items-center gap-1">
          <div className="hidden sm:flex items-center gap-0.5 bg-white/10 rounded-full px-1 py-0.5">
            <button
              type="button"
              onClick={() => setZoom((z) => Math.max(30, z - 20))}
              className="p-1 text-neutral-300 hover:text-white rounded-full hover:bg-white/10 cursor-pointer"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[11px] font-mono px-1 text-neutral-400">
              {zoom}%
            </span>
            <button
              type="button"
              onClick={() => setZoom((z) => Math.min(300, z + 20))}
              className="p-1 text-neutral-300 hover:text-white rounded-full hover:bg-white/10 cursor-pointer"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="ಮುಚ್ಚಿ"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* ═══ CLIPPED IMAGE — scrollable vertically & horizontally, perfectly aligned ═══ */}
      <div
        ref={imageContainerRef}
        className={`flex-1 overflow-auto overscroll-contain w-full max-w-5xl lg:max-w-6xl mx-auto px-2 sm:px-4 pb-6 [scrollbar-width:thin] [scrollbar-color:#8B6914_rgba(255,255,255,0.08)] select-none ${
          isDragging ? "cursor-grabbing" : "cursor-grab"
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={handleDoubleClick}
      >
        <div
          className="flex justify-center min-w-full"
          style={{
            width: zoom > 100 ? `${zoom}%` : "100%",
          }}
        >
          <img
            ref={imageRef}
            src={clippedImageUrl}
            alt={articleTitle}
            style={{
              width: zoom > 100 ? `${zoom}%` : "100%",
              maxWidth: "none",
            }}
            className="h-auto select-none pointer-events-none rounded-xl shadow-2xl block mx-auto transition-[width] duration-100 border border-neutral-700/60"
            draggable={false}
          />
        </div>
      </div>
    </ModalWithZoom>
  );
}

/* ═══════════════════════════════════════════════════════════
   Wrapper — intercepts wheel/pinch for zoom-only on image
   ═══════════════════════════════════════════════════════════ */
function ModalWithZoom({
  zoom,
  setZoom,
  onClose,
  children,
}: {
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const modalRef = useRef<HTMLDivElement>(null);
  const lastPinchDistRef = useRef<number | null>(null);

  const clampZoom = useCallback(
    (z: number) => Math.max(30, Math.min(300, z)),
    []
  );

  // Wheel zoom (Ctrl + wheel / pinch gesture)
  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        // Trackpad pinch-to-zoom or Ctrl+scroll zooms image
        e.preventDefault();
        e.stopPropagation();
        setZoom((z) => clampZoom(z - e.deltaY * 0.5));
      }
      // When not ctrlKey, allow default vertical & horizontal scrolling of the container!
    };

    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [setZoom, clampZoom]);

  // Touch pinch-zoom
  useEffect(() => {
    const el = modalRef.current;
    if (!el) return;

    const getPinchDist = (touches: TouchList) => {
      if (touches.length < 2) return null;
      const dx = touches[1].clientX - touches[0].clientX;
      const dy = touches[1].clientY - touches[0].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        lastPinchDistRef.current = getPinchDist(e.touches);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const dist = getPinchDist(e.touches);
        if (dist !== null && lastPinchDistRef.current !== null) {
          const delta = dist - lastPinchDistRef.current;
          setZoom((z) => clampZoom(z + delta * 0.3));
          lastPinchDistRef.current = dist;
        }
      }
    };

    const handleTouchEnd = () => {
      lastPinchDistRef.current = null;
    };

    el.addEventListener("touchstart", handleTouchStart, { passive: false });
    el.addEventListener("touchmove", handleTouchMove, { passive: false });
    el.addEventListener("touchend", handleTouchEnd);

    return () => {
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
      el.removeEventListener("touchend", handleTouchEnd);
    };
  }, [setZoom, clampZoom]);

  // Lock background scroll
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, []);

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {children}
    </div>
  );
}
