"use client";

import { ThinArcLoader } from "@/components/shared/ThinArcLoader";

export interface PageLoaderProps {
  /** Optional minimal text label (if any). If omitted, only the thin arc spinner is shown */
  label?: string;
  /** Whether to take full viewport height (min-h-screen) or fill parent container (min-h-[350px]) */
  fullScreen?: boolean;
  /** Theme: 'light' (default) or 'dark' */
  theme?: "light" | "dark";
  /** Size of the spinner. Default 'w-14 h-14' (wide, elegant diameter) */
  spinnerClassName?: string;
  /** Custom stroke width. Default 1.15 (ultra-thin hairline) */
  strokeWidth?: number;
  /** Custom additional wrapper className */
  className?: string;
}

/**
 * Minimal, Professional Page Loader:
 * Purely the wide, ultra-thin Arc Spinner with the Yellow & Red brand gradient, centered and clean.
 * No logos or extra text clutter.
 */
export function PageLoader({
  label,
  fullScreen = false,
  theme = "light",
  spinnerClassName = "w-10 h-10",
  strokeWidth = 1.15,
  className = "",
}: PageLoaderProps) {
  const isDark = theme === "dark";

  return (
    <div
      className={`flex flex-col items-center justify-center p-6 text-center select-none animate-in fade-in duration-150 ${
        fullScreen
          ? isDark
            ? "min-h-screen w-full bg-neutral-950"
            : "min-h-screen w-full bg-[#F1F3F5]"
          : "min-h-[320px] w-full flex-1"
      } ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="flex flex-col items-center justify-center space-y-3">
        {/* Wide, ultra-thin arc spinner with Yellow & Red brand colors */}
        <ThinArcLoader className={spinnerClassName} strokeWidth={strokeWidth} />

        {label && (
          <p
            className={`text-xs font-medium tracking-wide ${
              isDark ? "text-neutral-400" : "text-neutral-500"
            }`}
          >
            {label}
          </p>
        )}
      </div>
    </div>
  );
}

export default PageLoader;
