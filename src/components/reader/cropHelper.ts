import { toCanvas } from "html-to-image";

export interface BrandedClipEditionInfo {
  title: string;
  formattedDate: string;
  volumeNumber?: number;
  issueNumber?: number;
  edition?: string;
}

/* ─── Light Gold palette ─── */
const GOLD_BG = "#FDF6E3";
const GOLD_BORDER = "#D4A843";
const GOLD_DARK = "#8B6914";
const FOOTER_BG = "#F5EDDA";
const TEXT_DARK = "#2D1B00";

/**
 * Ultra-HD branded clip: renders the header & footer at 2× internal
 * resolution for crisp text on any screen.
 */
export function createBrandedClip(
  sourceCanvas: HTMLCanvasElement,
  edition: BrandedClipEditionInfo,
  pageNumber: number
): string {
  // Work at 2× for ultra-sharp header/footer text
  const S = 2;

  const baseWidth = Math.max(sourceCanvas.width, 700 * S);
  const scale = baseWidth / sourceCanvas.width;
  const contentHeight = Math.round(sourceCanvas.height * scale);

  const bannerH = 125 * S;
  const footerH = 36 * S;
  const totalH = bannerH + contentHeight + footerH;

  const canvas = document.createElement("canvas");
  canvas.width = baseWidth;
  canvas.height = totalH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return sourceCanvas.toDataURL("image/png");

  // Scale context for crisp text
  // (we'll draw everything in "logical" coords and scale up)

  // 1. Paper background
  ctx.fillStyle = "#FDFBF7";
  ctx.fillRect(0, 0, baseWidth, totalH);

  // 2. Header — light gold
  ctx.fillStyle = GOLD_BG;
  ctx.fillRect(0, 0, baseWidth, bannerH);

  // Gold accent line
  ctx.fillStyle = GOLD_BORDER;
  ctx.fillRect(0, bannerH - 4 * S, baseWidth, 4 * S);

  // Top sub-header
  ctx.fillStyle = GOLD_DARK;
  ctx.font = `bold ${14 * S}px sans-serif`;
  ctx.textAlign = "left";
  ctx.fillText("ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ", 20 * S, 26 * S);

  ctx.textAlign = "right";
  ctx.fillText(edition.formattedDate, baseWidth - 20 * S, 26 * S);

  // Brand title — large
  ctx.fillStyle = TEXT_DARK;
  ctx.font = `bold ${44 * S}px serif`;
  ctx.textAlign = "center";
  ctx.fillText("ನ್ಯಾಯ ಘರ್ಜನೆ", baseWidth / 2, 70 * S);

  // Tagline
  ctx.fillStyle = GOLD_DARK;
  ctx.font = `bold ${13 * S}px sans-serif`;
  ctx.fillText(
    `ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ  |  Page ${pageNumber}  |  ${edition.edition || "ರಾಜ್ಯ ಆವೃತ್ತಿ"}`,
    baseWidth / 2,
    100 * S
  );

  // 3. Draw screenshot content
  ctx.drawImage(sourceCanvas, 0, bannerH, baseWidth, contentHeight);

  // 4. Subtle border
  ctx.strokeStyle = "#E8DCC8";
  ctx.lineWidth = S;
  ctx.strokeRect(0, bannerH, baseWidth, contentHeight);

  // 5. Footer — dynamic domain + English copyright
  ctx.fillStyle = FOOTER_BG;
  ctx.fillRect(0, bannerH + contentHeight, baseWidth, footerH);

  ctx.fillStyle = GOLD_BORDER;
  ctx.fillRect(0, bannerH + contentHeight, baseWidth, 2 * S);

  const now = new Date();
  const englishDate = now.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const domain = "www.nyaayagharjane.com";
  const year = now.getFullYear();

  ctx.fillStyle = "#6B5B3E";
  ctx.font = `${12 * S}px sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(
    `${domain}  •  ${englishDate}  •  © ${year} Nyaayagharjane. All rights reserved.`,
    baseWidth / 2,
    bannerH + contentHeight + 22 * S
  );

  return canvas.toDataURL("image/png");
}

/** Ultra-HD screenshot capture — pixelRatio 4 */
export async function captureElementAsClip(
  element: HTMLElement,
  edition: BrandedClipEditionInfo,
  pageNumber: number
): Promise<string | null> {
  try {
    const canvas = await toCanvas(element, {
      pixelRatio: 4,
      backgroundColor: "#FFFFFF",
      cacheBust: true,
      skipFonts: false,
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList?.contains("dashed-hover-overlay")) {
          return false;
        }
        return true;
      },
    });

    return createBrandedClip(canvas, edition, pageNumber);
  } catch (err) {
    console.error("Failed to capture element screenshot:", err);
    return null;
  }
}

/** Ultra-HD region crop — pixelRatio 4 */
export async function captureRegionAsClip(
  container: HTMLElement,
  cropRect: { x: number; y: number; width: number; height: number },
  edition: BrandedClipEditionInfo,
  pageNumber: number
): Promise<string | null> {
  const PR = 4;

  try {
    const fullCanvas = await toCanvas(container, {
      pixelRatio: PR,
      backgroundColor: "#FDFBF7",
      cacheBust: true,
      skipFonts: false,
      filter: (node) => {
        if (node instanceof HTMLElement && node.classList?.contains("dashed-hover-overlay")) {
          return false;
        }
        return true;
      },
    });

    const cropCanvas = document.createElement("canvas");
    cropCanvas.width = Math.round(cropRect.width * PR);
    cropCanvas.height = Math.round(cropRect.height * PR);

    const cropCtx = cropCanvas.getContext("2d");
    if (!cropCtx) return null;

    cropCtx.drawImage(
      fullCanvas,
      Math.round(cropRect.x * PR),
      Math.round(cropRect.y * PR),
      Math.round(cropRect.width * PR),
      Math.round(cropRect.height * PR),
      0,
      0,
      cropCanvas.width,
      cropCanvas.height
    );

    return createBrandedClip(cropCanvas, edition, pageNumber);
  } catch (err) {
    console.error("Failed to capture region screenshot:", err);
    return null;
  }
}
