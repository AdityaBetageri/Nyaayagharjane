"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FolderTree,
  Globe,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { getStoredEditions } from "@/lib/editionsStore";
import {
  fetchR2Catalogue,
  getR2PublicUrl,
  r2ItemToEdition,
} from "@/lib/r2Service";
import { Edition } from "@/types";

export default function AdminDashboardOverviewPage() {
  const [editions, setEditions] = useState<Edition[]>(() => getStoredEditions());
  const [isR2Loaded, setIsR2Loaded] = useState(false);
  const [r2Url, setR2Url] = useState(() => getR2PublicUrl());

  const refreshCatalogue = useCallback(() => {
    setR2Url(getR2PublicUrl());
    setEditions(getStoredEditions());

    fetchR2Catalogue({ bypassCache: false, publishedOnly: false }).then((res) => {
      if (res.success && res.data.length > 0) {
        setIsR2Loaded(true);
        setEditions(res.data.map(r2ItemToEdition));
      }
    });
  }, []);

  useEffect(() => {
    fetchR2Catalogue({ bypassCache: false, publishedOnly: false }).then((res) => {
      if (res.success && res.data.length > 0) {
        setIsR2Loaded(true);
        setEditions(res.data.map(r2ItemToEdition));
      }
    });
  }, []);

  const totalEditions = editions.length;
  const publishedEditions = editions.filter((e) => e.isPublished).length;
  const draftEditions = totalEditions - publishedEditions;
  const latestEditions = editions.slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#172B4D]">
              ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ಅವಲೋಕನ (Overview)
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-[#C62828] border border-red-200">
              ಲೈವ್
            </span>
            {isR2Loaded ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>R2 Live</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-100 text-neutral-600 border border-neutral-300">
                Fallback Local
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-[#5A6A85] mt-1">
            ನ್ಯಾಯಘರ್ಜನೆ ಇ-ಪತ್ರಿಕೆ ಆಡಳಿತ ಕೇಂದ್ರ. ಒಟ್ಟು ಪತ್ರಿಕೆಗಳು, ಪ್ರಕಟಣೆಗಳು ಮತ್ತು R2 ಸ್ಥಿತಿ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>ಹೊಸ ಪತ್ರಿಕೆ ಅಪ್‌ಲೋಡ್</span>
          </Link>

          <button
            type="button"
            onClick={refreshCatalogue}
            title="ದತ್ತಾಂಶ ರಿಫ್ರೆಶ್ ಮಾಡಿ"
            className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Key KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider">ಒಟ್ಟು ಪತ್ರಿಕೆಗಳು</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#172B4D]">{totalEditions}</span>
            <span className="text-[11px] text-neutral-400">ಸಂಚಿಕೆಗಳು</span>
          </div>
          <p className="text-[11px] text-[#5A6A85]">ಕ್ಯಾಟಲಾಗ್‌ನಲ್ಲಿ ಲಭ್ಯ</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider">ಪ್ರಕಟಿತ (Live)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">{publishedEditions}</span>
            <span className="text-[11px] text-neutral-400">ಪತ್ರಿಕೆಗಳು</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">ಓದುಗರಿಗೆ ನೇರ ಪ್ರದರ್ಶನ</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider">ಕರಡು (Drafts)</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-700">{draftEditions}</span>
            <span className="text-[11px] text-neutral-400">ಆವೃತ್ತಿಗಳು</span>
          </div>
          <p className="text-[11px] text-[#5A6A85]">ಇನ್ನೂ ಪ್ರಕಟವಾಗಿಲ್ಲ</p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E2E8F0] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-bold uppercase tracking-wider">R2 ಸಾರ್ವಜನಿಕ ಡೊಮೈನ್</span>
            <Globe className="w-4 h-4 text-purple-600" />
          </div>
          <div className="truncate text-xs font-mono font-bold text-[#172B4D]">
            {r2Url || "ಕಾನ್ಫಿಗರ್ ಆಗಿಲ್ಲ"}
          </div>
          <p className="text-[11px] text-neutral-500 truncate">
            {r2Url ? "ಕಸ್ಟಮ್ ಡೊಮೈನ್ ಸಕ್ರಿಯ" : ".env.local ನಲ್ಲಿ URL ಸೇರಿಸಿ"}
          </p>
        </div>
      </div>

      {/* 3. Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/admin/papers"
          className="group bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#172B4D] hover:shadow-md transition-all flex flex-col justify-between space-y-3"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:bg-[#172B4D] group-hover:text-white transition-colors">
              <FileText className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#172B4D]">ಪತ್ರಿಕೆಗಳ ನಿರ್ವಹಣೆ</h3>
            <p className="text-xs text-[#5A6A85]">
              ಎಲ್ಲಾ ಸಂಚಿಕೆಗಳ ಪಟ್ಟಿ, ಸ್ಥಿತಿ ಬದಲಾವಣೆ, ತಿದ್ದುಪಡಿ ಮತ್ತು ತೆಗೆದುಹಾಕುವಿಕೆ.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#172B4D]">
            <span>ಪಟ್ಟಿ ನೋಡಿ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/admin/upload"
          className="group bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#C62828] hover:shadow-md transition-all flex flex-col justify-between space-y-3"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#C62828] flex items-center justify-center group-hover:bg-[#C62828] group-hover:text-white transition-colors">
              <Upload className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#172B4D]">ಹೊಸ ಪತ್ರಿಕೆ ಅಪ್‌ಲೋಡ್</h3>
            <p className="text-xs text-[#5A6A85]">
              PDF ಆಯ್ಕೆಮಾಡಿ, ಕ್ಯಾಟಲಾಗ್ ರಚಿಸಿ ಮತ್ತು ವಾಚಕದಲ್ಲಿ ನೇರವಾಗಿ ಪರೀಕ್ಷಿಸಿ.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#C62828]">
            <span>ಅಪ್‌ಲೋಡ್ ಮಾಡಿ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/admin/guide"
          className="group bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-[#172B4D] hover:shadow-md transition-all flex flex-col justify-between space-y-3"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:bg-[#172B4D] group-hover:text-white transition-colors">
              <FolderTree className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#172B4D]">R2 ಪ್ರಕಟಣಾ ಮಾರ್ಗದರ್ಶಿ</h3>
            <p className="text-xs text-[#5A6A85]">
              Cloudflare R2 ಗೆ ಫೈಲ್ ಮತ್ತು ಕ್ಯಾಟಲಾಗ್ ಸೇರಿಸುವ ೫ ಸರಳ ಹಂತಗಳು.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-[#172B4D]">
            <span>ಮಾರ್ಗದರ್ಶಿ ಓದಿ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>

        <Link
          href="/admin/verifier"
          className="group bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs hover:border-purple-700 hover:shadow-md transition-all flex flex-col justify-between space-y-3"
        >
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors">
              <Globe className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-[#172B4D]">R2 ಕನೆಕ್ಟಿವಿಟಿ ಟೆಸ್ಟರ್</h3>
            <p className="text-xs text-[#5A6A85]">
              ಕಸ್ಟಮ್ ಡೊಮೈನ್ ಮತ್ತು ಕ್ಯಾಟಲಾಗ್ ಲೈವ್ ಆಗಿದೆಯೇ ಎಂದು ತಕ್ಷಣ ಪರೀಕ್ಷಿಸಿ.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-purple-700">
            <span>ಟೆಸ್ಟ್ ಮಾಡಿ</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </Link>
      </div>

      {/* 4. Recent Editions Table Preview */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-4">
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
            href="/admin/papers"
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
              {latestEditions.map((ed) => (
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
                    <Link
                      href={`/reader/${ed.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#172B4D] hover:bg-neutral-100 rounded-md"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>ವಾಚಕ</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
