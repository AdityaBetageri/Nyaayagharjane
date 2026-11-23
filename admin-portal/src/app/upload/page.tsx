"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  BookOpen,
  CheckCircle2,
  ExternalLink,
  Save,
  FileText,
  AlertCircle,
  ShieldCheck,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { CloudUploadIcon } from "@/components/icons/CloudUploadIcon";
import { addStoredEdition } from "@/lib/editionsStore";
import {
  getR2PublicUrl,
  getR2MonthFolder,
  generateR2PdfUrl,
  r2ItemToEdition,
  KANNADA_MONTH_MAP,
} from "@/lib/r2Service";
import { ConfirmationModal } from "@/components/admin/ConfirmationModal";
import {
  uploadNewspaperWithChunks,
  UploadProgress,
  getSavedUploadSession,
} from "@/lib/chunkUploader";
import { R2NewspaperItem } from "@/types/r2";
import FileUploadProgressBar from "@/components/admin/FileUploadProgressBar";
import { getAdminIdToken } from "@/lib/firebase";
import {
  isWorkerConfigured,
  requestPresignedUploadUrl,
  uploadPdfToR2PresignedUrl,
  completeUploadViaWorker,
} from "@/lib/workerClient";

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
  const [r2Configured, setR2Configured] = useState<boolean | null>(null);

  // Form Fields
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadYear, setUploadYear] = useState(2026);
  const [uploadMonth, setUploadMonth] = useState(11);
  const [uploadEditionArea, setUploadEditionArea] = useState("ರಾಜ್ಯ ಆವೃತ್ತಿ");
  const [uploadLanguage, setUploadLanguage] = useState("Kannada");
  const [uploadFileName, setUploadFileName] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"published" | "draft">("published");
  const [uploadTotalPages, setUploadTotalPages] = useState<string>("16");
  const [uploadFileSize, setUploadFileSize] = useState("");
  const [uploadDescription, setUploadDescription] = useState("");
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
  const [showClearModal, setShowClearModal] = useState<boolean>(false);
  const [publishedDate] = useState(() => new Date().toISOString().split("T")[0]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isPausedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
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

  // Clear all form data
  const clearFormData = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setUploadTitle("");
    setUploadFileName("");
    setUploadFileSize("");
    setUploadDescription("");
    setUploadTotalPages("");
    setTouched({});
    setErrors({});
    setUploadProgress(null);
  };

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
      newErrors.fileName = "ಫೈಲ್ ಹೆಸರು .pdf ನೊಂದಿಗೆ ಕೊನೆಗೊಳ್ಳಬೇಕು (ಉದಾ: newspaper.pdf).";
    } else if (/[/\\?%*:|"<> ]/g.test(cleanFileName)) {
      newErrors.fileName = "ಫೈಲ್ ಹೆಸರಿನಲ್ಲಿ ಅಮಾನ್ಯ ಅಕ್ಷರಗಳು ಅಥವಾ ಖಾಲಿ ಜಾಗವಿರಬಾರದು (ಕೇವಲ ಅಕ್ಷರ, ಅಂಕಿ, ಡ್ಯಾಶ್ ಬಳಸಿ).";
    }

    // 8. Total Pages
    const trimmedPages = uploadTotalPages.trim();
    const parsedPages = Number(trimmedPages);
    if (!trimmedPages || isNaN(parsedPages) || parsedPages < 1) {
      newErrors.totalPages = "ಒಟ್ಟು ಪುಟಗಳು ಕಡ್ಡಾಯವಾಗಿದೆ (ಕನಿಷ್ಠ ೧ ಪುಟ).";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Field change helper with validation
  const handleFieldChange = (field: keyof FormErrors, value: unknown) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    switch (field) {
      case "title":
        setUploadTitle(String(value));
        break;
      case "year":
        setUploadYear(Number(value));
        break;
      case "month":
        setUploadMonth(Number(value));
        break;
      case "editionArea":
        setUploadEditionArea(String(value));
        break;
      case "language":
        setUploadLanguage(String(value));
        break;
      case "fileName":
        setUploadFileName(String(value));
        break;
      case "totalPages": {
        const rawDigits = String(value).replace(/\D/g, "");
        const cleanVal = rawDigits.replace(/^0+/, "");
        setUploadTotalPages(cleanVal);
        if (cleanVal) {
          setErrors((prev) => ({ ...prev, totalPages: undefined }));
        }
        break;
      }
    }
  };

  // PDF File Selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setUploadError("ಆಯ್ಕೆಮಾಡಿದ ಫೈಲ್ PDF ಮಾದರಿಯದ್ದಾಗಿಲ್ಲ. ದಯವಿಟ್ಟು .pdf ಫೈಲ್ ಮಾತ್ರ ಆಯ್ಕೆಮಾಡಿ.");
        setSelectedFile(null);
        setErrors((prev) => ({
          ...prev,
          file: "ದಯವಿಟ್ಟು ಕೇವಲ PDF (.pdf) ಫೈಲ್ ಮಾತ್ರ ಆಯ್ಕೆಮಾಡಿ.",
        }));
        setTouched((prev) => ({ ...prev, file: true }));
        return;
      }

      setSelectedFile(file);
      const safeName = file.name.replace(/\s+/g, "-");
      setUploadFileName(safeName);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setUploadFileSize(`${sizeMB} MB`);
      setUploadError(null);
      setErrors((prev) => ({ ...prev, file: undefined, fileName: undefined }));
      setTouched((prev) => ({ ...prev, file: true }));

      // Auto-suggest title if empty
      if (!uploadTitle.trim()) {
        const monthName = KANNADA_MONTH_MAP[uploadMonth] || "";
        setUploadTitle(`ನ್ಯಾಯಘರ್ಜನೆ - ${monthName} ${uploadYear}`);
      }
    }
  };

  // Calculate R2 paths
  const currentMonthFolder = getR2MonthFolder(uploadMonth);
  const currentPdfUrl = generateR2PdfUrl(uploadYear, uploadMonth, uploadFileName || "newspaper.pdf", r2Url);
  const targetKey = `newspapers/${uploadYear}/${currentMonthFolder}/${uploadFileName || "newspaper.pdf"}`;

  // Derived resumable session info
  const resumeSession =
    selectedFile && sessionKeyVersion >= 0
      ? getSavedUploadSession(selectedFile, targetKey)
      : null;
  const hasResumeSession = Boolean(resumeSession && resumeSession.completedParts.length > 0);
  const resumablePartsCount = resumeSession ? resumeSession.completedParts.length : 0;

  // Generate a distinct unique ID so multiple uploads in the same month don't overwrite each other
  const cleanNameSlug = (uploadFileName || "edition")
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 10)
    .toLowerCase();
  const dateDayPart = publishedDate ? publishedDate.replace(/[^0-9]/g, "").slice(6, 8) : "";
  const uniqueUploadId = `news-${uploadYear}-${String(uploadMonth).padStart(2, "0")}${dateDayPart ? `-${dateDayPart}` : ""}${cleanNameSlug ? `-${cleanNameSlug}` : ""}`;

  const currentItemRecord: R2NewspaperItem = {
    id: uniqueUploadId,
    title: uploadTitle.trim(),
    language: uploadLanguage.trim(),
    edition: uploadEditionArea.trim(),
    month: uploadMonth,
    year: uploadYear,
    fileName: (uploadFileName || "newspaper.pdf").trim(),
    pdfUrl: currentPdfUrl,
    publishedAt: new Date().toISOString(),
    status: uploadStatus,
    totalPages: Number(uploadTotalPages) || 16,
    formattedFileSize: uploadFileSize.trim() || "12.4 MB",
    description: uploadDescription.trim() || "ನ್ಯಾಯಘರ್ಜನೆ ಅಧಿಕೃತ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ. ಸತ್ಯದ ಧ್ವನಿ, ನ್ಯಾಯದ ಘರ್ಜನೆ.",
  };

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

  // 1. Automatic Upload Handler (Worker Presigned Direct-to-R2 or S3 Chunked Fallback)
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

    // Check if Cloudflare Worker Gateway is active
    if (isWorkerConfigured()) {
      try {
        const idToken = await getAdminIdToken();
        if (!idToken) {
          throw new Error("ಸುರಕ್ಷಿತ ಅಪ್‌ಲೋಡ್‌ಗಾಗಿ ನಿರ್ವಾಹಕರ ಲಾಗಿನ್ ಅಗತ್ಯವಿದೆ (Admin login required). ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಆಗಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.");
        }

        // Step 1: Request Presigned URL from Worker Gateway
        setUploadProgress({
          stage: "initializing",
          percent: 5,
          currentPart: 1,
          totalParts: 1,
          uploadedBytes: 0,
          totalBytes: selectedFile.size,
          statusMessage: "Acquiring secure upload link...",
          error: null,
        });

        const presigned = await requestPresignedUploadUrl(
          {
            filename: selectedFile.name,
            fileSizeBytes: selectedFile.size,
            year: Number(uploadYear),
            month: Number(uploadMonth),
            editionArea: uploadEditionArea,
          },
          idToken
        );

        // Step 2: Upload Directly from Browser to Cloudflare R2
        setUploadProgress({
          stage: "uploading_pdf",
          percent: 10,
          currentPart: 1,
          totalParts: 1,
          uploadedBytes: 0,
          totalBytes: selectedFile.size,
          statusMessage: "Uploading PDF directly to cloud storage...",
          error: null,
        });

        await uploadPdfToR2PresignedUrl(
          presigned.uploadUrl,
          selectedFile,
          (percent: number) => {
            const mappedPercent = 10 + Math.round((percent / 100) * 85);
            setUploadProgress({
              stage: "uploading_pdf",
              percent: mappedPercent,
              currentPart: 1,
              totalParts: 1,
              uploadedBytes: Math.round((percent / 100) * selectedFile.size),
              totalBytes: selectedFile.size,
              statusMessage: `Uploading (${percent}%)...`,
              error: null,
            });
          }
        );

        // Step 3: Complete Upload & Atomically Update Catalogue in R2
        setUploadProgress({
          stage: "updating_catalogue",
          percent: 96,
          currentPart: 1,
          totalParts: 1,
          uploadedBytes: selectedFile.size,
          totalBytes: selectedFile.size,
          statusMessage: "Updating catalogue and verifying publication...",
          error: null,
        });

        const calculatedTitle = uploadTitle.trim() || currentItemRecord.title || `ನ್ಯಾಯ ಘರ್ಜನೆ — ${uploadYear}-${String(uploadMonth).padStart(2, "0")}`;

        const completeResult = await completeUploadViaWorker(
          {
            objectKey: presigned.objectKey,
            title: calculatedTitle,
            year: Number(uploadYear),
            month: Number(uploadMonth),
            editionArea: uploadEditionArea,
            language: uploadLanguage,
            totalPages: Number(uploadTotalPages) || 16,
            formattedFileSize: uploadFileSize.trim() || `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
            status: uploadStatus,
            description: uploadDescription.trim(),
          },
          idToken
        );

        setUploadProgress({
          stage: "completed",
          percent: 100,
          currentPart: 1,
          totalParts: 1,
          uploadedBytes: selectedFile.size,
          totalBytes: selectedFile.size,
          statusMessage: "Upload completed successfully!",
          error: null,
        });

        // Add to local storage for immediate preview in reader
        const newEd = r2ItemToEdition((completeResult.item as unknown as R2NewspaperItem) || currentItemRecord);
        addStoredEdition(newEd);
        setLastUploadedId(newEd.id);
        setSuccessNotice(
          `"${newEd.title}" uploaded and published successfully! Click "View in Reader" below to preview.`
        );
        setSessionKeyVersion((v) => v + 1);

        clearFormData();
        return;
      } catch (err: unknown) {
        console.error("Worker presigned upload error:", err);
        const msg = err instanceof Error ? err.message : "Upload failed.";
        setUploadError(msg);
        setIsUploading(false);
        return;
      }
    }

    // Fallback: S3 Chunked Uploader
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const result = await uploadNewspaperWithChunks({
        file: selectedFile,
        itemRecord: currentItemRecord,
        targetKey,
        onProgress: (p: UploadProgress) => {
          setUploadProgress(p);
        },
        shouldPause: () => isPausedRef.current,
        signal: controller.signal,
      });

      if (result.success) {
        const newEd = r2ItemToEdition(currentItemRecord);
        addStoredEdition(newEd);
        setLastUploadedId(newEd.id);
        setSuccessNotice(
          `"${newEd.title}" uploaded successfully to database! Click "View in Reader" below to preview.`
        );
        setSessionKeyVersion((v) => v + 1);
        clearFormData();
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") {
        setUploadError("Upload cancelled.");
      } else {
        const msg =
          err instanceof Error
            ? err.message
            : "Upload failed. Please check network and try again.";
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
    setUploadError("Upload was cancelled.");
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

    // Clear form data
    clearFormData();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="bg-white p-5 sm:p-6 rounded-lg border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-[#172B4D]">
              ಹೊಸ ಪತ್ರಿಕೆ ಅಪ್‌ಲೋಡ್ 
            </h1>
            
            {r2Configured === true && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ಡೇಟಾಬೇಸ್ ಸಂಪರ್ಕಗೊಂಡಿದೆ</span>
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#5A6A85] mt-1">
            PDF ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ ವಿವರಗಳನ್ನು ನಮೂದಿಸಿ &ldquo;ಪತ್ರಿಕೆ ಪ್ರಕಟಗೊಳಿಸಿ&rdquo; ಕ್ಲಿಕ್ ಮಾಡಿ. ಫೈಲ್ ಮತ್ತು ಕ್ಯಾಟಲಾಗ್ ನೇರವಾಗಿ ಡೇಟಾಬೇಸ್‌ಗೆ ಸೇರ್ಪಡೆಗೊಳ್ಳುತ್ತವೆ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedFile && (
            <button
              type="button"
              onClick={() => setShowClearModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold rounded-lg transition-colors cursor-pointer"
              title="ಫಾರ್ಮ್ ತೆರವುಗೊಳಿಸಿ"
            >
              <Trash2 className="w-4 h-4 text-neutral-500" />
              <span>ತೆರವುಗೊಳಿಸಿ</span>
            </button>
          )}

          <Link
            href="/papers"
            className="inline-flex items-center gap-1 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-[#172B4D] text-xs font-bold rounded-lg transition-colors shrink-0"
          >
            <FileText className="w-4 h-4" />
            <span>ಪತ್ರಿಕೆಗಳ ಪಟ್ಟಿ ನೋಡಿ</span>
          </Link>
        </div>
      </div>

      {/* Offline/Fallback Notice if storage is not yet connected */}
      {r2Configured === false && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between gap-3 text-blue-950 text-xs">
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
        <div className="p-4 sm:p-5 bg-emerald-50 border-2 border-emerald-400 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-emerald-950 animate-in fade-in duration-300">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-black text-sm sm:text-base">ಸಂಚಿಕೆ ಯಶಸ್ವಿಯಾಗಿ ಪ್ರಕಟಗೊಂಡಿದೆ!</h4>
              <p className="text-xs text-emerald-800 mt-0.5">{successNotice}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {lastUploadedId && (
              <a
                href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://www.nyaayagharjane.com"}/reader/${lastUploadedId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>ವಾಚಕದಲ್ಲಿ ನೋಡಿ (Test in Reader)</span>
              </a>
            )}
            <a
              href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://www.nyaayagharjane.com"}/latest`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-2 bg-white text-emerald-900 border border-emerald-300 hover:bg-emerald-100 text-xs font-bold rounded-lg transition-colors"
            >
              <span>ಇತ್ತೀಚಿನ ಪುಟ</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Upload Error Banner */}
      {uploadError && (
        <div className="p-4 bg-red-50 border-2 border-red-300 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-red-950 text-xs">
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

      {/* When Uploading: HIDE FORM and ONLY show FileUploadProgressBar */}
      {isUploading ? (
        <FileUploadProgressBar
          fileName={selectedFile?.name || uploadFileName || "newspaper.pdf"}
          fileSize={selectedFile?.size || 0}
          progress={uploadProgress?.percent ?? 0}
          statusMessage={uploadProgress?.statusMessage || "ಪತ್ರಿಕೆ ಪ್ರಕಟಗೊಳ್ಳುತ್ತಿದೆ..."}
          currentPart={uploadProgress?.currentPart}
          totalParts={uploadProgress?.totalParts}
          uploadedBytes={uploadProgress?.uploadedBytes}
          totalBytes={uploadProgress?.totalBytes}
          isFailed={!!uploadError}
          errorMessage={uploadError}
          onCancel={handleCancelUpload}
          onRetry={handleAutoUpload}
        />
      ) : (
        /* Main Clean Upload Form (Visible when not uploading) */
        <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-xs p-6 sm:p-8 space-y-6">
          <div className="border-b border-[#E2E8F0] pb-4">
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

        {/* 1. PDF File Picker */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-[#172B4D]">
            ಪತ್ರಿಕೆ PDF ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ <span className="text-red-500">*</span>
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-6 sm:p-8 text-center cursor-pointer transition-all ${
              touched.file && errors.file
                ? "border-red-400 bg-red-50/30"
                : selectedFile
                ? "border-emerald-400 bg-emerald-50/40"
                : "border-neutral-300 hover:border-[#C62828] bg-neutral-50/50 hover:bg-neutral-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div className="flex flex-col items-center justify-center gap-2">
              {selectedFile ? (
                <>
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-7 h-7" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-emerald-900 break-all">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-emerald-700 mt-0.5">
                      ಗಾತ್ರ: {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB • PDF ಆಯ್ಕೆಯಾಗಿದೆ
                    </p>
                  </div>
                  <span className="text-[11px] font-bold text-neutral-500 underline mt-1">
                    ಬೇರೆ ಫೈಲ್ ಬದಲಾಯಿಸಲು ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ
                  </span>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-[#C62828]">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#172B4D]">
                      PDF ಫೈಲ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ
                    </p>
                    <p className="text-xs text-[#5A6A85] mt-0.5">
                      ಕೇವಲ .pdf ಫೈಲ್‌ಗಳನ್ನು ಮಾತ್ರ ಬೆಂಬಲಿಸುತ್ತದೆ (ಗರಿಷ್ಠ 200MB)
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {touched.file && errors.file && (
            <p className="text-xs font-semibold text-red-600 flex items-center gap-1 mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.file}</span>
            </p>
          )}
        </div>

        {/* 2. Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="block font-bold text-[#172B4D] mb-1">
              ಪತ್ರಿಕೆಯ ಶೀರ್ಷಿಕೆ (Title) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={uploadTitle}
              placeholder="ಉದಾ: ನ್ಯಾಯಘರ್ಜನೆ - ನವೆಂಬರ್ ೨೦೨೬"
              onChange={(e) => handleFieldChange("title", e.target.value)}
              className={`w-full px-3.5 py-2.5 bg-[#F8F9FA] border rounded-lg text-[#172B4D] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C62828] ${
                touched.title && errors.title ? "border-red-400 bg-red-50/20" : "border-neutral-300"
              }`}
            />
            {touched.title && errors.title && (
              <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.title}</span>
              </p>
            )}
          </div>

          {/* Year */}
          <div>
            <label className="block font-bold text-[#172B4D] mb-1">
              ವರ್ಷ (Year) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={uploadYear}
              onChange={(e) => handleFieldChange("year", e.target.value)}
              min={2020}
              max={2035}
              className={`w-full px-3.5 py-2.5 bg-[#F8F9FA] border rounded-lg text-[#172B4D] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C62828] ${
                touched.year && errors.year ? "border-red-400 bg-red-50/20" : "border-neutral-300"
              }`}
            />
            {touched.year && errors.year && (
              <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.year}</span>
              </p>
            )}
          </div>

          {/* Month */}
          <div>
            <label className="block font-bold text-[#172B4D] mb-1">
              ತಿಂಗಳು (Month) <span className="text-red-500">*</span>
            </label>
            <select
              value={uploadMonth}
              onChange={(e) => handleFieldChange("month", e.target.value)}
              className={`w-full px-3.5 py-2.5 bg-[#F8F9FA] border rounded-lg text-[#172B4D] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C62828] ${
                touched.month && errors.month ? "border-red-400 bg-red-50/20" : "border-neutral-300"
              }`}
            >
              <option value={1}>ಜನವರಿ (1 - January)</option>
              <option value={2}>ಫೆಬ್ರವರಿ (2 - February)</option>
              <option value={3}>ಮಾರ್ಚ್ (3 - March)</option>
              <option value={4}>ಏಪ್ರಿಲ್ (4 - April)</option>
              <option value={5}>ಮೇ (5 - May)</option>
              <option value={6}>ಜೂನ್ (6 - June)</option>
              <option value={7}>ಜುಲೈ (7 - July)</option>
              <option value={8}>ಆಗಸ್ಟ್ (8 - August)</option>
              <option value={9}>ಸೆಪ್ಟೆಂಬರ್ (9 - September)</option>
              <option value={10}>ಅಕ್ಟೋಬರ್ (10 - October)</option>
              <option value={11}>ನವೆಂಬರ್ (11 - November)</option>
              <option value={12}>ಡಿಸೆಂಬರ್ (12 - December)</option>
            </select>
            {touched.month && errors.month && (
              <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.month}</span>
              </p>
            )}
          </div>

          {/* Edition Area */}
          <div>
            <label className="block font-bold text-[#172B4D] mb-1">
              ಆವೃತ್ತಿ (Edition) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={uploadEditionArea}
              onChange={(e) => handleFieldChange("editionArea", e.target.value)}
              placeholder="ಉದಾ: ರಾಜ್ಯ ಆವೃತ್ತಿ / ಜಿಲ್ಲಾ ಆವೃತ್ತಿ"
              className={`w-full px-3.5 py-2.5 bg-[#F8F9FA] border rounded-lg text-[#172B4D] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C62828] ${
                touched.editionArea && errors.editionArea
                  ? "border-red-400 bg-red-50/20"
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

          {/* Language */}
          <div>
            <label className="block font-bold text-[#172B4D] mb-1">
              ಭಾಷೆ (Language) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={uploadLanguage}
              onChange={(e) => handleFieldChange("language", e.target.value)}
              className={`w-full px-3.5 py-2.5 bg-[#F8F9FA] border rounded-lg text-[#172B4D] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C62828] ${
                touched.language && errors.language ? "border-red-400 bg-red-50/20" : "border-neutral-300"
              }`}
            />
            {touched.language && errors.language && (
              <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.language}</span>
              </p>
            )}
          </div>

          {/* Target File Name */}
          <div>
            <label className="block font-bold text-[#172B4D] mb-1">
              PDF ಫೈಲ್ ಹೆಸರು (Target File Name) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={uploadFileName}
              placeholder="ಉದಾ: newspaper.pdf"
              onChange={(e) => handleFieldChange("fileName", e.target.value)}
              className={`w-full px-3.5 py-2.5 bg-[#F8F9FA] border rounded-lg text-[#172B4D] text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-[#C62828] ${
                touched.fileName && errors.fileName ? "border-red-400 bg-red-50/20" : "border-neutral-300"
              }`}
            />
            {touched.fileName && errors.fileName && (
              <p className="text-[11px] font-semibold text-red-600 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.fileName}</span>
              </p>
            )}
          </div>

          {/* Total Pages */}
          <div>
            <label className="block font-bold text-[#172B4D] mb-1">
              ಒಟ್ಟು ಪುಟಗಳು (Total Pages) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={uploadTotalPages}
              onChange={(e) => handleFieldChange("totalPages", e.target.value)}
              onBlur={() => {
                setTouched((prev) => ({ ...prev, totalPages: true }));
                if (!uploadTotalPages.trim() || Number(uploadTotalPages) < 1) {
                  setErrors((prev) => ({
                    ...prev,
                    totalPages: "ಒಟ್ಟು ಪುಟಗಳು ಕಡ್ಡಾಯವಾಗಿದೆ (ಕನಿಷ್ಠ ೧ ಪುಟ).",
                  }));
                }
              }}
              placeholder="ಉದಾ: 16"
              className={`w-full px-3.5 py-2.5 bg-[#F8F9FA] border rounded-lg text-[#172B4D] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C62828] ${
                touched.totalPages && errors.totalPages
                  ? "border-red-400 bg-red-50/20"
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

          {/* Status */}
          <div className="md:col-span-2">
            <label className="block font-bold text-[#172B4D] mb-1">ಸ್ಥಿತಿ (Publication Status)</label>
            <select
              value={uploadStatus}
              onChange={(e) => setUploadStatus(e.target.value as "published" | "draft")}
              className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-neutral-300 rounded-lg text-[#172B4D] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C62828]"
            >
              <option value="published">published (ಓದುಗರಿಗೆ ನೇರವಾಗಿ ಪ್ರಕಟಿಸು)</option>
              <option value="draft">draft (ಕರಡು ರೂಪದಲ್ಲಿ ಉಳಿಸು)</option>
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block font-bold text-[#172B4D] mb-1">ವಿವರಣೆ (Description)</label>
            <textarea
              rows={2}
              value={uploadDescription}
              placeholder="ನ್ಯಾಯಘರ್ಜನೆ ಅಧಿಕೃತ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ. ಸತ್ಯದ ಧ್ವನಿ, ನ್ಯಾಯದ ಘರ್ಜನೆ."
              onChange={(e) => setUploadDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#F8F9FA] border border-neutral-300 rounded-lg text-[#172B4D] text-sm focus:outline-hidden focus:ring-2 focus:ring-[#C62828]"
            />
          </div>
        </div>

        {/* 3. Action Buttons */}
        <div className="pt-4 border-t border-[#E2E8F0] space-y-3">
          {/* PRIMARY: Publish Newspaper */}
          <button
            type="button"
            onClick={handleAutoUpload}
            className="w-full py-3.5 px-6 rounded-lg text-white font-black text-sm flex items-center justify-center gap-2 transition-all shadow-md bg-[#C62828] hover:bg-[#B71C1C] cursor-pointer hover:shadow-lg"
          >
            {hasResumeSession ? (
              <>
                <RotateCcw className="w-5 h-5" />
                <span>ಪತ್ರಿಕೆ ಪ್ರಕಟಣೆ ಮುಂದುವರಿಸಿ (ಭಾಗ {resumablePartsCount + 1})</span>
              </>
            ) : (
              <>
                <CloudUploadIcon size={20} />
                <span>ಪತ್ರಿಕೆ ಪ್ರಕಟಗೊಳಿಸಿ</span>
              </>
            )}
          </button>

          {/* SECONDARY: Instant Local Preview */}
          <button
            type="button"
            onClick={handleSaveToPreview}
            className="w-full py-2.5 bg-[#172B4D] hover:bg-[#0F1C33] text-white font-bold rounded-lg transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            <Save className="w-4 h-4" />
            <span>ಸ್ಥಳೀಯ ಮುನ್ನೋಟಕ್ಕೆ ಸೇರಿಸಿ & ವಾಚಕದಲ್ಲಿ ಪರೀಕ್ಷಿಸಿ</span>
          </button>
        </div>
      </div>
    )}

      {/* Custom Form Clear Confirmation Modal */}
      <ConfirmationModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={() => {
          clearFormData();
          setShowClearModal(false);
        }}
        title="Clear Upload Form"
        description="Are you sure you want to clear the selected PDF file and all filled form fields?"
        confirmText="Yes, Clear Form"
        cancelText="Cancel"
        variant="warning"
        iconType="warning"
      />
    </div>
  );
}
