"use client";

import { useState } from "react";
import { Calendar, Search, AlertCircle } from "lucide-react";
import { Edition } from "@/types";
import EditionCard from "@/components/shared/EditionCard";
import EmptyState from "@/components/shared/EmptyState";

interface ArchivesViewProps {
  initialEditions: Edition[];
}

export default function ArchivesView({ initialEditions }: ArchivesViewProps) {
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [searchQuery, setSearchQuery] = useState("");

  const availableYears = [2026, 2025, 2024];

  // Filter editions by year and optional month search
  const filteredEditions = initialEditions.filter((edition) => {
    const matchesYear = edition.editionYear === selectedYear;
    const matchesSearch =
      searchQuery.trim() === "" ||
      edition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      edition.editionMonth.toLowerCase().includes(searchQuery.toLowerCase()) ||
      edition.formattedDate.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesYear && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Development Preview Banner */}
      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2.5 text-xs text-amber-900">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
        <p>
          <strong className="font-bold">ಗಮನಿಸಿ:</strong> ಇಲ್ಲಿ ಪಟ್ಟಿ ಮಾಡಲಾದ ಸಂಚಿಕೆಗಳು ಆರ್ಕೈವ್ ವಿಭಾಗದ ವಿನ್ಯಾಸ ಪರೀಕ್ಷೆಗಾಗಿ ರಚಿಸಲಾದ ಮಾದರಿ ಮುನ್ನೋಟಗಳಾಗಿವೆ (Sample Preview Data).
        </p>
      </div>

      {/* Filtering Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Year Tabs */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-[#5A6A85] flex items-center gap-1 shrink-0 mr-1">
            <Calendar className="w-3.5 h-3.5 text-[#C62828]" />
            <span>ವರ್ಷ:</span>
          </span>
          {availableYears.map((year) => {
            const isSelected = selectedYear === year;
            return (
              <button
                key={year}
                type="button"
                onClick={() => setSelectedYear(year)}
                className={`px-3.5 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold transition-all shrink-0 ${
                  isSelected
                    ? "bg-[#172B4D] text-white shadow-xs"
                    : "bg-[#F8F9FA] text-[#172B4D] hover:bg-neutral-200 border border-[#E2E8F0]"
                }`}
              >
                {year === 2026 ? "೨೦೨೬ (2026)" : year === 2025 ? "೨೦೨೫ (2025)" : "೨೦೨೪ (2024)"}
              </button>
            );
          })}
        </div>

        {/* Search input for quick filtering */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ತಿಂಗಳು ಅಥವಾ ಸಂಚಿಕೆ ಹುಡುಕಿ..."
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#C62828] text-[#172B4D]"
          />
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-[#5A6A85] px-1">
        <p>
          <span className="font-bold text-[#172B4D]">{selectedYear}</span> ನೇ ಸಾಲಿನ ಸಂಚಿಕೆಗಳು (
          {filteredEditions.length} ಮಾದರಿ ಆವೃತ್ತಿಗಳು ಲಭ್ಯ)
        </p>
        <span className="text-[11px] text-neutral-400">ಇತ್ತೀಚಿನ ಸಂಚಿಕೆ ಮೊದಲು ಪ್ರದರ್ಶಿತವಾಗಿದೆ</span>
      </div>

      {/* Editions Grid or Empty State */}
      {filteredEditions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredEditions.map((edition) => (
            <EditionCard key={edition.id} edition={edition} isPlaceholder={true} />
          ))}
        </div>
      ) : (
        <EmptyState
          title={`${selectedYear} ನೇ ಸಾಲಿನ ಸಂಚಿಕೆಗಳು ಲಭ್ಯವಿಲ್ಲ`}
          description={
            searchQuery
              ? `"${searchQuery}" ಗೆ ಯಾವುದೇ ಸಂಚಿಕೆಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಬೇರೆ ಪದವನ್ನು ಹುಡುಕಿ.`
              : `${selectedYear} ನೇ ಸಾಲಿನ ಡಿಜಿಟಲ್ ಆರ್ಕೈವ್ ಇನ್ನೂ ಸಿದ್ಧವಾಗುತ್ತಿದ್ದು, ಶೀಘ್ರದಲ್ಲಿಯೇ ಈ ವಿಭಾಗದಲ್ಲಿ ಪ್ರಕಟಿಸಲಾಗುವುದು.`
          }
          actionText={searchQuery ? "ಹುಡುಕಾಟ ತೆರವುಗೊಳಿಸಿ" : "೨೦೨೬ ನೇ ಸಾಲಿಗೆ ಹಿಂತಿರುಗಿ"}
          actionHref={searchQuery ? undefined : "#"}
        />
      )}
    </div>
  );
}
