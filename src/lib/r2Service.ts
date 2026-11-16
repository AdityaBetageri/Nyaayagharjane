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
  return url.trim().replace(/\/+$/, "");
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
 */
export function generateR2PdfUrl(
  year: number,
  month: number | string,
  fileName: string,
  customBaseUrl?: string
): string {
  const baseUrl = (customBaseUrl || getR2PublicUrl() || "https://files.yourdomain.com").replace(/\/+$/, "");
  const folder = getR2MonthFolder(month);
  const cleanFileName = fileName.replace(/^\/+/, "");
  return `${baseUrl}/newspapers/${year}/${folder}/${cleanFileName}`;
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
  return {
    id: item.id,
    title: sanitizeString(item.title),
    editionMonth: monthName,
    editionYear: item.year,
    formattedDate: `${monthName} ${item.year}`,
    volumeNumber: item.year >= 2026 ? item.year - 2025 : 1,
    issueNumber: item.month,
    pdfUrl: item.pdfUrl,
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

  // If R2 URL is not configured yet, fallback gracefully
  if (!r2BaseUrl) {
    return {
      success: false,
      data: [],
      source: "fallback",
      error: "Cloudflare R2 ಸಾರ್ವಜನಿಕ ಡೊಮೈನ್ ಕಾನ್ಫಿಗರ್ ಆಗಿಲ್ಲ (NEXT_PUBLIC_R2_PUBLIC_URL or VITE_R2_PUBLIC_URL is unset).",
    };
  }

  const catalogueUrl = `${r2BaseUrl}/data/newspapers.json`;

  try {
    const fetchOptions: RequestInit = {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    };

    if (!isClient) {
      // Short cache lifetime for metadata on server
      (fetchOptions as Record<string, unknown>).next = { revalidate: 60 };
    }

    const res = await fetch(catalogueUrl, fetchOptions);

    if (!res.ok) {
      return {
        success: false,
        data: [],
        source: "fallback",
        error: `R2 ಕ್ಯಾಟಲಾಗ್ ಲೋಡ್ ವಿಫಲವಾಗಿದೆ (HTTP ${res.status}: ${res.statusText})`,
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
 * Utility to test R2 connection and catalogue reachability.
 */
export async function testR2Connection(customUrl?: string): Promise<{
  ok: boolean;
  status: number;
  url: string;
  itemCount: number;
  error?: string;
  durationMs: number;
}> {
  const base = (customUrl || getR2PublicUrl()).replace(/\/+$/, "");
  if (!base) {
    return {
      ok: false,
      status: 0,
      url: "",
      itemCount: 0,
      error: "ಡೊಮೈನ್ URL ನಮೂದಿಸಲಾಗಿಲ್ಲ",
      durationMs: 0,
    };
  }

  const testUrl = `${base}/data/newspapers.json`;
  const start = performance.now();

  try {
    const res = await fetch(testUrl, {
      method: "GET",
      cache: "no-store",
    });
    const durationMs = Math.round(performance.now() - start);

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        url: testUrl,
        itemCount: 0,
        error: `HTTP ${res.status}: ${res.statusText}`,
        durationMs,
      };
    }

    const data = await res.json();
    const count = Array.isArray(data?.newspapers) ? data.newspapers.length : 0;

    return {
      ok: true,
      status: res.status,
      url: testUrl,
      itemCount: count,
      durationMs,
    };
  } catch (err: unknown) {
    const durationMs = Math.round(performance.now() - start);
    return {
      ok: false,
      status: 0,
      url: testUrl,
      itemCount: 0,
      error: err instanceof Error ? err.message : "Connection failed",
      durationMs,
    };
  }
}
