export * from "./r2";

export interface Edition {
  id: string;
  title: string;
  editionMonth: string; // e.g., "ನವೆಂಬರ್"
  editionYear: number;  // e.g., 2026
  formattedDate: string; // e.g., "ನವೆಂಬರ್ ೨೦೨೬"
  volumeNumber?: number; // ಸಂಪುಟ
  issueNumber?: number;  // ಸಂಚಿಕೆ
  pdfUrl?: string;
  coverImageUrl?: string;
  totalPages: number;
  fileSizeBytes?: number;
  formattedFileSize?: string; // e.g., "12.4 MB"
  isPublished: boolean;
  publishedAt?: string;
  description?: string;
  language?: string;
  edition?: string;
  fileName?: string;
}

export interface NavigationItem {
  label: string;
  labelEn?: string;
  href: string;
}
