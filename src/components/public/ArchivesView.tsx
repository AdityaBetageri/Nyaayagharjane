"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Calendar,
  Search,
  AlertCircle,
  RefreshCw,
  Filter,
  CheckCircle2,
  X,
} from "lucide-react";
import { Edition } from "@/types";
import EditionCard from "@/components/shared/EditionCard";
import EmptyState from "@/components/shared/EmptyState";
import { getStoredEditions } from "@/lib/editionsStore";
import {
  fetchR2Catalogue,
  r2ItemToEdition,
  KANNADA_MONTH_MAP,
  getR2PublicUrl,
} from "@/lib/r2Service";

interface ArchivesViewProps {
  initialEditions: Edition[];
}

export default function ArchivesView({ initialEditions }: ArchivesViewProps) {
  const [editions, setEditions] = useState<Edition[]>(initialEditions);
  const [loading, setLoading] = useState(true);
  const [errorNotice, setErrorNotice] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<"r2" | "cache" | "fallback">("fallback");

  // Filters
  const [selectedYear, setSelectedYear] = useState<number | "all">(2026);
  const [selectedMonth, setSelectedMonth] = useState<number | "all">("all");
  const [selectedEditionArea, setSelectedEditionArea] = useState<string | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadCatalogue = async (bypassCache: boolean = false) => {
    setLoading(true);
    setErrorNotice(null);

    try {
      const res = await fetchR2Catalogue({ bypassCache, publishedOnly: true });

      if (res.success && res.data.length > 0) {
        const mappedEditions = res.data.map(r2ItemToEdition);
        setEditions(mappedEditions);
        setDataSource(res.source);
      } else {
        // Fallback to local stored editions
        const stored = getStoredEditions().filter((e) => e.isPublished !== false);
        setEditions(stored.length > 0 ? stored : initialEditions);
        setDataSource("fallback");
        if (res.error && getR2PublicUrl()) {
          setErrorNotice(res.error);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "ದೋಷ ಸಂಭವಿಸಿದೆ";
      setErrorNotice(`ಕ್ಯಾಟಲಾಗ್ ಲೋಡ್ ವಿಫಲವಾಗಿದೆ: ${msg}`);
      setEditions(initialEditions);
      setDataSource("fallback");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const res = await fetchR2Catalogue({ bypassCache: false, publishedOnly: true });
        if (ignore) return;
        if (res.success && res.data.length > 0) {
          const mappedEditions = res.data.map(r2ItemToEdition);
          setEditions(mappedEditions);
          setDataSource(res.source);
        } else {
          const stored = getStoredEditions().filter((e) => e.isPublished !== false);
          setEditions(stored.length > 0 ? stored : initialEditions);
          setDataSource("fallback");
          if (res.error && getR2PublicUrl()) {
            setErrorNotice(res.error);
          }
        }
      } catch (err: unknown) {
        if (ignore) return;
        const msg = err instanceof Error ? err.message : "ದೋಷ ಸಂಭವಿಸಿದೆ";
        setErrorNotice(`ಕ್ಯಾಟಲಾಗ್ ಲೋಡ್ ವಿಫಲವಾಗಿದೆ: ${msg}`);
        setEditions(initialEditions);
        setDataSource("fallback");
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    })();

    return () => {
      ignore = true;
    };
  }, [initialEditions]);

  // Compute available filter options dynamically
  const availableYears = useMemo(() => {
    const years = Array.from(new Set(editions.map((e) => e.editionYear))).filter(Boolean);
    if (!years.includes(2026)) years.push(2026);
    return years.sort((a, b) => b - a);
  }, [editions]);

  const availableEditions = useMemo(() => {
    const set = new Set<string>();
    editions.forEach((e) => {
      if (e.edition) set.add(e.edition);
    });
    return Array.from(set);
  }, [editions]);

  // Filtered editions
  const filteredEditions = useMemo(() => {
    return editions.filter((edition) => {
      if (edition.isPublished === false) return false;

      // Year filter
      if (selectedYear !== "all" && edition.editionYear !== selectedYear) {
        return false;
      }

      // Month filter
      if (selectedMonth !== "all" && edition.issueNumber !== selectedMonth) {
        return false;
      }

      // Edition area filter
      if (selectedEditionArea !== "all" && edition.edition !== selectedEditionArea) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchesTitle = edition.title.toLowerCase().includes(q);
        const matchesMonth = edition.editionMonth.toLowerCase().includes(q);
        const matchesDate = edition.formattedDate.toLowerCase().includes(q);
        const matchesArea = (edition.edition || "").toLowerCase().includes(q);
        if (!matchesTitle && !matchesMonth && !matchesDate && !matchesArea) {
          return false;
        }
      }

      return true;
    });
  }, [editions, selectedYear, selectedMonth, selectedEditionArea, searchQuery]);

  const resetFilters = () => {
    setSelectedYear(2026);
    setSelectedMonth("all");
    setSelectedEditionArea("all");
    setSearchQuery("");
  };

  const hasActiveFilters =
    selectedYear !== 2026 ||
    selectedMonth !== "all" ||
    selectedEditionArea !== "all" ||
    searchQuery.trim() !== "";

  return (
    <div className="space-y-6">
      {/* Status Notice / Connection Indicator */}
      {dataSource === "r2" ? (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between gap-2.5 text-xs text-emerald-900">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <p>
              <strong className="font-bold">Cloudflare R2 ಸಂಪರ್ಕ ಸಕ್ರಿಯವಾಗಿದೆ:</strong> ಪತ್ರಿಕೆಗಳ ಕ್ಯಾಟಲಾಗ್ ಮತ್ತು PDF ಫೈಲ್‌ಗಳು R2 ಆಬ್ಜೆಕ್ಟ್ ಸ್ಟೋರೇಜ್ ಮೂಲಕ ನೇರವಾಗಿ ವಿತರಣೆಯಾಗುತ್ತಿವೆ.
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadCatalogue(true)}
            disabled={loading}
            className="p-1 rounded hover:bg-emerald-100 text-emerald-700 transition-colors shrink-0"
            title="ಕ್ಯಾಟಲಾಗ್ ರಿಫ್ರೆಶ್ ಮಾಡಿ"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      ) : (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between gap-2.5 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <p>
              <strong className="font-bold">ಗಮನಿಸಿ:</strong> ಪ್ರಸ್ತುತ ಮಾದರಿ ಮುನ್ನೋಟ (Sample Data) ಪ್ರದರ್ಶಿಸಲಾಗುತ್ತಿದೆ. R2 ನಲ್ಲಿ ಹೊಸ ಪತ್ರಿಕೆಗಳು ಪ್ರಕಟವಾದಾಗ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ನವೀಕರಣಗೊಳ್ಳುತ್ತದೆ.
            </p>
          </div>
          <button
            type="button"
            onClick={() => loadCatalogue(true)}
            disabled={loading}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded font-semibold transition-colors shrink-0"
            title="ಮತ್ತೊಮ್ಮೆ ಪರಿಶೀಲಿಸಿ"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
            <span>ರಿಫ್ರೆಶ್</span>
          </button>
        </div>
      )}

      {errorNotice && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-800">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorNotice}</span>
        </div>
      )}

      {/* Filtering Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#E2E8F0] shadow-xs space-y-4">
        {/* Top Controls: Year & Search */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Year Tabs */}
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-[#5A6A85] flex items-center gap-1 shrink-0 mr-1">
              <Calendar className="w-3.5 h-3.5 text-[#C62828]" />
              <span>ವರ್ಷ:</span>
            </span>
            <button
              type="button"
              onClick={() => setSelectedYear("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                selectedYear === "all"
                  ? "bg-[#172B4D] text-white shadow-xs"
                  : "bg-[#F8F9FA] text-[#172B4D] hover:bg-neutral-200 border border-[#E2E8F0]"
              }`}
            >
              ಎಲ್ಲಾ ವರ್ಷಗಳು
            </button>
            {availableYears.map((year) => {
              const isSelected = selectedYear === year;
              return (
                <button
                  key={year}
                  type="button"
                  onClick={() => setSelectedYear(year)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    isSelected
                      ? "bg-[#172B4D] text-white shadow-xs"
                      : "bg-[#F8F9FA] text-[#172B4D] hover:bg-neutral-200 border border-[#E2E8F0]"
                  }`}
                >
                  {year}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ತಿಂಗಳು, ಶೀರ್ಷಿಕೆ ಅಥವಾ ಆವೃತ್ತಿ ಹುಡುಕಿ..."
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#C62828] text-[#172B4D]"
            />
          </div>
        </div>

        {/* Secondary Filters: Month & Edition Area */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#E2E8F0] text-xs">
          <div className="flex items-center gap-1.5 text-[#5A6A85] font-semibold">
            <Filter className="w-3.5 h-3.5 text-[#C62828]" />
            <span>ಫಿಲ್ಟರ್:</span>
          </div>

          {/* Month Dropdown */}
          <select
            value={selectedMonth}
            onChange={(e) =>
              setSelectedMonth(e.target.value === "all" ? "all" : Number(e.target.value))
            }
            className="px-2.5 py-1.5 bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#172B4D] focus:outline-hidden focus:ring-1 focus:ring-[#C62828]"
          >
            <option value="all">ಎಲ್ಲಾ ತಿಂಗಳುಗಳು</option>
            {Object.entries(KANNADA_MONTH_MAP).map(([num, name]) => (
              <option key={num} value={num}>
                {name}
              </option>
            ))}
          </select>

          {/* Edition Area Dropdown */}
          {availableEditions.length > 0 && (
            <select
              value={selectedEditionArea}
              onChange={(e) => setSelectedEditionArea(e.target.value)}
              className="px-2.5 py-1.5 bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg text-xs font-medium text-[#172B4D] focus:outline-hidden focus:ring-1 focus:ring-[#C62828]"
            >
              <option value="all">ಎಲ್ಲಾ ಆವೃತ್ತಿಗಳು</option>
              {availableEditions.map((ed) => (
                <option key={ed} value={ed}>
                  {ed}
                </option>
              ))}
            </select>
          )}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-[#C62828] hover:bg-red-50 rounded font-semibold transition-colors ml-auto"
            >
              <X className="w-3.5 h-3.5" />
              <span>ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#5A6A85] px-1">
        <p>
          <span className="font-bold text-[#172B4D]">
            {selectedYear === "all" ? "ಎಲ್ಲಾ ವರ್ಷಗಳ" : `${selectedYear} ನೇ ಸಾಲಿನ`}
          </span>{" "}
          ಸಂಚಿಕೆಗಳು ({filteredEditions.length} ಆವೃತ್ತಿಗಳು ಲಭ್ಯ)
        </p>
        <span className="text-[11px] text-neutral-400">ಇತ್ತೀಚಿನ ಸಂಚಿಕೆ ಮೊದಲು ಪ್ರದರ್ಶಿತವಾಗಿದೆ</span>
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-lg border border-[#E2E8F0] p-4 space-y-4 animate-pulse"
            >
              <div className="aspect-[1/1.38] bg-neutral-200 rounded-md" />
              <div className="h-4 bg-neutral-200 rounded w-3/4" />
              <div className="h-3 bg-neutral-200 rounded w-1/2" />
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="h-8 bg-neutral-200 rounded" />
                <div className="h-8 bg-neutral-200 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredEditions.length > 0 ? (
        /* Editions Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredEditions.map((edition) => (
            <EditionCard
              key={edition.id}
              edition={edition}
              isPlaceholder={!edition.pdfUrl || !edition.pdfUrl.startsWith("http")}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <EmptyState
          title="ಯಾವುದೇ ಸಂಚಿಕೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ"
          description="ನೀವು ಹುಡುಕುತ್ತಿರುವ ಮಾನದಂಡಗಳಿಗೆ ಹೊಂದಿಕೆಯಾಗುವ ಯಾವುದೇ ಪತ್ರಿಕೆಗಳು ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಬೇರೆ ವರ್ಷ ಅಥವಾ ಹುಡುಕಾಟ ಪದವನ್ನು ಪ್ರಯತ್ನಿಸಿ."
          actionText="ಫಿಲ್ಟರ್ ತೆರವುಗೊಳಿಸಿ"
          onAction={resetFilters}
        />
      )}
    </div>
  );
}
