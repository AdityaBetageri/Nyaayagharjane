import { Edition } from "@/types";
import {
  R2Catalogue,
  R2CatalogueFilters,
  R2FetchResult,
  R2NewspaperItem,
} from "@/types/r2";
import { PLACEHOLDER_LATEST_EDITION, PLACEHOLDER_PREVIOUS_EDITIONS } from "./constants";

// Month folder mapping in Cloudflare R2
export const R2_MONTH_FOLDERS: Record<number, string> = {
  1: "01-january",
  2: "02-february",
  3: "03-march",
  4: "04-april",
  5: "05-may",
  6: "06-june",
  7: "07-july",
  8: "08-august",
  9: "09-september",
  10: "10-october",
  11: "11-november",
  12: "12-december",
};

export const KANNADA_MONTH_MAP: Record<number, string> = {
  1: "ಜನವರಿ",
  2: "ಫೆಬ್ರವರಿ",
  3: "ಮಾರ್ಚ್",
  4: "ಏಪ್ರಿಲ್",
  5: "ಮೇ",
  6: "ಜೂನ್",
  7: "ಜುಲೈ",
  8: "ಆಗಸ್ಟ್",
  9: "ಸೆಪ್ಟೆಂಬರ್",
  10: "ಅಕ್ಟೋಬರ್",
  11: "ನವೆಂಬರ್",
  12: "ಡಿಸೆಂಬರ್",
};

export const MONTH_TO_NUMBER: Record<string, number> = {
  ಜನವರಿ: 1,
  ಫೆಬ್ರವರಿ: 2,
  ಮಾರ್ಚ್: 3,
  ಏಪ್ರಿಲ್: 4,
  ಮೇ: 5,
  ಜೂನ್: 6,
  ಜುಲೈ: 7,
  ಆಗಸ್ಟ್: 8,
  ಸೆಪ್ಟೆಂಬರ್: 9,
  ಅಕ್ಟೋಬರ್: 10,
  ನವೆಂಬರ್: 11,
  ಡಿಸೆಂಬರ್: 12,
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

/**
 * Returns the public custom domain URL configured for Cloudflare R2.
 * Supports NEXT_PUBLIC_R2_PUBLIC_URL (Next.js) and VITE_R2_PUBLIC_URL (standard spec).
 */
export function getR2PublicUrl(): string {
  const url =
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
    process.env.VITE_R2_PUBLIC_URL ||
    "";
  const clean = url.trim().replace(/\/+$/, "");
  if (clean.includes("r2.cloudflarestorage.com") || clean === "https://files.yourdomain.com") {
    return "";
  }
  return clean;
}

/**
 * Returns the month folder name formatted as "MM-month" (e.g. "11-november").
 */
export function getR2MonthFolder(month: number | string): string {
  const num = typeof month === "number" ? month : MONTH_TO_NUMBER[month.toLowerCase()] || 1;
  return R2_MONTH_FOLDERS[num] || `${String(num).padStart(2, "0")}-month`;
}

/**
 * Generates the expected public PDF URL in Cloudflare R2.
 * Pattern: https://files.yourdomain.com/newspapers/YYYY/MM-month/fileName.pdf
 * If no public CDN URL is configured, falls back to the internal streaming API route.
 */
export function generateR2PdfUrl(
  year: number,
  month: number | string,
  fileName: string,
  customBaseUrl?: string
): string {
  const baseUrl = (customBaseUrl || getR2PublicUrl() || "").replace(/\/+$/, "");
  const folder = getR2MonthFolder(month);
  const cleanFileName = fileName.replace(/^\/+/, "");
  const targetKey = `newspapers/${year}/${folder}/${cleanFileName}`;

  if (baseUrl && !baseUrl.includes("r2.cloudflarestorage.com") && baseUrl !== "https://files.yourdomain.com") {
    return `${baseUrl}/${targetKey}`;
  }

  return `/api/r2/file?key=${encodeURIComponent(targetKey)}`;
}

/**
 * Extract or resolve the R2 object key from an edition or URL
 */
export function extractR2KeyFromEdition(params: {
  pdfUrl?: string;
  fileName?: string;
  year?: number;
  month?: number | string;
}): string | null {
  // 1. If pdfUrl has ?key=... query param or pathname
  if (params.pdfUrl) {
    try {
      const parsedUrl = new URL(params.pdfUrl, "http://localhost");
      const keyParam = parsedUrl.searchParams.get("key");
      if (keyParam) {
        return decodeURIComponent(keyParam).replace(/^\/+/, "");
      }
      const match = parsedUrl.pathname.match(/(newspapers\/.*)$/);
      if (match) {
        return decodeURIComponent(match[1]).replace(/^\/+/, "");
      }
    } catch {
      const match = params.pdfUrl.match(/(newspapers\/.*)$/);
      if (match) {
        return decodeURIComponent(match[1]).replace(/^\/+/, "");
      }
    }
  }

  // 2. If year, month, fileName are available
  if (params.year && params.month && params.fileName) {
    const monthFolder = getR2MonthFolder(params.month);
    const cleanFileName = params.fileName.replace(/^\/+/, "");
    return `newspapers/${params.year}/${monthFolder}/${cleanFileName}`;
  }

  return null;
}

/**
 * Sanitize strings to prevent HTML and script injection from external JSON catalogues.
 */
function sanitizeString(str: unknown): string {
  if (typeof str !== "string") return "";
  return str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .trim();
}

/**
 * Validates an individual newspaper record from R2 JSON catalogue.
 */
export function validateR2Item(item: unknown): item is R2NewspaperItem {
  if (!item || typeof item !== "object") return false;
  const candidate = item as Record<string, unknown>;

  return (
    typeof candidate.id === "string" &&
    candidate.id.length > 0 &&
    typeof candidate.title === "string" &&
    typeof candidate.year === "number" &&
    typeof candidate.month === "number" &&
    candidate.month >= 1 &&
    candidate.month <= 12 &&
    typeof candidate.fileName === "string" &&
    typeof candidate.pdfUrl === "string" &&
    typeof candidate.publishedAt === "string" &&
    (candidate.status === "published" ||
      candidate.status === "draft" ||
      candidate.status === "archived")
  );
}

/**
 * In-memory catalogue cache to prevent redundant HTTP requests across page views.
 */
let memoryCache: {
  catalogue: R2Catalogue | null;
  timestamp: number;
} = {
  catalogue: null,
  timestamp: 0,
};

const CACHE_TTL_MS = 60 * 1000; // 60 seconds client cache

/**
 * Converts an R2NewspaperItem to the frontend's Edition model for UI compatibility.
 */
export function r2ItemToEdition(item: R2NewspaperItem): Edition {
  const monthName = KANNADA_MONTH_MAP[item.month] || `ತಿಂಗಳು ${item.month}`;

  let safePdfUrl = item.pdfUrl;
  // If the stored URL is pointing to private S3 endpoint or placeholder, route through proxy
  if (
    !safePdfUrl ||
    safePdfUrl.includes("r2.cloudflarestorage.com") ||
    safePdfUrl.includes("files.yourdomain.com")
  ) {
    const folder = getR2MonthFolder(item.month);
    const cleanFileName = item.fileName.replace(/^\/+/, "");
    const targetKey = `newspapers/${item.year}/${folder}/${cleanFileName}`;
    safePdfUrl = `/api/r2/file?key=${encodeURIComponent(targetKey)}`;
  }

  return {
    id: item.id,
    title: sanitizeString(item.title),
    editionMonth: monthName,
    editionYear: item.year,
    formattedDate: `${monthName} ${item.year}`,
    volumeNumber: item.year >= 2026 ? item.year - 2025 : 1,
    issueNumber: item.month,
    pdfUrl: safePdfUrl,
    totalPages: item.totalPages || 16,
    formattedFileSize: item.formattedFileSize || "೧೨.೪ MB",
    isPublished: item.status === "published",
    publishedAt: item.publishedAt,
    description: item.description ? sanitizeString(item.description) : undefined,
    language: sanitizeString(item.language || "Kannada"),
    edition: sanitizeString(item.edition || "State Edition"),
    fileName: sanitizeString(item.fileName),
  };
}

export function editionToR2Item(edition: Edition): R2NewspaperItem {
  return {
    id: edition.id,
    title: edition.title,
    language: edition.language || "Kannada",
    edition: edition.edition || "ರಾಜ್ಯ ಆವೃತ್ತಿ",
    month: edition.issueNumber || 11,
    year: edition.editionYear || 2026,
    fileName: edition.fileName || "kannada.pdf",
    pdfUrl: edition.pdfUrl || "",
    publishedAt: edition.publishedAt || "2026-11-01",
    status: edition.isPublished ? "published" : "draft",
    totalPages: edition.totalPages,
    formattedFileSize: edition.formattedFileSize,
    description: edition.description,
  };
}

/**
 * Fallback editions used when R2 is offline or unconfigured.
 */
export function getLocalFallbackEditions(): Edition[] {
  return [PLACEHOLDER_LATEST_EDITION, ...PLACEHOLDER_PREVIOUS_EDITIONS];
}

/**
 * Fetches the JSON catalogue from Cloudflare R2:
 * Expected path: ${R2_PUBLIC_URL}/data/newspapers.json
 */
export async function fetchR2Catalogue(options?: {
  bypassCache?: boolean;
  publishedOnly?: boolean;
  filters?: R2CatalogueFilters;
}): Promise<R2FetchResult> {
  const r2BaseUrl = getR2PublicUrl();
  const publishedOnly = options?.publishedOnly ?? true;
  const isClient = typeof window !== "undefined";

  // Check in-memory cache first if on client and not bypassing
  if (isClient && !options?.bypassCache && memoryCache.catalogue) {
    const elapsed = performance.now() - memoryCache.timestamp;
    if (elapsed < CACHE_TTL_MS) {
      let items = memoryCache.catalogue.newspapers;
      if (publishedOnly) {
        items = items.filter((n) => n.status === "published");
      }
      items = sortNewspapers(items);
      if (options?.filters) {
        items = filterNewspapers(items, options.filters);
      }
      return {
        success: true,
        data: items,
        rawCatalogue: memoryCache.catalogue,
        source: "cache",
      };
    }
  }

  // On client browsers, route through same-origin /api/r2/catalogue to prevent CORS blocks on *.r2.dev
  let catalogueUrl = isClient ? "/api/r2/catalogue" : r2BaseUrl ? `${r2BaseUrl}/data/newspapers.json` : "";
  if (!catalogueUrl && !isClient) {
    // Server-side fallback when no public R2 domain is configured
    return {
      success: true,
      data: getLocalFallbackEditions().map(editionToR2Item),
      source: "fallback",
    };
  }

  try {
    const shouldBypass = Boolean(options?.bypassCache);
    const fetchOptions: RequestInit = {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: shouldBypass ? "no-store" : "default",
      signal: AbortSignal.timeout(4000),
    };

    if (!isClient && !shouldBypass) {
      // Revalidate in background every 60 seconds
      (fetchOptions as Record<string, unknown>).next = { revalidate: 60 };
    }

    let res = await fetch(catalogueUrl, fetchOptions).catch(() => null);

    // Fallback: If same-origin route failed and r2BaseUrl exists, try direct
    if ((!res || !res.ok) && r2BaseUrl && catalogueUrl !== `${r2BaseUrl}/data/newspapers.json`) {
      res = await fetch(`${r2BaseUrl}/data/newspapers.json`, fetchOptions).catch(() => null);
    }

    if (!res || !res.ok) {
      return {
        success: false,
        data: [],
        source: "fallback",
        error: res ? `R2 ಕ್ಯಾಟಲಾಗ್ ಲೋಡ್ ವಿಫಲವಾಗಿದೆ (HTTP ${res.status}: ${res.statusText})` : "R2 ಸಂಪರ್ಕ ದೋಷ",
      };
    }

    const json = await res.json();

    if (!json || !Array.isArray(json.newspapers)) {
      return {
        success: false,
        data: [],
        source: "fallback",
        error: "R2 ಕ್ಯಾಟಲಾಗ್ JSON ಅಮಾನ್ಯ ರಚನೆ ಹೊಂದಿದೆ (Expected { newspapers: [...] }).",
      };
    }

    // Validate and sanitize records
    const validItems: R2NewspaperItem[] = [];
    for (const rawItem of json.newspapers) {
      if (validateR2Item(rawItem)) {
        validItems.push({
          ...rawItem,
          title: sanitizeString(rawItem.title),
          language: sanitizeString(rawItem.language),
          edition: sanitizeString(rawItem.edition),
          description: rawItem.description ? sanitizeString(rawItem.description) : undefined,
          fileName: sanitizeString(rawItem.fileName),
        });
      }
    }

    const fullCatalogue: R2Catalogue = {
      newspapers: validItems,
      lastUpdated: json.lastUpdated || "",
      version: json.version || "1.0",
    };

    // Store in client-side memory cache
    if (isClient) {
      memoryCache = {
        catalogue: fullCatalogue,
        timestamp: performance.now(),
      };
    }

    let resultItems = validItems;
    if (publishedOnly) {
      resultItems = resultItems.filter((i) => i.status === "published");
    }

    resultItems = sortNewspapers(resultItems);

    if (options?.filters) {
      resultItems = filterNewspapers(resultItems, options.filters);
    }

    return {
      success: true,
      data: resultItems,
      rawCatalogue: fullCatalogue,
      source: "r2",
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return {
      success: false,
      data: [],
      source: "fallback",
      error: `R2 ಸಂಪರ್ಕ ದೋಷ: ${message}`,
    };
  }
}

/**
 * Sorts newspapers by publication date, newest first.
 */
export function sortNewspapers(items: R2NewspaperItem[]): R2NewspaperItem[] {
  return [...items].sort((a, b) => {
    // 1. By publication date descending (ISO strings compare cleanly)
    if (a.publishedAt && b.publishedAt && a.publishedAt !== b.publishedAt) {
      return b.publishedAt.localeCompare(a.publishedAt);
    }
    // 2. By year descending
    if (b.year !== a.year) {
      return b.year - a.year;
    }
    // 3. By month descending
    return b.month - a.month;
  });
}

/**
 * Filter newspapers by year, month, language, edition, or search term.
 */
export function filterNewspapers(
  items: R2NewspaperItem[],
  filters: R2CatalogueFilters
): R2NewspaperItem[] {
  return items.filter((item) => {
    if (filters.year && item.year !== filters.year) {
      return false;
    }
    if (filters.month && item.month !== filters.month) {
      return false;
    }
    if (
      filters.language &&
      item.language.toLowerCase() !== filters.language.toLowerCase()
    ) {
      return false;
    }
    if (
      filters.edition &&
      item.edition.toLowerCase() !== filters.edition.toLowerCase()
    ) {
      return false;
    }
    if (filters.searchQuery && filters.searchQuery.trim() !== "") {
      const q = filters.searchQuery.toLowerCase();
      const monthName = KANNADA_MONTH_MAP[item.month] || "";
      const matchesTitle = item.title.toLowerCase().includes(q);
      const matchesMonth = monthName.toLowerCase().includes(q);
      const matchesEdition = item.edition.toLowerCase().includes(q);
      const matchesFileName = item.fileName.toLowerCase().includes(q);
      return matchesTitle || matchesMonth || matchesEdition || matchesFileName;
    }
    return true;
  });
}

/**
 * Utility to test R2 connection and catalogue reachability via server proxy.
 */
export async function testR2Connection(customUrl?: string): Promise<{
  ok: boolean;
  status: number;
  url: string;
  itemCount: number;
  error?: string;
  durationMs: number;
  s3Status?: {
    configured: boolean;
    bucketName: string;
    catalogueFound: boolean;
    itemCount: number;
    ok: boolean;
    error: string | null;
  };
  pdfCheck?: {
    ok: boolean;
    status: number;
    url: string;
    error?: string;
  } | null;
}> {
  try {
    const res = await fetch("/api/r2/verifier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetUrl: customUrl }),
    });

    const data = await res.json();
    if (!res.ok || !data) {
      return {
        ok: false,
        status: res.status,
        url: customUrl || "",
        itemCount: 0,
        error: data?.message || `HTTP ${res.status}`,
        durationMs: data?.durationMs || 0,
      };
    }

    const publicOk = Boolean(data.publicStatus?.ok);
    const s3Ok = Boolean(data.s3Status?.ok);

    return {
      ok: publicOk || s3Ok,
      status: data.publicStatus?.status || (s3Ok ? 200 : 0),
      url: data.testedCatalogueUrl || data.publicStatus?.url || customUrl || "",
      itemCount: data.publicStatus?.itemCount || data.s3Status?.itemCount || 0,
      error: publicOk ? undefined : data.publicStatus?.error || data.s3Status?.error,
      durationMs: data.durationMs || 0,
      s3Status: data.s3Status,
      pdfCheck: data.pdfCheck,
    };
  } catch (err: unknown) {
    return {
      ok: false,
      status: 0,
      url: customUrl || "",
      itemCount: 0,
      error: err instanceof Error ? err.message : "ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ (Connection failed)",
      durationMs: 0,
    };
  }
}
