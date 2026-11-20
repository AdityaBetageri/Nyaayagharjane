"use client";

import { useId } from "react";

export interface ThinArcLoaderProps {
  /** Additional CSS classes for width, height, etc. Defaults to 'w-5 h-5' */
  className?: string;
  /** Exact size in pixels (e.g. 16, 20, 24, 48) */
  size?: number;
  /** Stroke width for the thin arc. Default 1.25 for a crisp, ultra-thin look */
  strokeWidth?: number;
  /** Optional text label to display next to the loader */
  label?: string;
  /** Optional label text styling */
  labelClassName?: string;
}

/**
 * Thin Arc Loader with Nyaayagharjane Yellow & Red Brand Colors.
 * Renders an ultra-thin circular arc spinning smoothly.
 */
export function ThinArcLoader({
  className = "w-5 h-5",
  size,
  strokeWidth = 1.25,
  label,
  labelClassName = "text-xs text-neutral-600 font-medium",
}: ThinArcLoaderProps) {
  const reactId = useId();
  const gradId = `yellow-red-arc-${reactId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const style = size ? { width: `${size}px`, height: `${size}px` } : undefined;

  return (
    <span className="inline-flex items-center gap-2" role="status" aria-live="polite">
      <svg
        className={`animate-spin shrink-0 ${className}`}
        style={style}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          {/* Gradient transitioning from warm brand yellow (#FFB300) through amber (#FB8C00) to deep brand red (#C62828) */}
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB300" />
            <stop offset="45%" stopColor="#FB8C00" />
            <stop offset="100%" stopColor="#C62828" />
          </linearGradient>
        </defs>

        {/* Subtle faint background track */}
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="opacity-10"
        />

        {/* Crisp ultra-thin arc with rounded ends */}
        <path
          d="M 12 2 A 10 10 0 0 1 22 12 A 10 10 0 0 1 16 20.6"
          stroke={`url(#${gradId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </svg>
      {label && <span className={labelClassName}>{label}</span>}
    </span>
  );
}

export default ThinArcLoader;
