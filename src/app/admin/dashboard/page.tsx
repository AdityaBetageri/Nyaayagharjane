"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  FileText,
  Upload,
  BookOpen,
  Calendar,
  Search,
  CheckCircle2,
  Trash2,
  Edit3,
  Eye,
  Plus,
  RefreshCw,
  AlertCircle,
  FileUp,
  Sparkles,
  Layers,
  ArrowUpRight,
  X,
  Save,
} from "lucide-react";
import {
  getStoredEditions,
  addStoredEdition,
  updateStoredEdition,
  deleteStoredEdition,
  togglePublishStoredEdition,
  resetEditionsToDefaults,
} from "@/lib/editionsStore";
import { Edition } from "@/types";

const KANNADA_MONTHS = [
  "ಜನವರಿ",
  "ಫೆಬ್ರವರಿ",
  "ಮಾರ್ಚ್",
  "ಏಪ್ರಿಲ್",
  "ಮೇ",
  "ಜೂನ್",
  "ಜುಲೈ",
  "ಆಗಸ್ಟ್",
  "ಸೆಪ್ಟೆಂಬರ್",
  "ಅಕ್ಟೋಬರ್",
  "ನವೆಂಬರ್",
  "ಡಿಸೆಂಬರ್",
];

export default function AdminDashboardPage() {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [activeTab, setActiveTab] = useState<"manage" | "upload" | "overview">("manage");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadMonth, setUploadMonth] = useState("ಡಿಸೆಂಬರ್");
  const [uploadYear, setUploadYear] = useState(2026);
  const [uploadVolume, setUploadVolume] = useState(1);
  const [uploadIssue, setUploadIssue] = useState(12);
  const [uploadPages, setUploadPages] = useState(16);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadIsPublished, setUploadIsPublished] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // Edit Modal State
  const [editingEdition, setEditingEdition] = useState<Edition | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load editions on mount & handle hash navigation
  useEffect(() => {
    setEditions(getStoredEditions());

    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === "#upload") {
        setActiveTab("upload");
      } else if (hash === "#manage") {
        setActiveTab("manage");
      }
    }
  }, []);

  // Update default title when month or year changes
  useEffect(() => {
    setUploadTitle(`ನ್ಯಾಯಘರ್ಜನೆ - ${uploadMonth} ${uploadYear}`);
  }, [uploadMonth, uploadYear]);

  // Statistics
  const totalEditions = editions.length;
  const publishedEditions = editions.filter((e) => e.isPublished).length;
  const draftEditions = totalEditions - publishedEditions;
  const totalPagesSum = editions.reduce((sum, e) => sum + (e.totalPages || 0), 0);

  // Filtered Editions
  const filteredEditions = editions.filter((edition) => {
    const matchesSearch =
      searchQuery.trim() === "" ||
      edition.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      edition.editionMonth.toLowerCase().includes(searchQuery.toLowerCase()) ||
      edition.formattedDate.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "published"
        ? edition.isPublished
        : !edition.isPublished;

    return matchesSearch && matchesStatus;
  });

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Handle Upload Form Submit
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadTitle.trim()) {
      alert("ದಯವಿಟ್ಟು ಪತ್ರಿಕೆಯ ಶೀರ್ಷಿಕೆಯನ್ನು ನಮೂದಿಸಿ (Please enter paper title).");
      return;
    }

    setUploading(true);

    // Calculate simulated or actual file size
    const sizeInMB = selectedFile
      ? (selectedFile.size / (1024 * 1024)).toFixed(1)
      : (10 + Math.random() * 4).toFixed(1);

    const monthIndex = KANNADA_MONTHS.indexOf(uploadMonth) + 1;
    const paddedMonth = monthIndex < 10 ? `0${monthIndex}` : `${monthIndex}`;
    const newId = `${uploadYear}-${paddedMonth}`;

    const newEdition: Edition = {
      id: newId,
      title: uploadTitle.trim(),
      editionMonth: uploadMonth,
      editionYear: uploadYear,
      formattedDate: `${uploadMonth} ${uploadYear}`,
      volumeNumber: uploadVolume,
      issueNumber: uploadIssue,
      totalPages: uploadPages,
      formattedFileSize: `${sizeInMB} MB`,
      isPublished: uploadIsPublished,
      publishedAt: new Date().toISOString().split("T")[0],
      description:
        uploadDescription.trim() ||
        `ನ್ಯಾಯಘರ್ಜನೆ ${uploadMonth} ${uploadYear} ಸಂಚಿಕೆ. ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿ ಮತ್ತು ನಿಖರ ಸುದ್ದಿಗಳ ಡಿಜಿಟಲ್ ಆವೃತ್ತಿ.`,
    };

    setTimeout(() => {
      const updated = addStoredEdition(newEdition);
      setEditions(updated);
      setUploading(false);
      setUploadSuccess(`"${newEdition.title}" ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆ!`);

      // Reset file input
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Switch to manage tab after brief delay
      setTimeout(() => {
        setUploadSuccess(null);
        setActiveTab("manage");
      }, 1500);
    }, 800);
  };

  // Toggle Publish Status
  const handleTogglePublish = (id: string) => {
    const updated = togglePublishStoredEdition(id);
    setEditions(updated);
  };

  // Delete Edition
  const handleDeleteEdition = (id: string, title: string) => {
    if (confirm(`"${title}" ಪತ್ರಿಕೆಯನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿ ಬಯಸುವಿರಾ? (Confirm delete?)`)) {
      const updated = deleteStoredEdition(id);
      setEditions(updated);
    }
  };

  // Save Edit Modal
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEdition) return;

    const updated = updateStoredEdition(editingEdition.id, {
      title: editingEdition.title,
      volumeNumber: editingEdition.volumeNumber,
      issueNumber: editingEdition.issueNumber,
      totalPages: editingEdition.totalPages,
      description: editingEdition.description,
      isPublished: editingEdition.isPublished,
    });
    setEditions(updated);
    setEditingEdition(null);
  };

  // Reset to default sample editions
  const handleResetDefaults = () => {
    if (confirm("ಎಲ್ಲಾ ಮಾದರಿ ಸಂಚಿಕೆಗಳನ್ನು ಮೊದಲಿನ ಸ್ಥಿತಿಗೆ ಮರುಹೊಂದಿಸಬೇಕೆ? (Reset all editions to default preview samples?)")) {
      const defaults = resetEditionsToDefaults();
      setEditions(defaults);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Header & Welcome Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#172B4D]">
              ಪತ್ರಿಕಾ ನಿರ್ವಹಣಾ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-[#C62828] border border-red-200">
              ಲೈವ್
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5A6A85] mt-1">
            ನ್ಯಾಯಘರ್ಜನೆ ಇ-ಪತ್ರಿಕೆಗಳನ್ನು ಸುಲಭವಾಗಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ಸರಿಪಡಿಸಿ ಮತ್ತು ಪ್ರಕಟಿಸಿ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab("upload")}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>ಹೊಸ ಪತ್ರಿಕೆ ಅಪ್‌ಲೋಡ್ (Upload)</span>
          </button>

          <button
            type="button"
            onClick={handleResetDefaults}
            title="ಮಾದರಿ ದತ್ತಾಂಶ ಮರುಹೊಂದಿಸಿ"
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
          <p className="text-[11px] text-[#5A6A85]">ಆರ್ಕೈವ್‌ನಲ್ಲಿ ಸಂಗ್ರಹಿತವಾಗಿವೆ</p>
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
          <p className="text-[11px] text-emerald-600 font-medium">ಓದುಗರಿಗೆ ಲಭ್ಯವಿದೆ</p>
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
            <span className="text-xs font-bold uppercase tracking-wider">ಒಟ್ಟು ಪುಟಗಳು</span>
            <Layers className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#172B4D]">{totalPagesSum}</span>
            <span className="text-[11px] text-neutral-400">ಪುಟಗಳು</span>
          </div>
          <p className="text-[11px] text-[#5A6A85]">ಡಿಜಿಟಲ್ ವಾಚಕದಲ್ಲಿ ಲಭ್ಯ</p>
        </div>
      </div>

      {/* 3. Navigation Tab Bar */}
      <div className="flex items-center gap-2 border-b border-[#E2E8F0] pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("manage")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "manage"
              ? "bg-[#172B4D] text-white shadow-xs"
              : "bg-white text-[#5A6A85] hover:bg-neutral-100 hover:text-neutral-900 border border-[#E2E8F0]"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>ಪತ್ರಿಕೆಗಳ ಪಟ್ಟಿ (Manage Papers)</span>
          <span className="px-1.5 py-0.2 bg-white/20 rounded text-[11px] font-mono">
            {editions.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("upload")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "upload"
              ? "bg-[#C62828] text-white shadow-xs"
              : "bg-white text-[#5A6A85] hover:bg-neutral-100 hover:text-neutral-900 border border-[#E2E8F0]"
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>ಹೊಸ ಪತ್ರಿಕೆ ಅಪ್‌ಲೋಡ್ (Upload Paper)</span>
        </button>
      </div>

      {/* 4. TAB 1: MANAGE PAPERS TABLE */}
      {activeTab === "manage" && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ತಿಂಗಳು, ಶೀರ್ಷಿಕೆ ಅಥವಾ ವರ್ಷ ಹುಡುಕಿ..."
                className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#C62828] text-[#172B4D]"
              />
            </div>

            {/* Status Filter Buttons */}
            <div className="flex items-center gap-1.5 w-full md:w-auto">
              <button
                type="button"
                onClick={() => setStatusFilter("all")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === "all"
                    ? "bg-[#172B4D] text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                ಎಲ್ಲವೂ ({editions.length})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("published")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === "published"
                    ? "bg-emerald-600 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                ಪ್ರಕಟಿತ ({publishedEditions})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter("draft")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  statusFilter === "draft"
                    ? "bg-amber-600 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                ಕರಡು ({draftEditions})
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-[#F8F9FA] border-b border-[#E2E8F0] text-[#5A6A85] text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">ಪತ್ರಿಕೆಯ ವಿವರ</th>
                    <th className="py-3.5 px-4 hidden md:table-cell">ಸಂಪುಟ & ಸಂಚಿಕೆ</th>
                    <th className="py-3.5 px-4">ಪುಟಗಳು & ಗಾತ್ರ</th>
                    <th className="py-3.5 px-4">ಸ್ಥಿತಿ</th>
                    <th className="py-3.5 px-4 text-right">ಕ್ರಿಯೆಗಳು (Actions)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredEditions.length > 0 ? (
                    filteredEditions.map((edition) => (
                      <tr key={edition.id} className="hover:bg-neutral-50/80 transition-colors">
                        {/* Title & Date */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            {/* Newspaper Thumbnail Icon */}
                            <div className="w-10 h-12 bg-neutral-100 border border-neutral-300 rounded flex flex-col items-center justify-center shrink-0 text-center p-1">
                              <BookOpen className="w-4 h-4 text-[#C62828]" />
                              <span className="text-[8px] font-bold text-neutral-600 truncate w-full mt-0.5">
                                {edition.editionMonth}
                              </span>
                            </div>

                            <div className="min-w-0">
                              <p className="font-bold text-[#172B4D] truncate">{edition.title}</p>
                              <p className="text-[11px] text-[#5A6A85] flex items-center gap-1.5 mt-0.5">
                                <Calendar className="w-3 h-3 text-neutral-400" />
                                <span>{edition.formattedDate}</span>
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Volume & Issue */}
                        <td className="py-3.5 px-4 hidden md:table-cell text-[#172B4D]">
                          <span className="font-medium">
                            ಸಂಪುಟ {edition.volumeNumber ?? 1} • ಸಂಚಿಕೆ {edition.issueNumber ?? 1}
                          </span>
                        </td>

                        {/* Pages & Size */}
                        <td className="py-3.5 px-4 text-[#5A6A85]">
                          <p className="font-semibold text-[#172B4D]">{edition.totalPages} ಪುಟಗಳು</p>
                          <p className="text-[11px] text-neutral-400">{edition.formattedFileSize || "೧೨ MB"}</p>
                        </td>

                        {/* Status Toggle */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleTogglePublish(edition.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                              edition.isPublished
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                : "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100"
                            }`}
                            title="ಸ್ಥಿತಿ ಬದಲಾಯಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ"
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                edition.isPublished ? "bg-emerald-600" : "bg-amber-600"
                              }`}
                            />
                            <span>{edition.isPublished ? "ಪ್ರಕಟಿತ (Live)" : "ಕರಡು (Draft)"}</span>
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* View in Reader */}
                            <Link
                              href={`/reader/${edition.id}`}
                              target="_blank"
                              className="p-1.5 text-neutral-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="ವಾಚಕದಲ್ಲಿ ನೋಡಿ (Open in Reader)"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => setEditingEdition(edition)}
                              className="p-1.5 text-neutral-600 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                              title="ವಿವರಗಳನ್ನು ತಿದ್ದಿ (Edit Details)"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteEdition(edition.id, edition.title)}
                              className="p-1.5 text-neutral-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="ಅಳಿಸಿ (Delete Paper)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-neutral-500">
                        <FileText className="w-8 h-8 mx-auto text-neutral-300 mb-2" />
                        <p className="font-semibold text-neutral-700">ಯಾವುದೇ ಪತ್ರಿಕೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          ಬೇರೆ ಹೆಸರನ್ನು ಹುಡುಕಿ ಅಥವಾ ಹೊಸ ಪತ್ರಿಕೆಯನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 2: UPLOAD NEW PAPER FORM */}
      {activeTab === "upload" && (
        <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-6 sm:p-8 max-w-3xl mx-auto space-y-6">
          <div className="border-b border-[#E2E8F0] pb-4">
            <div className="flex items-center gap-2 text-[#C62828]">
              <FileUp className="w-5 h-5" />
              <h2 className="text-lg sm:text-xl font-black text-[#172B4D]">
                ಹೊಸ ಇ-ಪತ್ರಿಕೆ ಸಂಚಿಕೆ ಅಪ್‌ಲೋಡ್ (Upload New Edition)
              </h2>
            </div>
            <p className="text-xs text-[#5A6A85] mt-1">
              ಪಿಡಿಎಫ್ ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ, ಸಂಚಿಕೆಯ ವಿವರಗಳನ್ನು ಭರ್ತಿ ಮಾಡಿ ಮತ್ತು ಪ್ರಕಟಿಸಿ.
            </p>
          </div>

          {/* Success Banner */}
          {uploadSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-900 text-xs sm:text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold">{uploadSuccess}</p>
                <p className="text-xs text-emerald-700">
                  ಪತ್ರಿಕೆಗಳ ಪಟ್ಟಿಗೆ ಸೇರ್ಪಡೆಗೊಂಡಿದೆ. ನೇರವಾಗಿ ವಾಚಕದಲ್ಲಿ ವೀಕ್ಷಿಸಬಹುದು.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleUploadSubmit} className="space-y-5">
            {/* PDF File Dropzone */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-[#172B4D]">
                ಪಿಡಿಎಫ್ ಫೈಲ್ (PDF Document) <span className="text-red-500">*</span>
              </label>

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                  selectedFile
                    ? "border-emerald-400 bg-emerald-50/50"
                    : "border-neutral-300 hover:border-[#C62828] bg-neutral-50/50 hover:bg-red-50/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-neutral-200 flex items-center justify-center mx-auto text-[#C62828]">
                    {selectedFile ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <Upload className="w-6 h-6" />
                    )}
                  </div>

                  {selectedFile ? (
                    <div>
                      <p className="text-sm font-bold text-emerald-900">{selectedFile.name}</p>
                      <p className="text-xs text-emerald-700">
                        ಗಾತ್ರ: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • ಆಯ್ಕೆಯಾಗಿದೆ
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-bold text-[#172B4D]">
                        ಪಿಡಿಎಫ್ ಫೈಲ್ ಅನ್ನು ಇಲ್ಲಿ ಎಳೆಯಿರಿ ಅಥವಾ ಕ್ಲಿಕ್ ಮಾಡಿ
                      </p>
                      <p className="text-xs text-[#5A6A85] mt-0.5">
                        ಗರಿಷ್ಠ ೫೦ MB ವರೆಗೆ • PDF ಫಾರ್ಮ್ಯಾಟ್ ಮಾತ್ರ
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Title Field */}
            <div className="space-y-1.5">
              <label htmlFor="upload-title" className="block text-xs font-bold text-[#172B4D]">
                ಪತ್ರಿಕೆಯ ಶೀರ್ಷಿಕೆ (Title) <span className="text-red-500">*</span>
              </label>
              <input
                id="upload-title"
                type="text"
                required
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="ನ್ಯಾಯಘರ್ಜನೆ - ಡಿಸೆಂಬರ್ ೨೦೨೬"
                className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#C62828] text-[#172B4D]"
              />
            </div>

            {/* Month & Year Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="upload-month" className="block text-xs font-bold text-[#172B4D]">
                  ಸಂಚಿಕೆಯ ತಿಂಗಳು (Edition Month)
                </label>
                <select
                  id="upload-month"
                  value={uploadMonth}
                  onChange={(e) => setUploadMonth(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#C62828] text-[#172B4D]"
                >
                  {KANNADA_MONTHS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="upload-year" className="block text-xs font-bold text-[#172B4D]">
                  ವರ್ಷ (Edition Year)
                </label>
                <select
                  id="upload-year"
                  value={uploadYear}
                  onChange={(e) => setUploadYear(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#C62828] text-[#172B4D]"
                >
                  <option value={2026}>೨೦೨೬ (2026)</option>
                  <option value={2025}>೨೦೨೫ (2025)</option>
                  <option value={2024}>೨೦೨೪ (2024)</option>
                </select>
              </div>
            </div>

            {/* Volume, Issue & Pages */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label htmlFor="upload-volume" className="block text-xs font-bold text-[#172B4D]">
                  ಸಂಪುಟ (Volume)
                </label>
                <input
                  id="upload-volume"
                  type="number"
                  min={1}
                  value={uploadVolume}
                  onChange={(e) => setUploadVolume(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#C62828]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="upload-issue" className="block text-xs font-bold text-[#172B4D]">
                  ಸಂಚಿಕೆ (Issue)
                </label>
                <input
                  id="upload-issue"
                  type="number"
                  min={1}
                  value={uploadIssue}
                  onChange={(e) => setUploadIssue(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#C62828]"
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="upload-pages" className="block text-xs font-bold text-[#172B4D]">
                  ಒಟ್ಟು ಪುಟಗಳು (Pages)
                </label>
                <input
                  id="upload-pages"
                  type="number"
                  min={1}
                  max={120}
                  value={uploadPages}
                  onChange={(e) => setUploadPages(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#C62828]"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label htmlFor="upload-desc" className="block text-xs font-bold text-[#172B4D]">
                ಸಂಚಿಕೆಯ ಮುಖ್ಯಾಂಶಗಳು / ವಿವರಣೆ (Description)
              </label>
              <textarea
                id="upload-desc"
                rows={3}
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
                placeholder="ಈ ಸಂಚಿಕೆಯ ಪ್ರಮುಖ ವರದಿಗಳು, ತನಿಖಾ ಲೇಖನಗಳು ಅಥವಾ ವಿಶೇಷ ಸಂದರ್ಶನಗಳ ವಿವರ..."
                className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#C62828] text-[#172B4D]"
              />
            </div>

            {/* Publish Toggle Checkbox */}
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-200">
              <input
                id="upload-publish"
                type="checkbox"
                checked={uploadIsPublished}
                onChange={(e) => setUploadIsPublished(e.target.checked)}
                className="w-4 h-4 text-[#C62828] rounded border-neutral-300 focus:ring-[#C62828]"
              />
              <label htmlFor="upload-publish" className="text-xs font-bold text-[#172B4D] cursor-pointer">
                ತಕ್ಷಣವೇ ಲೈವ್ ಪ್ರಕಟಿಸಿ (Publish Immediately to Readers)
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => setActiveTab("manage")}
                className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
              >
                ರದ್ದುಮಾಡಿ (Cancel)
              </button>

              <button
                type="submit"
                disabled={uploading}
                className="px-6 py-2.5 bg-[#C62828] hover:bg-[#B71C1C] disabled:bg-neutral-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>ಅಪ್‌ಲೋಡ್ ಆಗುತ್ತಿದೆ...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>ಪತ್ರಿಕೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (Upload & Save)</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 6. EDIT PAPER MODAL */}
      {editingEdition && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-bold text-[#172B4D] flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#C62828]" />
                <span>ಪತ್ರಿಕೆ ವಿವರ ತಿದ್ದುಪಡಿ (Edit Edition)</span>
              </h3>
              <button
                type="button"
                onClick={() => setEditingEdition(null)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">ಶೀರ್ಷಿಕೆ (Title)</label>
                <input
                  type="text"
                  required
                  value={editingEdition.title}
                  onChange={(e) =>
                    setEditingEdition({ ...editingEdition, title: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[#C62828]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">ಸಂಪುಟ</label>
                  <input
                    type="number"
                    min={1}
                    value={editingEdition.volumeNumber ?? 1}
                    onChange={(e) =>
                      setEditingEdition({
                        ...editingEdition,
                        volumeNumber: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">ಸಂಚಿಕೆ</label>
                  <input
                    type="number"
                    min={1}
                    value={editingEdition.issueNumber ?? 1}
                    onChange={(e) =>
                      setEditingEdition({
                        ...editingEdition,
                        issueNumber: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-neutral-700">ಪುಟಗಳು</label>
                  <input
                    type="number"
                    min={1}
                    value={editingEdition.totalPages}
                    onChange={(e) =>
                      setEditingEdition({
                        ...editingEdition,
                        totalPages: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">ವಿವರಣೆ (Description)</label>
                <textarea
                  rows={3}
                  value={editingEdition.description || ""}
                  onChange={(e) =>
                    setEditingEdition({
                      ...editingEdition,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="edit-publish"
                  type="checkbox"
                  checked={editingEdition.isPublished}
                  onChange={(e) =>
                    setEditingEdition({
                      ...editingEdition,
                      isPublished: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-[#C62828] rounded border-neutral-300"
                />
                <label htmlFor="edit-publish" className="text-xs font-bold text-neutral-700 cursor-pointer">
                  ಪ್ರಕಟಿತ ಸ್ಥಿತಿ (Published / Live)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setEditingEdition(null)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-lg cursor-pointer"
                >
                  ರದ್ದುಮಾಡಿ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>ಬದಲಾವಣೆ ಉಳಿಸಿ (Save)</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
