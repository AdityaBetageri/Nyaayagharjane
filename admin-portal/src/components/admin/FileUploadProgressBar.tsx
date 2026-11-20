"use client";

import { FileText, X, RotateCcw, AlertCircle, ShieldCheck } from "lucide-react";
import { ThinArcLoader } from "@/components/shared/ThinArcLoader";

export function getReadableFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export interface FileUploadProgressBarProps {
  fileName: string;
  fileSize: number;
  progress: number;
  statusMessage?: string;
  currentPart?: number;
  totalParts?: number;
  uploadedBytes?: number;
  totalBytes?: number;
  isFailed?: boolean;
  errorMessage?: string | null;
  onCancel: () => void;
  onRetry?: () => void;
}

export default function FileUploadProgressBar({
  fileName,
  fileSize,
  progress,
  statusMessage = "ಪತ್ರಿಕೆ ಪ್ರಕಟಗೊಳ್ಳುತ್ತಿದೆ...",
  currentPart,
  totalParts,
  uploadedBytes,
  totalBytes,
  isFailed = false,
  errorMessage,
  onCancel,
  onRetry,
}: FileUploadProgressBarProps) {
  const safeProgress = Math.min(100, Math.max(0, Math.round(progress)));
  const readableSize = getReadableFileSize(fileSize || totalBytes || 0);
  const uploadedReadable = getReadableFileSize(uploadedBytes || 0);

  return (
    <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-6 sm:p-8 space-y-6 animate-in fade-in zoom-in-95 duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-100 flex items-center justify-center text-[#C62828]">
            {isFailed ? (
              <AlertCircle className="w-5 h-5 text-red-600" />
            ) : (
              <ThinArcLoader className="w-5 h-5" strokeWidth={1.25} />
            )}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-[#172B4D]">
              {isFailed ? "ಅಪ್‌ಲೋಡ್ ವಿಫಲವಾಗಿದೆ" : "ಪತ್ರಿಕೆ ಪ್ರಕಟಗೊಳ್ಳುತ್ತಿದೆ..."}
            </h2>
            <p className="text-xs text-[#5A6A85] mt-0.5">
              ದಯವಿಟ್ಟು ಬ್ರೌಸರ್ ಮುಚ್ಚಬೇಡಿ. ಫೈಲ್ ಮತ್ತು ಕ್ಯಾಟಲಾಗ್ ನೇರವಾಗಿ ಕ್ಲೌಡ್‌ಗೆ ಪ್ರಕಟಗೊಳ್ಳುತ್ತಿದೆ.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isFailed && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ (Retry)</span>
            </button>
          )}

          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-neutral-100 hover:bg-red-50 hover:text-red-600 text-neutral-700 text-xs font-bold rounded-lg transition-colors cursor-pointer border border-neutral-200"
            title="ಅಪ್‌ಲೋಡ್ ರದ್ದುಮಾಡಿ"
          >
            <X className="w-4 h-4" />
            <span>ರದ್ದುಮಾಡಿ</span>
          </button>
        </div>
      </div>

      {/* File Upload Progress Item (Untitled UI Style) */}
      <div
        className={`rounded-lg border p-4 sm:p-5 transition-all ${
          isFailed
            ? "border-red-300 bg-red-50/30"
            : "border-neutral-200 bg-neutral-50/50 hover:bg-neutral-50"
        }`}
      >
        <div className="flex items-start gap-3.5 sm:gap-4">
          {/* File Icon Badge */}
          <div className="w-11 h-11 rounded-lg bg-red-100/80 border border-red-200 flex flex-col items-center justify-center shrink-0 text-[#C62828]">
            <FileText className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-wider leading-none mt-0.5">
              PDF
            </span>
          </div>

          {/* File Meta & Progress Content */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="truncate">
                <p className="text-sm font-bold text-[#172B4D] truncate">{fileName}</p>
                <p className="text-xs text-[#5A6A85] mt-0.5">{readableSize}</p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-sm font-black text-[#172B4D]">{safeProgress}%</span>
              </div>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full bg-neutral-200/80 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isFailed
                    ? "bg-red-500"
                    : safeProgress === 100
                    ? "bg-emerald-500"
                    : "bg-[#C62828]"
                }`}
                style={{ width: `${safeProgress}%` }}
              />
            </div>

            {/* Status & Part Details */}
            <div className="flex items-center justify-between text-[11px] text-[#5A6A85] pt-0.5 flex-wrap gap-1">
              <span className="font-medium">
                {isFailed && errorMessage ? errorMessage : statusMessage}
              </span>

              {totalParts && totalParts > 1 ? (
                <span className="font-mono text-neutral-500">
                  ಭಾಗ {currentPart ?? 1} / {totalParts} ({uploadedReadable} / {readableSize})
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Cloud Guarantee Footer Note */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-lg flex items-center gap-3 text-xs text-emerald-950">
        <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
        <div>
          <p className="font-bold text-emerald-900">ಸ್ವಯಂಚಾಲಿತ ಚಂಕ್ ಅಪ್‌ಲೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ</p>
          <p className="text-emerald-800 text-[11px] mt-0.5">
            ನೆಟ್‌ವರ್ಕ್ ಕಡಿತಗೊಂಡರೂ ಅಪ್‌ಲೋಡ್ ಮೊದಲಿನಿಂದ ಪ್ರಾರಂಭವಾಗುವುದಿಲ್ಲ; ನಿಂತಿದ್ದಲ್ಲಿಂದಲೇ ಮುಂದುವರಿಯುತ್ತದೆ.
          </p>
        </div>
      </div>
    </div>
  );
}
