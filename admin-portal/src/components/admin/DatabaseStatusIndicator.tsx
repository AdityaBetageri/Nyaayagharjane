"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Database, RefreshCw, CheckCircle2, AlertCircle, ChevronDown, HardDrive, Clock, FileText } from "lucide-react";
import { ThinArcLoader } from "@/components/shared/ThinArcLoader";

export interface DbStatusData {
  connected: boolean;
  provider: string;
  bucket: string;
  itemCount: number;
  latencyMs: number;
  s3Ok: boolean;
  publicOk: boolean;
  s3CatalogueFound: boolean;
  publicStatus?: number;
  checkedAt: string;
  error?: string | null;
}

export interface DatabaseStatusIndicatorProps {
  /** If true, renders a minimal compact icon + dot (ideal for mobile bar) */
  compact?: boolean;
  /** Custom extra classes for wrapper */
  className?: string;
  /** Callback triggered when a reload finishes */
  onRefresh?: (data: DbStatusData) => void;
}

export function DatabaseStatusIndicator({
  compact = false,
  className = "",
  onRefresh,
}: DatabaseStatusIndicatorProps) {
  const [status, setStatus] = useState<DbStatusData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const checkConnection = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      // Add timestamp to bypass any browser cache on manual refresh
      const res = await fetch(`/api/admin/db-status?t=${Date.now()}`, {
        method: "GET",
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data: DbStatusData = await res.json();
      setStatus(data);
      if (onRefresh) onRefresh(data);
    } catch (err) {
      setStatus({
        connected: false,
        provider: "Cloudflare R2 Database",
        bucket: "naresh",
        itemCount: 0,
        latencyMs: 0,
        s3Ok: false,
        publicOk: false,
        s3CatalogueFound: false,
        checkedAt: new Date().toISOString(),
        error: err instanceof Error ? err.message : "ಸಂಪರ್ಕ ಸಾಧ್ಯವಾಗಿಲ್ಲ",
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [onRefresh]);

  useEffect(() => {
    checkConnection(false);

    // Auto periodic background check every 60 seconds
    const interval = setInterval(() => {
      checkConnection(false);
    }, 60000);

    return () => clearInterval(interval);
  }, [checkConnection]);

  // Close details dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDetails(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const isBusy = isLoading || isRefreshing;
  const isConnected = status?.connected === true;

  // Compact Mobile Mode
  if (compact) {
    return (
      <div className={`relative flex items-center ${className}`}>
        <button
          type="button"
          onClick={() => checkConnection(true)}
          disabled={isBusy}
          title={
            isBusy
              ? "ಡೇಟಾಬೇಸ್ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..."
              : isConnected
              ? `ಡೇಟಾಬೇಸ್ ಸಂಪರ್ಕಗೊಂಡಿದೆ (${status?.latencyMs || 0}ms)`
              : "ಡೇಟಾಬೇಸ್ ಸಂಪರ್ಕ ಕಡಿತಗೊಂಡಿದೆ. ಮರುಪರಿಶೀಲಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ."
          }
          className="relative p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer flex items-center justify-center"
          aria-label="Database connection status"
        >
          {isBusy ? (
            <ThinArcLoader className="w-4 h-4" strokeWidth={1.25} />
          ) : (
            <>
              <Database className="w-4 h-4 text-white" />
              <span
                className={`absolute top-1.5 right-1.5 w-2 h-2 rounded-full ring-2 ring-[#172B4D] ${
                  isConnected ? "bg-emerald-400" : "bg-red-400"
                }`}
              />
            </>
          )}
        </button>
      </div>
    );
  }

  // Full Desktop Top-Right Bar Mode
  return (
    <div ref={containerRef} className={`relative flex items-center gap-1.5 ${className}`}>
      {/* Main Status Pill / Button */}
      <div
        onClick={() => setShowDetails(!showDetails)}
        className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border text-xs font-semibold cursor-pointer select-none transition-all shadow-2xs ${
          isBusy
            ? "bg-amber-50/60 border-amber-200 text-amber-900"
            : isConnected
            ? "bg-emerald-50/70 border-emerald-200 text-emerald-950 hover:bg-emerald-100/60"
            : "bg-red-50/70 border-red-200 text-red-950 hover:bg-red-100/60"
        }`}
        title="ಕ್ಲಿಕ್ ಮಾಡಿ ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ"
      >
        {/* Status Dot or Brand Thin Arc Loader */}
        <div className="flex items-center justify-center shrink-0">
          {isBusy ? (
            <ThinArcLoader className="w-3.5 h-3.5" strokeWidth={1.25} />
          ) : isConnected ? (
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
          ) : (
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 shrink-0" />
          )}
        </div>

        {/* Status Text & Latency */}
        <div className="flex items-center gap-1.5 leading-none">
          <Database
            className={`w-3.5 h-3.5 ${
              isBusy
                ? "text-amber-600"
                : isConnected
                ? "text-emerald-700"
                : "text-red-600"
            }`}
          />
          <span className="font-bold">
            {isBusy
              ? "ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ..."
              : isConnected
              ? "Database Connected"
              : "Database Disconnected"}
          </span>

          {!isBusy && isConnected && status?.latencyMs ? (
            <span className="text-[10px] font-mono text-emerald-700 font-normal px-1 py-0.5 rounded-md bg-emerald-100/70">
              {status.latencyMs}ms
            </span>
          ) : null}

          <ChevronDown
            className={`w-3 h-3 transition-transform text-neutral-400 ${
              showDetails ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Standalone Refresh / Reload Button with Thin Arc Loader */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          checkConnection(true);
        }}
        disabled={isBusy}
        title="ಡೇಟಾಬೇಸ್ ಸಂಪರ್ಕ ಮರುಪರಿಶೀಲಿಸಿ (Refresh Database)"
        className="p-1.5 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-60 shadow-2xs"
        aria-label="Refresh database status"
      >
        {isRefreshing ? (
          <ThinArcLoader className="w-3.5 h-3.5" strokeWidth={1.25} />
        ) : (
          <RefreshCw className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Flyout / Dropdown Details Card */}
      {showDetails && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg border border-neutral-200 shadow-xl p-4 z-50 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-[#C62828]" />
              <span className="font-bold text-neutral-900">ಡೇಟಾಬೇಸ್ ಮಾಹಿತಿ & ಸ್ಥಿತಿ</span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                isConnected
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {isConnected ? "ಸಂಪರ್ಕಿತ (Connected)" : "ದೋಷ (Disconnected)"}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-neutral-600">
              <span className="flex items-center gap-1.5 text-neutral-500">
                <HardDrive className="w-3.5 h-3.5 text-neutral-400" />
                <span>ಸಂಗ್ರಹಣೆ (Provider):</span>
              </span>
              <span className="font-semibold text-neutral-900">
                {status?.provider || "Cloudflare R2"}
              </span>
            </div>

            <div className="flex items-center justify-between text-neutral-600">
              <span className="flex items-center gap-1.5 text-neutral-500">
                <Database className="w-3.5 h-3.5 text-neutral-400" />
                <span>ಬಕೆಟ್ (Bucket):</span>
              </span>
              <span className="font-mono font-bold text-neutral-900">
                {status?.bucket || "naresh"}
              </span>
            </div>

            <div className="flex items-center justify-between text-neutral-600">
              <span className="flex items-center gap-1.5 text-neutral-500">
                <FileText className="w-3.5 h-3.5 text-neutral-400" />
                <span>ಒಟ್ಟು ಪತ್ರಿಕೆಗಳು (Catalogue):</span>
              </span>
              <span className="font-bold text-[#C62828]">
                {status?.itemCount ?? 0} ಸಂಚಿಕೆಗಳು
              </span>
            </div>

            <div className="flex items-center justify-between text-neutral-600">
              <span className="flex items-center gap-1.5 text-neutral-500">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                <span>ಪ್ರತಿಕ್ರಿಯೆ ಸಮಯ (Latency):</span>
              </span>
              <span className="font-mono font-bold text-emerald-700">
                {status?.latencyMs ? `${status.latencyMs} ms` : "0 ms"}
              </span>
            </div>
          </div>

          {status?.error && (
            <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-800 flex items-start gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
              <span>{status.error}</span>
            </div>
          )}

          <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
            <span>ಕೊನೆಯ ಪರಿಶೀಲನೆ: {status?.checkedAt ? new Date(status.checkedAt).toLocaleTimeString() : "ಈಗಷ್ಟೇ"}</span>
            <button
              type="button"
              onClick={() => checkConnection(true)}
              disabled={isBusy}
              className="inline-flex items-center gap-1 text-[#C62828] hover:underline font-bold cursor-pointer disabled:opacity-50"
            >
              {isRefreshing ? (
                <>
                  <ThinArcLoader className="w-3 h-3" strokeWidth={1.25} />
                  <span>ಮರುಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-3 h-3" />
                  <span>ಈಗ ಮರುಪರಿಶೀಲಿಸಿ</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DatabaseStatusIndicator;
