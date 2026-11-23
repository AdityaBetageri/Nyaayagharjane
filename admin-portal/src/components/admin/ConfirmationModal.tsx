"use client";

import React, { useEffect } from "react";
import { AlertCircle, AlertTriangle, Info, LogOut, Trash2, X } from "lucide-react";
import { ThinArcLoader } from "@/components/shared/ThinArcLoader";

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
  confirmText = "Confirm",
  cancelText = "Cancel",
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
        return <Trash2 className="w-5 h-5 text-red-600" />;
      case "logout":
        return <LogOut className="w-5 h-5 text-amber-600" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
      case "warning":
      default:
        return <AlertTriangle className="w-5 h-5 text-amber-600" />;
    }
  };

  const getIconContainerStyle = () => {
    switch (variant) {
      case "danger":
        return "bg-red-50 text-red-600 border-red-200";
      case "warning":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "info":
      default:
        return "bg-blue-50 text-blue-600 border-blue-200";
    }
  };

  const getConfirmBtnClasses = () => {
    switch (variant) {
      case "danger":
        return "bg-[#C62828] hover:bg-[#B71C1C] text-white focus:ring-2 focus:ring-red-400 focus:outline-hidden";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white focus:ring-2 focus:ring-amber-400 focus:outline-hidden";
      case "info":
      default:
        return "bg-[#172B4D] hover:bg-[#091E42] text-white focus:ring-2 focus:ring-slate-400 focus:outline-hidden";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-xs transition-opacity"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between gap-4 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${getIconContainerStyle()}`}
            >
              {renderIcon()}
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#172B4D] leading-snug">
              {title}
            </h3>
          </div>

          {!isLoading && (
            <button
              type="button"
              onClick={onClose}
              className="text-neutral-400 hover:text-neutral-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer shrink-0"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Body */}
        <div className="px-6 py-5 text-sm text-[#5A6A85] leading-relaxed">
          {description}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-end gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-neutral-900 bg-white border border-neutral-200 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2 text-xs sm:text-sm font-semibold rounded-lg shadow-xs transition-all cursor-pointer disabled:opacity-50 ${getConfirmBtnClasses()}`}
          >
            {isLoading && <ThinArcLoader className="w-4 h-4" strokeWidth={1.25} />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
