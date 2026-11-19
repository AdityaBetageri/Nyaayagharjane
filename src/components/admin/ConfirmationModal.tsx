"use client";

import React, { useEffect } from "react";
import { AlertTriangle, Trash2, LogOut, Info, Loader2, X } from "lucide-react";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string | React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  iconType?: "trash" | "warning" | "logout" | "info";
  isLoading?: boolean;
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "ಹೌದು, ದೃಢೀಕರಿಸಿ",
  cancelText = "ರದ್ದುಗೊಳಿಸಿ",
  variant = "danger",
  iconType = "warning",
  isLoading = false,
}: ConfirmationModalProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const renderIcon = () => {
    switch (iconType) {
      case "trash":
        return <Trash2 className="w-6 h-6 text-[#C62828]" />;
      case "logout":
        return <LogOut className="w-6 h-6 text-amber-600" />;
      case "info":
        return <Info className="w-6 h-6 text-blue-600" />;
      case "warning":
      default:
        return <AlertTriangle className="w-6 h-6 text-amber-600" />;
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case "danger":
        return "bg-red-100 text-[#C62828] border-red-200";
      case "warning":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "info":
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getConfirmBtnClasses = () => {
    switch (variant) {
      case "danger":
        return "bg-[#C62828] hover:bg-[#B71C1C] text-white focus:ring-red-500 shadow-xs";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white focus:ring-amber-500 shadow-xs";
      case "info":
      default:
        return "bg-[#172B4D] hover:bg-[#091E42] text-white focus:ring-blue-500 shadow-xs";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-white rounded-lg shadow-2xl border border-neutral-200 overflow-hidden transform transition-all p-6 sm:p-7 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Close Button */}
        {!isLoading && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="ಮುಚ್ಚಿ"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 border ${getIconBg()}`}
          >
            {renderIcon()}
          </div>

          <div className="space-y-1.5 pr-4">
            <h3 className="text-base sm:text-lg font-black text-[#172B4D] leading-snug">
              {title}
            </h3>
            <div className="text-xs sm:text-sm text-[#5A6A85] leading-relaxed">
              {description}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-neutral-100">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-neutral-700 hover:text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer disabled:opacity-50 ${getConfirmBtnClasses()}`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
