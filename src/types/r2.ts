/**
 * Cloudflare R2 Catalogue and Newspaper Types for Nyaayagharjane E-Newspaper
 */

export type NewspaperStatus = "published" | "draft" | "archived";

export interface R2NewspaperItem {
  id: string;
  title: string;
  language: string;       // e.g. "Kannada"
  edition: string;        // e.g. "Dakshina Kannada" / "State Edition"
  month: number;          // 1 - 12
  year: number;           // e.g. 2026
  fileName: string;       // e.g. "kannada.pdf"
  pdfUrl: string;         // e.g. "https://files.yourdomain.com/newspapers/2026/11-november/kannada.pdf"
  publishedAt: string;    // YYYY-MM-DD (e.g. "2026-11-16")
  status: NewspaperStatus;
  totalPages?: number;
  formattedFileSize?: string;
  description?: string;
}

export interface R2Catalogue {
  newspapers: R2NewspaperItem[];
  lastUpdated?: string;
  version?: string;
}

export interface R2CatalogueFilters {
  year?: number;
  month?: number;
  language?: string;
  edition?: string;
  searchQuery?: string;
}

export interface R2FetchResult {
  success: boolean;
  data: R2NewspaperItem[];
  rawCatalogue?: R2Catalogue;
  source: "r2" | "fallback" | "cache";
  error?: string;
}
