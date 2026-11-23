"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Upload,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FolderTree,
  Globe,
  ArrowRight,
  Database,
} from "lucide-react";
import { FileTextIcon } from "@/components/icons/FileTextIcon";
import { RefreshCWIcon } from "@/components/icons/RefreshCWIcon";
import { getStoredEditions } from "@/lib/editionsStore";
import {
  fetchR2Catalogue,
  getR2PublicUrl,
  r2ItemToEdition,
  getBrowserCachedCatalogue,
} from "@/lib/r2Service";
import { ThinArcLoader } from "@/components/shared/ThinArcLoader";
import {
  DocumentChartBarIcon,
  DocumentChartBarIconHandle,
} from "@/components/icons/DocumentChartBarIcon";
import {
  GlobeAltIcon,
  GlobeAltIconHandle,
} from "@/components/icons/GlobeAltIcon";
import {
  ArrowUpTrayIcon,
  ArrowUpTrayIconHandle,
} from "@/components/icons/ArrowUpTrayIcon";
import {
  FolderTreeIcon,
  FolderTreeIconHandle,
} from "@/components/icons/FolderTreeIcon";
import { Edition } from "@/types";

export default function AdminDashboardOverviewPage() {
  const topDocBtnRef = useRef<DocumentChartBarIconHandle>(null);
  const topUploadBtnRef = useRef<ArrowUpTrayIconHandle>(null);
  const cardDocRef = useRef<DocumentChartBarIconHandle>(null);
  const cardUploadRef = useRef<ArrowUpTrayIconHandle>(null);
  const cardFolderRef = useRef<FolderTreeIconHandle>(null);
  const cardGlobeRef = useRef<GlobeAltIconHandle>(null);

  const [isR2Loaded, setIsR2Loaded] = useState(false);
  const [r2Url, setR2Url] = useState("");
  const [editions, setEditions] = useState<Edition[]>([]);
  const [isReloading, setIsReloading] = useState(false);

  const loadData = useCallback(async () => {
    setIsReloading(true);
    try {
      setR2Url(getR2PublicUrl());

      // 1. Immediately populate from browser cache memory for instant render
      const cached = getBrowserCachedCatalogue();
      if (cached && cached.newspapers.length > 0) {
        setEditions(cached.newspapers.map(r2ItemToEdition));
      } else {
        setEditions(getStoredEditions());
      }

      // 2. Refresh from database (R2) in background
      const res = await fetchR2Catalogue({ bypassCache: true, publishedOnly: false });
      if (res.success) {
        setIsR2Loaded(true);
        setEditions(res.data.map(r2ItemToEdition));
      }
    } finally {
      // Keep container loaders visible smoothly during reload
      setTimeout(() => {
        setIsReloading(false);
      }, 600);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleStorage = () => {
      setEditions(getStoredEditions());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [loadData]);

  const totalEditions = editions.length;
  const publishedEditions = editions.filter((e) => e.isPublished).length;
  const draftEditions = totalEditions - publishedEditions;
  const latestEditions = editions.slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-lg border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#172B4D]">
              ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಅವಲೋಕನ (Overview)
            </h1>
            
            
          </div>
          <p className="text-xs sm:text-sm text-[#5A6A85] mt-1">
            ನ್ಯಾಯ ಘರ್ಜನೆ ಇ-ಪತ್ರಿಕೆ ಆಡಳಿತ ಕೇಂದ್ರ. ಒಟ್ಟು ಪತ್ರಿಕೆಗಳು, ಪ್ರಕಟಣೆಗಳು ಮತ್ತು ಡೇಟಾಬೇಸ್ ಸ್ಥಿತಿ.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href="/papers"
            onMouseEnter={() => topDocBtnRef.current?.startAnimation()}
            onMouseLeave={() => topDocBtnRef.current?.stopAnimation()}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-neutral-50 text-[#172B4D] border border-[#E2E8F0] hover:border-[#172B4D] text-xs sm:text-sm font-bold rounded-lg shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
          >
            <DocumentChartBarIcon ref={topDocBtnRef} size={18} className="text-[#172B4D]" />
            <span>ಪತ್ರಿಕೆಗಳ ವರದಿ</span>
          </Link>

          <Link
            href="/upload"
            onMouseEnter={() => topUploadBtnRef.current?.startAnimation()}
            onMouseLeave={() => topUploadBtnRef.current?.stopAnimation()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs transition-colors cursor-pointer group"
          >
            <ArrowUpTrayIcon ref={topUploadBtnRef} size={18} className="text-white" />
            <span>ಹೊಸ ಪತ್ರಿಕೆ ಅಪ್‌ಲೋಡ್</span>
          </Link>

          <button
            type="button"
            onClick={loadData}
            disabled={isReloading}
            title="ದತ್ತಾಂಶ ರಿಫ್ರೆಶ್ ಮಾಡಿ"
            className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-lg border border-neutral-200 transition-colors cursor-pointer flex items-center justify-center disabled:opacity-60"
          >
            {isReloading ? (
              <ThinArcLoader className="w-4 h-4" strokeWidth={1.25} />
            ) : (
              <RefreshCWIcon size={16} />
            )}
          </button>
        </div>
      </div>

      {/* 2. Key KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {/* KPI 1: Total Editions */}
        <div className="relative bg-white p-4 sm:p-5 rounded-lg border border-[#E2E8F0] shadow-xs space-y-2 overflow-hidden">
          {isReloading && (
            <div className="absolute inset-0 bg-white/85 backdrop-blur-2xs flex items-center justify-center z-10 animate-in fade-in duration-150">
              <ThinArcLoader className="w-10 h-10" strokeWidth={1.15} />
            </div>
          )}
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider">ಒಟ್ಟು ಪತ್ರಿಕೆಗಳು</span>
            <FileTextIcon size={18} className="text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#172B4D]">
              {totalEditions}
            </span>
            <span className="text-[11px] text-neutral-400">ಸಂಚಿಕೆಗಳು</span>
          </div>
          <p className="text-[11px] text-[#5A6A85]">ಕ್ಯಾಟಲಾಗ್‌ನಲ್ಲಿ ಲಭ್ಯ</p>
        </div>

        {/* KPI 2: Published Live */}
        <div className="relative bg-white p-4 sm:p-5 rounded-lg border border-[#E2E8F0] shadow-xs space-y-2 overflow-hidden">
          {isReloading && (
            <div className="absolute inset-0 bg-white/85 backdrop-blur-2xs flex items-center justify-center z-10 animate-in fade-in duration-150">
              <ThinArcLoader className="w-10 h-10" strokeWidth={1.15} />
            </div>
          )}
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider">ಪ್ರಕಟಿತ (Live)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">
              {publishedEditions}
            </span>
            <span className="text-[11px] text-neutral-400">ಪತ್ರಿಕೆಗಳು</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">ಓದುಗರಿಗೆ ನೇರ ಪ್ರದರ್ಶನ</p>
        </div>

        {/* KPI 3: Drafts */}
        <div className="relative bg-white p-4 sm:p-5 rounded-lg border border-[#E2E8F0] shadow-xs space-y-2 overflow-hidden">
          {isReloading && (
            <div className="absolute inset-0 bg-white/85 backdrop-blur-2xs flex items-center justify-center z-10 animate-in fade-in duration-150">
              <ThinArcLoader className="w-10 h-10" strokeWidth={1.15} />
            </div>
          )}
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider">ಕರಡು (Drafts)</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-700">
              {draftEditions}
            </span>
            <span className="text-[11px] text-neutral-400">ಆವೃತ್ತಿಗಳು</span>
          </div>
          <p className="text-[11px] text-[#5A6A85]">ಇನ್ನೂ ಪ್ರಕಟವಾಗಿಲ್ಲ</p>
        </div>

        {/* KPI 4: Database / Storage */}
        <div className="relative bg-white p-4 sm:p-5 rounded-lg border border-[#E2E8F0] shadow-xs space-y-2 overflow-hidden">
          {isReloading && (
            <div className="absolute inset-0 bg-white/85 backdrop-blur-2xs flex items-center justify-center z-10 animate-in fade-in duration-150">
              <ThinArcLoader className="w-10 h-10" strokeWidth={1.15} />
            </div>
          )}
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider">ಡೇಟಾಬೇಸ್ / ಸಂಗ್ರಹಣೆ</span>
            <div className="flex items-center gap-1.5">
              {isR2Loaded ? (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              ) : (
                <span className="h-2 w-2 rounded-full bg-amber-400" />
              )}
              <Database className="w-4 h-4 text-[#C62828]" />
            </div>
          </div>
          <div className="truncate text-xs font-mono font-bold text-[#172B4D]">
            {isR2Loaded ? "Cloudflare R2 (Connected)" : r2Url ? "Checking..." : "Not configured"}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium truncate flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>ಡೇಟಾಬೇಸ್ ಆನ್‌ಲೈನ್ & ಸಕ್ರಿಯ</span>
          </p>
        </div>
      </div>

      {/* 3. Quick Action Navigation Cards with Motion Animated Icons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/papers"
          onMouseEnter={() => cardDocRef.current?.startAnimation()}
          onMouseLeave={() => cardDocRef.current?.stopAnimation()}
          className="group bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-xs hover:border-[#172B4D] hover:shadow-md transition-all flex flex-col justify-between space-y-3 cursor-pointer"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-[#172B4D] group-hover:text-white transition-colors">
              <DocumentChartBarIcon ref={cardDocRef} size={22} />
            </div>
            <h3 className="text-sm font-bold text-[#172B4D]">ಪತ್ರಿಕೆಗಳ ನಿರ್ವಹಣೆ</h3>
            <p className="text-xs text-[#5A6A85]">
              ಎಲ್ಲಾ ಸಂಚಿಕೆಗಳ ಪಟ್ಟಿ, ಸ್ಥಿತಿ ಬದಲಾವಣೆ, ತಿದ್ದುಪಡಿ ಮತ್ತು ತೆಗೆದುಹಾಕುವಿಕೆ.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#172B4D]">
            <span>ಪಟ್ಟಿ ನೋಡಿ</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          href="/upload"
          onMouseEnter={() => cardUploadRef.current?.startAnimation()}
          onMouseLeave={() => cardUploadRef.current?.stopAnimation()}
          className="group bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-xs hover:border-[#C62828] hover:shadow-md transition-all flex flex-col justify-between space-y-3 cursor-pointer"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-red-50 text-[#C62828] flex items-center justify-center group-hover:bg-[#C62828] group-hover:text-white transition-colors">
              <ArrowUpTrayIcon ref={cardUploadRef} size={22} />
            </div>
            <h3 className="text-sm font-bold text-[#172B4D]">ಹೊಸ ಪತ್ರಿಕೆ ಅಪ್‌ಲೋಡ್</h3>
            <p className="text-xs text-[#5A6A85]">
              PDF ಆಯ್ಕೆಮಾಡಿ, ಕ್ಯಾಟಲಾಗ್ ರಚಿಸಿ ಮತ್ತು ವಾಚಕದಲ್ಲಿ ನೇರವಾಗಿ ಪರೀಕ್ಷಿಸಿ.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#C62828]">
            <span>ಅಪ್‌ಲೋಡ್ ಮಾಡಿ</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          href="/guide"
          onMouseEnter={() => cardFolderRef.current?.startAnimation()}
          onMouseLeave={() => cardFolderRef.current?.stopAnimation()}
          className="group bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-xs hover:border-[#172B4D] hover:shadow-md transition-all flex flex-col justify-between space-y-3 cursor-pointer"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-[#172B4D] group-hover:text-white transition-colors">
              <FolderTreeIcon ref={cardFolderRef} size={22} />
            </div>
            <h3 className="text-sm font-bold text-[#172B4D]">ಪ್ರಕಟಣಾ ಮಾರ್ಗದರ್ಶಿ</h3>
            <p className="text-xs text-[#5A6A85]">
              ಡೇಟಾಬೇಸ್‌ಗೆ ಫೈಲ್ ಮತ್ತು ಕ್ಯಾಟಲಾಗ್ ಸೇರಿಸುವ ೫ ಸರಳ ಹಂತಗಳು.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#172B4D]">
            <span>ಮಾರ್ಗದರ್ಶಿ ಓದಿ</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>

        <Link
          href="/verifier"
          onMouseEnter={() => cardGlobeRef.current?.startAnimation()}
          onMouseLeave={() => cardGlobeRef.current?.stopAnimation()}
          className="group bg-white p-5 rounded-lg border border-[#E2E8F0] shadow-xs hover:border-purple-700 hover:shadow-md transition-all flex flex-col justify-between space-y-3 cursor-pointer"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors">
              <GlobeAltIcon ref={cardGlobeRef} size={22} />
            </div>
            <h3 className="text-sm font-bold text-[#172B4D]">ಡೇಟಾಬೇಸ್ ಕನೆಕ್ಟಿವಿಟಿ ಟೆಸ್ಟರ್</h3>
            <p className="text-xs text-[#5A6A85]">
              ಕಸ್ಟಮ್ ಡೊಮೈನ್ ಮತ್ತು ಕ್ಯಾಟಲಾಗ್ ಲೈವ್ ಆಗಿದೆಯೇ ಎಂದು ತಕ್ಷಣ ಪರೀಕ್ಷಿಸಿ.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-purple-700">
            <span>ಟೆಸ್ಟ್ ಮಾಡಿ</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* 4. Recent Editions Table Preview */}
      <div className="relative bg-white rounded-lg border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-4 overflow-hidden">
        {isReloading && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-2xs flex items-center justify-center z-10 animate-in fade-in duration-150">
            <ThinArcLoader className="w-10 h-10" strokeWidth={1.15} />
          </div>
        )}
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#172B4D]">
              ಇತ್ತೀಚಿನ ಪತ್ರಿಕೆಗಳು (Recent Editions)
            </h2>
            <p className="text-xs text-[#5A6A85]">
              ಇತ್ತೀಚೆಗೆ ಪ್ರಕಟವಾದ ಅಥವಾ ಸೇರ್ಪಡೆಗೊಂಡ ಸಂಚಿಕೆಗಳ ಸಾರಾಂಶ.
            </p>
          </div>
          <Link
            href="/papers"
            className="text-xs font-bold text-[#C62828] hover:underline flex items-center gap-1"
          >
            <span>ಎಲ್ಲವನ್ನೂ ನೋಡಿ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F8F9FA] border-b border-[#E2E8F0] text-neutral-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">ಶೀರ್ಷಿಕೆ</th>
                <th className="py-3 px-4">ಪ್ರಕಟಣಾ ಮಾಹೆ</th>
                <th className="py-3 px-4">ಸ್ಥಿತಿ</th>
                <th className="py-3 px-4 text-right">ಕ್ರಮಗಳು</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {isReloading && editions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center">
                    <ThinArcLoader className="w-10 h-10 mx-auto" strokeWidth={1.15} />
                  </td>
                </tr>
              ) : latestEditions.length > 0 ? (
                latestEditions.map((ed) => (
                  <tr key={ed.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-[#172B4D]">{ed.title}</span>
                      <span className="text-[11px] text-neutral-400 block">{ed.edition || "ರಾಜ್ಯ ಆವೃತ್ತಿ"}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#172B4D] whitespace-nowrap">
                      {ed.formattedDate}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                          ed.isPublished
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {ed.isPublished ? "ಪ್ರಕಟಿತ" : "ಕರಡು"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <a
                        href={`${process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://www.nyaayagharjane.com"}/reader/${ed.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#172B4D] hover:bg-neutral-100 rounded-md"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>ವಾಚಕ</span>
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-xs text-neutral-400">
                    ಯಾವುದೇ ಸಂಚಿಕೆಗಳು ಲಭ್ಯವಿಲ್ಲ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
