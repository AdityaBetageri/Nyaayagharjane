"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  BookOpen,
  CheckCircle2,
  FolderTree,
  ExternalLink,
  Terminal,
  HelpCircle,
  Save,
  Copy,
  Download,
  FileText,
  AlertCircle,
  Loader2,
  CloudUpload,
  ShieldCheck,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { addStoredEdition } from "@/lib/editionsStore";
import {
  getR2PublicUrl,
  getR2MonthFolder,
  generateR2PdfUrl,
  r2ItemToEdition,
  fetchR2Catalogue,
  KANNADA_MONTH_MAP,
} from "@/lib/r2Service";
import {
  uploadNewspaperWithChunks,
  UploadProgress,
  getSavedUploadSession,
  clearUploadSession,
} from "@/lib/chunkUploader";
import { R2Catalogue, R2NewspaperItem } from "@/types/r2";

interface FormErrors {
  file?: string;
  title?: string;
  year?: string;
  month?: string;
  editionArea?: string;
  language?: string;
  fileName?: string;
  totalPages?: string;
}

export default function AdminUploadPage() {
  const [r2Url] = useState(() => getR2PublicUrl());
  const [r2Items, setR2Items] = useState<R2NewspaperItem[]>([]);
  const [r2Configured, setR2Configured] = useState<boolean | null>(null);

  // Form Fields
  const [uploadTitle, setUploadTitle] = useState("ನ್ಯಾಯಘರ್ಜನೆ - ನವೆಂಬರ್ ೨೦೨೬");
  const [uploadYear, setUploadYear] = useState(2026);
  const [uploadMonth, setUploadMonth] = useState(11);
  const [uploadEditionArea, setUploadEditionArea] = useState("ರಾಜ್ಯ ಆವೃತ್ತಿ");
  const [uploadLanguage, setUploadLanguage] = useState("Kannada");
  const [uploadFileName, setUploadFileName] = useState("kannada.pdf");
  const [uploadStatus, setUploadStatus] = useState<"published" | "draft">("published");
  const [uploadTotalPages, setUploadTotalPages] = useState(16);
  const [uploadFileSize, setUploadFileSize] = useState("೧೨.೪ MB");
  const [uploadDescription, setUploadDescription] = useState(
    "ನ್ಯಾಯಘರ್ಜನೆ ನವೆಂಬರ್ ೨೦೨೬ ರ ಅಧಿಕೃತ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ. ಸತ್ಯದ ಧ್ವನಿ, ನ್ಯಾಯದ ಘರ್ಜನೆ."
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sessionKeyVersion, setSessionKeyVersion] = useState(0);

  // Form Validation State
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Upload Progress & State
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [lastUploadedId, setLastUploadedId] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [publishedDate] = useState("2026-11-16");
  const [lastUpdatedDate] = useState("2026-11-16T12:00:00Z");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPausedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Fetch catalogue
    fetchR2Catalogue({ bypassCache: false, publishedOnly: false }).then((res) => {
      if (res.success && res.data.length > 0) {
        setR2Items(res.data);
      }
    });

    // Check R2 Server Configuration
    fetch("/api/r2/status")
      .then((res) => res.json())
      .then((data) => {
        setR2Configured(!!data.isFullyConfigured);
      })
      .catch(() => {
        setR2Configured(false);
      });
  }, []);

  // Validation function
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 1. PDF File
    if (!selectedFile) {
      newErrors.file = "ದಯವಿಟ್ಟು ಪತ್ರಿಕೆಯ PDF ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ (PDF file is required).";
    } else if (!selectedFile.name.toLowerCase().endsWith(".pdf")) {
      newErrors.file = "ಆಯ್ಕೆಮಾಡಿದ ಫೈಲ್ PDF ಮಾದರಿಯದ್ದಾಗಿರಬೇಕು (.pdf file required).";
    }

    // 2. Title
    if (!uploadTitle.trim()) {
      newErrors.title = "ಪತ್ರಿಕೆಯ ಶೀರ್ಷಿಕೆ ಕಡ್ಡಾಯವಾಗಿದೆ (Title is required).";
    } else if (uploadTitle.trim().length < 3) {
      newErrors.title = "ಶೀರ್ಷಿಕೆಯು ಕನಿಷ್ಠ ೩ ಅಕ್ಷರಗಳಾಗಿರಬೇಕು.";
    }

    // 3. Year
    if (!uploadYear || isNaN(uploadYear) || uploadYear < 2000 || uploadYear > 2100) {
      newErrors.year = "ಮಾನ್ಯವಾದ ವರ್ಷವನ್ನು ನಮೂದಿಸಿ (2000 - 2100).";
    }

    // 4. Month
    if (!uploadMonth || isNaN(uploadMonth) || uploadMonth < 1 || uploadMonth > 12) {
      newErrors.month = "ಮಾನ್ಯವಾದ ತಿಂಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ (1 - 12).";
    }

    // 5. Edition Area
    if (!uploadEditionArea.trim()) {
      newErrors.editionArea = "ಆವೃತ್ತಿಯ ಪ್ರದೇಶ ಕಡ್ಡಾಯವಾಗಿದೆ (ಉದಾ: ರಾಜ್ಯ ಆವೃತ್ತಿ).";
    }

    // 6. Language
    if (!uploadLanguage.trim()) {
      newErrors.language = "ಭಾಷೆ ಕಡ್ಡಾಯವಾಗಿದೆ (ಉದಾ: Kannada).";
    }

    // 7. File Name
    const cleanFileName = uploadFileName.trim();
    if (!cleanFileName) {
      newErrors.fileName = "PDF ಫೈಲ್ ಹೆಸರು ಕಡ್ಡಾಯವಾಗಿದೆ.";
    } else if (!cleanFileName.toLowerCase().endsWith(".pdf")) {
      newErrors.fileName = "ಫೈಲ್ ಹೆಸರು .pdf ನೊಂದಿಗೆ ಕೊನೆಗೊಳ್ಳಬೇಕು (ಉದಾ: kannada.pdf).";
    } else if (/[/\\?%*:|"<> ]/g.test(cleanFileName)) {
      newErrors.fileName = "ಫೈಲ್ ಹೆಸರಿನಲ್ಲಿ ಅಮಾನ್ಯ ಅಕ್ಷರಗಳು ಅಥವಾ ಖಾಲಿ ಜಾಗವಿರಬಾರದು (ಕೇವಲ ಅಕ್ಷರ, ಅಂಕಿ, ಡ್ಯಾಶ್ ಬಳಸಿ).";
    }

    // 8. Total Pages
    if (!uploadTotalPages || isNaN(uploadTotalPages) || uploadTotalPages < 1) {
      newErrors.totalPages = "ಒಟ್ಟು ಪುಟಗಳು ಕನಿಷ್ಠ ೧ ಆಗಿರಬೇಕು.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const markTouched = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Update handlers for Year & Month that sync title and filename
  const handleYearChange = (year: number) => {
    setUploadYear(year);
    markTouched("year");
    if (errors.year) {
      setErrors((prev) => ({ ...prev, year: undefined }));
    }
    const monthName = KANNADA_MONTH_MAP[uploadMonth] || "ನವೆಂಬರ್";
    setUploadTitle(`ನ್ಯಾಯಘರ್ಜನೆ - ${monthName} ${year}`);
  };

  const handleMonthChange = (month: number) => {
    setUploadMonth(month);
    markTouched("month");
    if (errors.month) {
      setErrors((prev) => ({ ...prev, month: undefined }));
    }
    const monthName = KANNADA_MONTH_MAP[month] || "ನವೆಂಬರ್";
    setUploadTitle(`ನ್ಯಾಯಘರ್ಜನೆ - ${monthName} ${uploadYear}`);
    const monthFolder = getR2MonthFolder(month);
    setUploadFileName(`kannada-${monthFolder}.pdf`);
  };

  // Handle local file picking
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setErrors((prev) => ({
          ...prev,
          file: "ದಯವಿಟ್ಟು ಕೇವಲ PDF (.pdf) ಫೈಲ್ ಮಾತ್ರ ಆಯ್ಕೆಮಾಡಿ.",
        }));
        setTouched((prev) => ({ ...prev, file: true }));
        return;
      }

      setSelectedFile(file);
      // Clean safe filename
      const safeName = file.name.replace(/\s+/g, "-");
      setUploadFileName(safeName);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadFileSize(`${sizeMB} MB`);
      setUploadError(null);
      setErrors((prev) => ({ ...prev, file: undefined, fileName: undefined }));
      setTouched((prev) => ({ ...prev, file: true }));
    }
  };

  // Calculate R2 paths
  const currentMonthFolder = getR2MonthFolder(uploadMonth);
  const currentPdfUrl = generateR2PdfUrl(uploadYear, uploadMonth, uploadFileName, r2Url);
  const targetKey = `newspapers/${uploadYear}/${currentMonthFolder}/${uploadFileName}`;

  // Derived resumable session info (no useEffect needed)
  const resumeSession =
    selectedFile && sessionKeyVersion >= 0
      ? getSavedUploadSession(selectedFile, targetKey)
      : null;
  const hasResumeSession = Boolean(resumeSession && resumeSession.completedParts.length > 0);
  const resumablePartsCount = resumeSession ? resumeSession.completedParts.length : 0;

  const currentItemRecord: R2NewspaperItem = {
    id: `news-${uploadYear}-${String(uploadMonth).padStart(2, "0")}`,
    title: uploadTitle.trim(),
    language: uploadLanguage.trim(),
    edition: uploadEditionArea.trim(),
    month: uploadMonth,
    year: uploadYear,
    fileName: uploadFileName.trim(),
    pdfUrl: currentPdfUrl,
    publishedAt: publishedDate,
    status: uploadStatus,
    totalPages: uploadTotalPages,
    formattedFileSize: uploadFileSize.trim(),
    description: uploadDescription.trim(),
  };

  // Full Catalogue JSON string
  const generatedCatalogue: R2Catalogue = {
    version: "1.0",
    lastUpdated: lastUpdatedDate,
    newspapers: [
      currentItemRecord,
      ...r2Items.filter((item) => item.id !== currentItemRecord.id),
    ],
  };

  const jsonCatalogueString = JSON.stringify(generatedCatalogue, null, 2);

  // Mark all fields as touched for validation highlight
  const touchAllFields = () => {
    setTouched({
      file: true,
      title: true,
      year: true,
      month: true,
      editionArea: true,
      language: true,
      fileName: true,
      totalPages: true,
    });
  };

  // 1. Automatic R2 Upload Handler (Chunked + Auto JSON Update)
  const handleAutoUpload = async () => {
    touchAllFields();
    if (!validateForm()) {
      setUploadError("ದಯವಿಟ್ಟು ಕೆಂಪು ಬಣ್ಣದಲ್ಲಿ ಗುರುತಿಸಲಾದ ಅಗತ್ಯವಿರುವ ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಸರಿಯಾಗಿ ಭರ್ತಿ ಮಾಡಿ.");
      return;
    }

    if (!selectedFile) {
      setUploadError("ದಯವಿಟ್ಟು ಮೊದಲು ಪತ್ರಿಕೆಯ PDF ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ.");
      return;
    }

    setUploadError(null);
    setIsUploading(true);
    isPausedRef.current = false;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await uploadNewspaperWithChunks({
        file: selectedFile,
        itemRecord: currentItemRecord,
        targetKey,
        onProgress: (p) => {
          setUploadProgress(p);
        },
        shouldPause: () => isPausedRef.current,
        signal: controller.signal,
      });

      if (result.success) {
        // Also save to local edition store so reader and admin reflect immediately
        const newEd = r2ItemToEdition(currentItemRecord);
        addStoredEdition(newEd);
        setLastUploadedId(newEd.id);
        setSuccessNotice(
          `"${newEd.title}" ಪತ್ರಿಕೆ ಮತ್ತು ಕ್ಯಾಟಲಾಗ್ Cloudflare R2 ಗೆ ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ! ಕೆಳಗಿನ "ವಾಚಕದಲ್ಲಿ ನೋಡಿ" ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ತಕ್ಷಣವೇ ಓದಿ.`
        );
        setSessionKeyVersion((v) => v + 1);
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setUploadError("ಅಪ್‌ಲೋಡ್ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ (Upload cancelled).");
      } else {
        const msg =
          err instanceof Error
            ? err.message
            : "ಅಪ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ. ನೆಟ್‌ವರ್ಕ್ ಪರಿಶೀಲಿಸಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.";
        setUploadError(msg);
      }
      setSessionKeyVersion((v) => v + 1);
    } finally {
      setIsUploading(false);
      abortControllerRef.current = null;
    }
  };

  // Cancel in-flight upload handler
  const handleCancelUpload = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsUploading(false);
    setUploadProgress(null);
    setUploadError("ಅಪ್‌ಲೋಡ್ ಅನ್ನು ಯಶಸ್ವಿಯಾಗಿ ರದ್ದುಗೊಳಿಸಲಾಗಿದೆ (Upload was cancelled).");
    setSessionKeyVersion((v) => v + 1);
  };

  // 2. Local Preview Only Handler (Fallback if R2 is not configured)
  const handleSaveToPreview = () => {
    touchAllFields();
    if (!validateForm()) {
      setUploadError("ದಯವಿಟ್ಟು ಕೆಂಪು ಬಣ್ಣದಲ್ಲಿ ಗುರುತಿಸಲಾದ ಅಗತ್ಯವಿರುವ ಎಲ್ಲಾ ವಿವರಗಳನ್ನು ಸರಿಯಾಗಿ ಭರ್ತಿ ಮಾಡಿ.");
      return;
    }

    const newEd = r2ItemToEdition(currentItemRecord);
    addStoredEdition(newEd);
    setLastUploadedId(newEd.id);
    setSuccessNotice(
      `"${newEd.title}" ಪತ್ರಿಕೆಯನ್ನು ಸ್ಥಳೀಯವಾಗಿ ಸಿದ್ಧಪಡಿಸಲಾಗಿದೆ! ಕೆಳಗಿನ "ವಾಚಕದಲ್ಲಿ ನೋಡಿ" ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ತಕ್ಷಣವೇ ಪರೀಕ್ಷಿಸಿ.`
    );
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(jsonCatalogueString);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleDownloadJson = () => {
    const blob = new Blob([jsonCatalogueString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newspapers.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearResume = () => {
    if (selectedFile) {
      clearUploadSession(selectedFile, targetKey);
      setSessionKeyVersion((v) => v + 1);
      setUploadProgress(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-[#172B4D]">
              ಹೊಸ ಪತ್ರಿಕೆ ಸ್ವಯಂಚಾಲಿತ ಅಪ್‌ಲೋಡ್ (R2 Auto Upload)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-[#C62828] border border-red-200">
              ಚಂಕ್ ಅಪ್‌ಲೋಡ್ ಸಕ್ರಿಯ
            </span>
            {r2Configured === true && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>R2 ಸಂಪರ್ಕಗೊಂಡಿದೆ</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#5A6A85] mt-1">
            PDF ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ &ldquo;ಸ್ವಯಂಚಾಲಿತ ಅಪ್‌ಲೋಡ್&rdquo; ಕ್ಲಿಕ್ ಮಾಡಿ. PDF ಮತ್ತು ಕ್ಯಾಟಲಾಗ್ JSON ಎರಡೂ ನೇರವಾಗಿ Cloudflare R2 ಗೆ ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತವೆ.
          </p>
        </div>

        <Link
          href="/admin/papers"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-[#172B4D] text-xs font-bold rounded-xl transition-colors shrink-0"
        >
          <FileText className="w-4 h-4" />
          <span>ಪತ್ರಿಕೆಗಳ ಪಟ್ಟಿ ನೋಡಿ</span>
        </Link>
      </div>

      {/* Offline/Fallback Notice if storage is not yet connected */}
      {r2Configured === false && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between gap-3 text-blue-950 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              ಆನ್‌ಲೈನ್ ಸ್ಟೋರೇಜ್ ಸಂಪರ್ಕ ಇನ್ನೂ ಸಕ್ರಿಯವಾಗಿರದಿದ್ದರೆ, ಕೆಳಗಿನ <strong>&ldquo;ಸ್ಥಳೀಯ ಮುನ್ನೋಟಕ್ಕೆ ಸೇರಿಸಿ&rdquo;</strong> ಬಟನ್ ಬಳಸಿ ವಾಚಕದಲ್ಲಿ ತಕ್ಷಣ ಪರೀಕ್ಷಿಸಬಹುದು.
            </span>
          </div>
        </div>
      )}

      {/* Success Banner */}
      {successNotice && (
        <div className="p-4 sm:p-5 bg-emerald-50 border-2 border-emerald-400 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-emerald-950">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-sm sm:text-base">ಸಂಚಿಕೆ ಯಶಸ್ವಿಯಾಗಿ ಪ್ರಕಟಗೊಂಡಿದೆ!</h4>
              <p className="text-xs text-emerald-800 mt-0.5">{successNotice}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {lastUploadedId && (
              <Link
                href={`/reader/${lastUploadedId}`}
                target="_blank"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>ವಾಚಕದಲ್ಲಿ ನೋಡಿ (Test in Reader)</span>
              </Link>
            )}
            <Link
              href="/latest"
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-2 bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-100 text-xs font-bold rounded-xl transition-colors"
            >
              <span>ಇತ್ತೀಚಿನ ಪುಟ</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-950 text-xs">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-red-900">ದಯವಿಟ್ಟು ಪರಿಶೀಲಿಸಿ:</p>
              <p className="text-red-700 mt-0.5">{uploadError}</p>
            </div>
          </div>
          {selectedFile && !isUploading && (
            <button
              type="button"
              onClick={handleAutoUpload}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#C62828] hover:bg-red-800 text-white font-bold rounded-lg text-xs transition-colors shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ (Retry)</span>
            </button>
          )}
        </div>
      )}

      {/* Live Upload Progress Card */}
      {(isUploading || (uploadProgress && uploadProgress.stage !== "idle")) && (
        <div className="bg-white p-5 rounded-2xl border-2 border-[#172B4D]/20 shadow-md space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {isUploading ? (
                <Loader2 className="w-5 h-5 text-[#C62828] animate-spin shrink-0" />
              ) : uploadProgress?.stage === "completed" ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              ) : (
                <CloudUpload className="w-5 h-5 text-[#172B4D] shrink-0" />
              )}
              <div>
                <h3 className="text-sm font-bold text-[#172B4D]">
                  {uploadProgress?.statusMessage || "ಅಪ್‌ಲೋಡ್ ಪ್ರಕ್ರಿಯೆ..."}
                </h3>
                <p className="text-[11px] text-[#5A6A85]">
                  ಚಂಕ್ ಅಪ್‌ಲೋಡ್ (ತುಂಡುಗಳಾಗಿ ರವಾನೆ): ನೆಟ್‌ವರ್ಕ್ ಕಡಿತಗೊಂಡರೂ ನಿಂತಿದ್ದಲ್ಲಿಂದಲೇ ಮುಂದುವರಿಯುತ್ತದೆ.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-base font-black text-[#172B4D]">
                {uploadProgress?.percent ?? 0}%
              </span>
              {isUploading && (
                <button
                  type="button"
                  onClick={handleCancelUpload}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 hover:bg-red-200 text-[#C62828] text-xs font-bold rounded-lg transition-colors cursor-pointer border border-red-200"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  <span>ರದ್ದುಮಾಡಿ</span>
                </button>
              )}
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full bg-neutral-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-neutral-200">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                uploadProgress?.stage === "completed"
                  ? "bg-emerald-500"
                  : "bg-gradient-to-r from-[#172B4D] via-[#C62828] to-[#172B4D] animate-pulse"
              }`}
              style={{ width: `${Math.max(3, uploadProgress?.percent ?? 0)}%` }}
            />
          </div>

          {/* Progress Metrics & Stage Indicators */}
          <div className="flex items-center justify-between text-[11px] text-[#5A6A85] pt-1 border-t border-neutral-100">
            <span>
              ಹಂತ: {uploadProgress?.currentPart ?? 0} / {uploadProgress?.totalParts ?? 1} ಭಾಗಗಳು
            </span>
            <span>
              ಗಾತ್ರ: {((uploadProgress?.uploadedBytes ?? 0) / (1024 * 1024)).toFixed(1)} MB /{" "}
              {((uploadProgress?.totalBytes ?? selectedFile?.size ?? 0) / (1024 * 1024)).toFixed(1)} MB
            </span>
          </div>
        </div>
      )}

      {/* Main Grid: Form Left, R2 Output Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & File Picker */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-4">
          <div className="border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center gap-2 text-[#C62828]">
              <Upload className="w-5 h-5" />
              <h2 className="text-base sm:text-lg font-black text-[#172B4D]">
                ಸಂಚಿಕೆ ವಿವರಗಳು ಮತ್ತು PDF ಫೈಲ್
              </h2>
            </div>
            <p className="text-xs text-[#5A6A85] mt-1">
              ಕೆಂಪು ಗುರುತಿರುವ (<span className="text-red-500">*</span>) ವಿವರಗಳು ಕಡ್ಡಾಯವಾಗಿವೆ.
            </p>
          </div>

          {/* PDF File Picker */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#172B4D]">
              ಪತ್ರಿಕೆ PDF ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                touched.file && errors.file
                  ? "border-red-400 bg-red-50/30"
                  : selectedFile
                  ? "border-emerald-400 bg-emerald-50/40"
                  : "border-neutral-300 hover:border-[#C62828] bg-neutral-50/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <div className="flex items-center justify-center gap-2">
                {selectedFile ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                ) : (
                  <Upload
                    className={`w-5 h-5 shrink-0 ${
                      touched.file && errors.file ? "text-red-600" : "text-[#C62828]"
                    }`}
                  />
                )}
                <div className="text-left">
                  <p className="text-xs font-bold text-[#172B4D] truncate max-w-xs">
                    {selectedFile ? selectedFile.name : "ಕ್ಲಿಕ್ ಮಾಡಿ PDF ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ"}
                  </p>
                  <p className="text-[10px] text-[#5A6A85]">
                    {selectedFile
                      ? `ಗಾತ್ರ: ${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`
                      : "ಫೈಲ್ ಹೆಸರು & ಗಾತ್ರವನ್ನು ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಲೆಕ್ಕಹಾಕುತ್ತದೆ"}
                  </p>
                </div>
              </div>
            </div>

            {/* File Error Message */}
            {touched.file && errors.file && (
              <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{errors.file}</span>
              </p>
            )}

            {/* Resume Session Found Notification */}
            {hasResumeSession && !isUploading && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900 mt-2">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    ಹಿಂದಿನ ಅಪೂರ್ಣ ಅಪ್‌ಲೋಡ್ ಪತ್ತೆಯಾಗಿದೆ ({resumablePartsCount} ಭಾಗಗಳು ಈಗಾಗಲೇ ಸೇವ್ ಆಗಿದೆ).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleClearResume}
                  className="text-[11px] underline text-blue-700 hover:text-blue-900 ml-2"
                >
                  ರದ್ದುಗೊಳಿಸಿ
                </button>
              </div>
            )}
          </div>

          <div className="space-y-3 text-xs">
            {/* Title */}
            <div>
              <label className="block font-bold text-[#172B4D] mb-1">
                ಪತ್ರಿಕೆಯ ಶೀರ್ಷಿಕೆ (Title) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={uploadTitle}
                onBlur={() => markTouched("title")}
                onChange={(e) => {
                  setUploadTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
                }}
                className={`w-full px-3 py-2 bg-[#F8F9FA] border rounded-lg text-[#172B4D] font-medium transition-colors ${
                  touched.title && errors.title
                    ? "border-red-500 bg-red-50/20 focus:ring-1 focus:ring-red-400"
                    : "border-neutral-300 focus:border-[#172B4D]"
                }`}
              />
              {touched.title && errors.title && (
                <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  <span>{errors.title}</span>
                </p>
              )}
            </div>

            {/* Year & Month */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#172B4D] mb-1">
                  ವರ್ಷ (Year) <span className="text-red-500">*</span>
                </label>
                <select
                  value={uploadYear}
                  onChange={(e) => handleYearChange(Number(e.target.value))}
                  className={`w-full px-3 py-2 bg-[#F8F9FA] border rounded-lg text-[#172B4D] ${
                    touched.year && errors.year ? "border-red-500" : "border-neutral-300"
                  }`}
                >
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                  <option value={2023}>2023</option>
                </select>
                {touched.year && errors.year && (
                  <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.year}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-[#172B4D] mb-1">
                  ತಿಂಗಳು (Month) <span className="text-red-500">*</span>
                </label>
                <select
                  value={uploadMonth}
                  onChange={(e) => handleMonthChange(Number(e.target.value))}
                  className={`w-full px-3 py-2 bg-[#F8F9FA] border rounded-lg text-[#172B4D] ${
                    touched.month && errors.month ? "border-red-500" : "border-neutral-300"
                  }`}
                >
                  {Object.entries(KANNADA_MONTH_MAP).map(([num, name]) => (
                    <option key={num} value={num}>
                      {num} - {name}
                    </option>
                  ))}
                </select>
                {touched.month && errors.month && (
                  <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.month}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Edition & Language */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#172B4D] mb-1">
                  ಆವೃತ್ತಿ (Edition) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadEditionArea}
                  onBlur={() => markTouched("editionArea")}
                  onChange={(e) => {
                    setUploadEditionArea(e.target.value);
                    if (errors.editionArea)
                      setErrors((prev) => ({ ...prev, editionArea: undefined }));
                  }}
                  placeholder="ರಾಜ್ಯ ಆವೃತ್ತಿ / ಮಂಗಳೂರು"
                  className={`w-full px-3 py-2 bg-[#F8F9FA] border rounded-lg text-[#172B4D] ${
                    touched.editionArea && errors.editionArea
                      ? "border-red-500 bg-red-50/20"
                      : "border-neutral-300"
                  }`}
                />
                {touched.editionArea && errors.editionArea && (
                  <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.editionArea}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-[#172B4D] mb-1">
                  ಭಾಷೆ (Language) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadLanguage}
                  onBlur={() => markTouched("language")}
                  onChange={(e) => {
                    setUploadLanguage(e.target.value);
                    if (errors.language)
                      setErrors((prev) => ({ ...prev, language: undefined }));
                  }}
                  className={`w-full px-3 py-2 bg-[#F8F9FA] border rounded-lg text-[#172B4D] ${
                    touched.language && errors.language
                      ? "border-red-500 bg-red-50/20"
                      : "border-neutral-300"
                  }`}
                />
                {touched.language && errors.language && (
                  <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.language}</span>
                  </p>
                )}
              </div>
            </div>

            {/* File Name & Pages */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-[#172B4D] mb-1">
                  PDF ಫೈಲ್ ಹೆಸರು <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={uploadFileName}
                  onBlur={() => markTouched("fileName")}
                  onChange={(e) => {
                    setUploadFileName(e.target.value);
                    if (errors.fileName)
                      setErrors((prev) => ({ ...prev, fileName: undefined }));
                  }}
                  className={`w-full px-3 py-2 bg-[#F8F9FA] border rounded-lg text-[#172B4D] font-mono ${
                    touched.fileName && errors.fileName
                      ? "border-red-500 bg-red-50/20"
                      : "border-neutral-300"
                  }`}
                />
                {touched.fileName && errors.fileName && (
                  <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.fileName}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block font-bold text-[#172B4D] mb-1">
                  ಒಟ್ಟು ಪುಟಗಳು <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min={1}
                  value={uploadTotalPages}
                  onBlur={() => markTouched("totalPages")}
                  onChange={(e) => {
                    setUploadTotalPages(Number(e.target.value));
                    if (errors.totalPages)
                      setErrors((prev) => ({ ...prev, totalPages: undefined }));
                  }}
                  className={`w-full px-3 py-2 bg-[#F8F9FA] border rounded-lg text-[#172B4D] ${
                    touched.totalPages && errors.totalPages
                      ? "border-red-500 bg-red-50/20"
                      : "border-neutral-300"
                  }`}
                />
                {touched.totalPages && errors.totalPages && (
                  <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.totalPages}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block font-bold text-[#172B4D] mb-1">ಸ್ಥಿತಿ (Status)</label>
              <select
                value={uploadStatus}
                onChange={(e) => setUploadStatus(e.target.value as "published" | "draft")}
                className="w-full px-3 py-2 bg-[#F8F9FA] border border-neutral-300 rounded-lg text-[#172B4D]"
              >
                <option value="published">published (ಓದುಗರಿಗೆ ಪ್ರಕಟಿತ)</option>
                <option value="draft">draft (ಕರಡು)</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block font-bold text-[#172B4D] mb-1">ವಿವರಣೆ (Description)</label>
              <textarea
                rows={2}
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8F9FA] border border-neutral-300 rounded-lg text-[#172B4D]"
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="pt-3 space-y-2">
              {/* PRIMARY: Automatic R2 Upload with Chunks & Auto-JSON */}
              <button
                type="button"
                onClick={handleAutoUpload}
                disabled={isUploading}
                className={`w-full py-3.5 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm ${
                  isUploading
                    ? "bg-neutral-500 cursor-not-allowed"
                    : "bg-[#C62828] hover:bg-[#B71C1C] cursor-pointer"
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ... (Uploading...)</span>
                  </>
                ) : hasResumeSession ? (
                  <>
                    <RotateCcw className="w-5 h-5" />
                    <span>ಅಪ್‌ಲೋಡ್ ಮುಂದುವರಿಸಿ (Resume Upload from Part {resumablePartsCount + 1})</span>
                  </>
                ) : (
                  <>
                    <CloudUpload className="w-5 h-5" />
                    <span>Cloudflare R2 ಗೆ ಸ್ವಯಂಚಾಲಿತ ಅಪ್‌ಲೋಡ್ (PDF & JSON)</span>
                  </>
                )}
              </button>

              {/* CANCEL UPLOAD BUTTON (VISIBLE WHEN UPLOADING) */}
              {isUploading && (
                <button
                  type="button"
                  onClick={handleCancelUpload}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-[#C62828] border border-red-300 font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <XCircle className="w-4 h-4" />
                  <span>ಅಪ್‌ಲೋಡ್ ರದ್ದುಗೊಳಿಸಿ (Cancel Upload)</span>
                </button>
              )}

              {/* SECONDARY: Instant Local Preview */}
              <button
                type="button"
                onClick={handleSaveToPreview}
                disabled={isUploading}
                className="w-full py-2.5 bg-[#172B4D] hover:bg-[#0F1C33] text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <Save className="w-4 h-4" />
                <span>ಸ್ಥಳೀಯ ಮುನ್ನೋಟಕ್ಕೆ ಸೇರಿಸಿ & ವಾಚಕದಲ್ಲಿ ಪರೀಕ್ಷಿಸಿ</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: R2 Upload Destination & JSON Catalogue Output */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 sm:p-6 flex flex-col justify-between space-y-4">
          <div className="border-b border-[#E2E8F0] pb-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-[#172B4D] flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-[#C62828]" />
                  <span>R2 ಗಮ್ಯಸ್ಥಾನ & ಸ್ವಯಂಚಾಲಿತ ಕ್ಯಾಟಲಾಗ್</span>
                </h3>
                <p className="text-xs text-[#5A6A85] mt-0.5">
                  ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಆದಾಗ ಈ JSON ಕ್ಯಾಟಲಾಗ್ ಸ್ವಯಂಚಾಲಿತವಾಗಿ R2 ಗೆ ರವಾನೆಯಾಗುತ್ತದೆ.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopyJson}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedCode ? "ಕಾಪಿಯಾಗಿದೆ!" : "ಕಾಪಿ"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadJson}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-[#172B4D] text-xs font-bold rounded-lg transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>JSON ಡೌನ್‌ಲೋಡ್</span>
                </button>
              </div>
            </div>
          </div>

          {/* R2 Upload Path Highlights */}
          <div className="bg-neutral-900 rounded-xl p-3.5 text-xs font-mono space-y-2 text-neutral-300">
            <div className="text-neutral-400 font-sans font-bold flex items-center gap-1.5">
              <FolderTree className="w-4 h-4 text-amber-400" />
              <span>R2 ಬಕೆಟ್‌ನಲ್ಲಿ PDF ಅಪ್‌ಲೋಡ್ ಮಾರ್ಗ (Target Path):</span>
            </div>
            <div className="p-2 bg-neutral-950 rounded-lg text-amber-300 break-all border border-neutral-800">
              newspapers/{uploadYear}/{currentMonthFolder}/{uploadFileName}
            </div>

            <div className="text-neutral-400 font-sans font-bold flex items-center gap-1.5 pt-1">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>ಸ್ವಯಂ ನವೀಕರಣಗೊಳ್ಳುವ ಕ್ಯಾಟಲಾಗ್ (Catalogue Path):</span>
            </div>
            <div className="p-2 bg-neutral-950 rounded-lg text-sky-300 break-all border border-neutral-800">
              data/newspapers.json
            </div>

            <div className="text-neutral-400 font-sans font-bold pt-1">ನೇರ ಸಾರ್ವಜನಿಕ URL:</div>
            <div className="p-2 bg-neutral-950 rounded-lg text-emerald-400 break-all border border-neutral-800">
              {currentPdfUrl}
            </div>
          </div>

          {/* Code Container */}
          <div className="flex-1 bg-neutral-950 text-emerald-400 p-3.5 rounded-xl font-mono text-xs overflow-auto max-h-[260px] border border-neutral-800 shadow-inner">
            <pre>{jsonCatalogueString}</pre>
          </div>

          {/* Quick Resumable Feature Notes */}
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl text-xs text-[#172B4D] space-y-1.5">
            <p className="font-bold flex items-center gap-1 text-[#172B4D]">
              <HelpCircle className="w-4 h-4 text-[#C62828]" />
              <span>ಸ್ವಯಂಚಾಲಿತ ಅಪ್‌ಲೋಡ್ & ದೃಢೀಕರಣ:</span>
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[#5A6A85]">
              <li>
                <strong>ಫಾರ್ಮ್ ದೃಢೀಕರಣ (Validation):</strong> ಕಡ್ಡಾಯ ವಿವರಗಳನ್ನು ತಪ್ಪಾಗಿ ಅಥವಾ ಅಪೂರ್ಣವಾಗಿ ನಮೂದಿಸಿದರೆ ಸ್ಪಷ್ಟ ದೋಷ ಸಂದೇಶ ತೋರಿಸುತ್ತದೆ.
              </li>
              <li>
                <strong>ಆಟೋ JSON ಅಪ್‌ಲೋಡ್:</strong> PDF ಅಪ್‌ಲೋಡ್ ಆದ ತಕ್ಷಣ <code>data/newspapers.json</code> ಫೈಲ್ ತಂತಾನೇ ನವೀಕರಣಗೊಂಡು R2 ಗೆ ಸೇರುತ್ತದೆ.
              </li>
              <li>
                <strong>ಚಂಕ್ & ರೆಸ್ಯೂಮ್:</strong> ದೊಡ್ಡ PDF ಫೈಲ್‌ಗಳು 5MB ತುಂಡುಗಳಾಗಿ ಹೋಗುತ್ತವೆ. ನೆಟ್‌ವರ್ಕ್ ಸಮಸ್ಯೆ ಬಂದರೂ ಮೊದಲಿನಿಂದ ಪ್ರಾರಂಭವಾಗುವುದಿಲ್ಲ; ನಿಂತಿದ್ದಲ್ಲಿಂದಲೇ ಮುಂದುವರಿಯುತ್ತದೆ.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
