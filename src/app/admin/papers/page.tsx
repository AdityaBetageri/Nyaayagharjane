"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  BookOpen,
  Calendar,
  Search,
  CheckCircle2,
  Trash2,
  Edit3,
  RefreshCw,
  ExternalLink,
  X,
  Save,
  Plus,
} from "lucide-react";
import { ConfirmationModal } from "@/components/admin/ConfirmationModal";
import {
  getStoredEditions,
  updateStoredEdition,
  deleteStoredEdition,
  togglePublishStoredEdition,
} from "@/lib/editionsStore";
import { fetchR2Catalogue, r2ItemToEdition } from "@/lib/r2Service";
import { Edition } from "@/types";

export default function AdminPapersPage() {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "published" | "draft">("all");
  const [editingEdition, setEditingEdition] = useState<Edition | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Edition | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteNotice, setDeleteNotice] = useState<string | null>(null);

  const loadData = () => {
    Promise.resolve().then(() => {
      setEditions(getStoredEditions());
      fetchR2Catalogue({ bypassCache: false, publishedOnly: false }).then((res) => {
        if (res.success && res.data.length > 0) {
          setEditions(res.data.map(r2ItemToEdition));
        }
      });
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalEditions = editions.length;
  const publishedEditions = editions.filter((e) => e.isPublished).length;
  const draftEditions = totalEditions - publishedEditions;

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

  const handleTogglePublish = (id: string) => {
    const updated = togglePublishStoredEdition(id);
    setEditions(updated);

    const target = updated.find((e) => e.id === id);
    if (target) {
      fetch("/api/r2/catalogue/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newItem: {
            id: target.id,
            title: target.title,
            language: target.language || "Kannada",
            edition: target.edition || "State Edition",
            month: target.issueNumber || 1,
            year: target.editionYear,
            fileName: target.fileName || `${target.id}.pdf`,
            pdfUrl: target.pdfUrl || "",
            publishedAt: target.publishedAt || new Date().toISOString().split("T")[0],
            status: target.isPublished ? "published" : "draft",
            totalPages: target.totalPages,
            formattedFileSize: target.formattedFileSize,
            description: target.description,
          },
        }),
      }).catch(() => {});
    }
  };

  const handleDeleteClick = (edition: Edition) => {
    setDeleteTarget(edition);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    setDeleteNotice(null);

    try {
      const res = await fetch("/api/r2/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: deleteTarget.id,
          fileName: deleteTarget.fileName,
          pdfUrl: deleteTarget.pdfUrl,
          year: deleteTarget.editionYear,
          month: deleteTarget.issueNumber,
          deleteFile: true,
        }),
      });

      const data = await res.json();
      const updated = deleteStoredEdition(deleteTarget.id);
      setEditions(updated);

      if (data.success) {
        setDeleteNotice(
          `"${deleteTarget.title}" ಪತ್ರಿಕೆ ಮತ್ತು ಸಂಬಂಧಿತ PDF ಫೈಲ್ ಅನ್ನು ಡೇಟಾಬೇಸ್ ಹಾಗೂ R2 ನಿಂದ ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ.`
        );
      } else {
        setDeleteNotice(
          `ಸ್ಥಳೀಯ ಪಟ್ಟಿಯಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ. (${data.message || "R2 ಸಿಂಕ್ ವಿಫಲ"})`
        );
      }
    } catch {
      const updated = deleteStoredEdition(deleteTarget.id);
      setEditions(updated);
      setDeleteNotice(`"${deleteTarget.title}" ಸ್ಥಳೀಯ ಪಟ್ಟಿಯಿಂದ ತೆಗೆದುಹಾಕಲಾಗಿದೆ.`);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEdition) return;

    if (!editingEdition.title.trim()) {
      setEditError("ಪತ್ರಿಕೆಯ ಶೀರ್ಷಿಕೆ ಕಡ್ಡಾಯವಾಗಿದೆ.");
      return;
    }

    if (!editingEdition.totalPages || editingEdition.totalPages < 1) {
      setEditError("ಒಟ್ಟು ಪುಟಗಳು ಕನಿಷ್ಠ ೧ ಆಗಿರಬೇಕು.");
      return;
    }

    setEditError(null);
    const updated = updateStoredEdition(editingEdition.id, {
      title: editingEdition.title.trim(),
      volumeNumber: editingEdition.volumeNumber,
      issueNumber: editingEdition.issueNumber,
      totalPages: editingEdition.totalPages,
      description: editingEdition.description?.trim(),
      isPublished: editingEdition.isPublished,
      pdfUrl: editingEdition.pdfUrl?.trim(),
    });
    setEditions(updated);

    // Sync edited record to R2 catalogue
    fetch("/api/r2/catalogue/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        newItem: {
          id: editingEdition.id,
          title: editingEdition.title.trim(),
          language: editingEdition.language || "Kannada",
          edition: editingEdition.edition || "State Edition",
          month: editingEdition.issueNumber || 1,
          year: editingEdition.editionYear,
          fileName: editingEdition.fileName || `${editingEdition.id}.pdf`,
          pdfUrl: editingEdition.pdfUrl?.trim() || "",
          publishedAt: editingEdition.publishedAt || new Date().toISOString().split("T")[0],
          status: editingEdition.isPublished ? "published" : "draft",
          totalPages: editingEdition.totalPages,
          formattedFileSize: editingEdition.formattedFileSize,
          description: editingEdition.description?.trim(),
        },
      }),
    }).catch(() => {});

    setEditingEdition(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#172B4D]">
              ಪತ್ರಿಕೆಗಳ ಪೂರ್ಣ ನಿರ್ವಹಣೆ (Manage Papers)
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              {editions.length} ಸಂಚಿಕೆಗಳು
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5A6A85] mt-1">
            ಎಲ್ಲಾ ಮಾಸಿಕ ಪತ್ರಿಕೆಗಳ ಪಟ್ಟಿ. ಪ್ರಕಟಣೆ, ತಿದ್ದುಪಡಿ, ಪೂರ್ವವೀಕ್ಷಣೆ ಮತ್ತು ನಿರ್ವಹಣೆ.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/upload"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>ಹೊಸ ಪತ್ರಿಕೆ ಸೇರಿಸಿ</span>
          </Link>

          <button
            type="button"
            onClick={loadData}
            title="ದತ್ತಾಂಶ ರಿಫ್ರೆಶ್ ಮಾಡಿ"
            className="p-2 text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
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

        <div className="flex items-center gap-1.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === "all"
                ? "bg-[#172B4D] text-white"
                : "bg-[#F8F9FA] text-[#5A6A85] hover:bg-neutral-200"
            }`}
          >
            ಎಲ್ಲಾ ({totalEditions})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("published")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              statusFilter === "published"
                ? "bg-emerald-700 text-white"
                : "bg-[#F8F9FA] text-[#5A6A85] hover:bg-neutral-200"
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
                : "bg-[#F8F9FA] text-[#5A6A85] hover:bg-neutral-200"
            }`}
          >
            ಕರಡು ({draftEditions})
          </button>
        </div>
      </div>

      {/* Delete Notice Banner */}
      {deleteNotice && (
        <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs sm:text-sm font-semibold text-emerald-800 shadow-xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{deleteNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setDeleteNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 rounded-md cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#F8F9FA] border-b border-[#E2E8F0] text-neutral-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">ಸಂಚಿಕೆ ವಿವರಗಳು</th>
                <th className="py-3.5 px-4">ಪ್ರಕಟಣಾ ಮಾಹೆ</th>
                <th className="py-3.5 px-4">R2 ಮೂಲ / PDF</th>
                <th className="py-3.5 px-4 text-center">ಸ್ಥಿತಿ</th>
                <th className="py-3.5 px-4 text-right">ಕ್ರಮಗಳು (Actions)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filteredEditions.length > 0 ? (
                filteredEditions.map((edition) => (
                  <tr key={edition.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#172B4D]">{edition.title}</div>
                      <div className="text-[11px] text-[#5A6A85] flex items-center gap-2 mt-0.5">
                        <span>{edition.edition || "ರಾಜ್ಯ ಆವೃತ್ತಿ"}</span>
                        <span>•</span>
                        <span>{edition.totalPages} ಪುಟಗಳು</span>
                        <span>•</span>
                        <span>{edition.formattedFileSize || "೧೨.೪ MB"}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-[#172B4D] font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#C62828]" />
                        <span>{edition.formattedDate}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      {edition.pdfUrl && edition.pdfUrl.startsWith("http") ? (
                        <a
                          href={edition.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-700 hover:text-emerald-900 font-mono text-xs flex items-center gap-1 max-w-xs truncate"
                          title={edition.pdfUrl}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{edition.pdfUrl}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ) : (
                        <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[11px] font-medium border border-amber-200">
                          ಸ್ಥಳೀಯ ಮಾದರಿ ಮುನ್ನೋಟ
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(edition.id)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          edition.isPublished
                            ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            edition.isPublished ? "bg-emerald-600" : "bg-neutral-400"
                          }`}
                        />
                        <span>{edition.isPublished ? "ಪ್ರಕಟಿತ (Live)" : "ಕರಡು (Draft)"}</span>
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/reader/${edition.id}`}
                          target="_blank"
                          className="p-1.5 text-neutral-600 hover:text-[#172B4D] hover:bg-neutral-100 rounded-lg transition-colors"
                          title="ವಾಚಕದಲ್ಲಿ ನೋಡಿ"
                        >
                          <BookOpen className="w-4 h-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => setEditingEdition(edition)}
                          className="p-1.5 text-neutral-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="ತಿದ್ದುಪಡಿ ಮಾಡಿ"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => handleDeleteClick(edition)}
                          className="p-1.5 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                          title="ಡೇಟಾಬೇಸ್ ಮತ್ತು R2 ನಿಂದ ಶಾಶ್ವತವಾಗಿ ತೆಗೆದುಹಾಕಿ"
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
                      ಹೊಸ ಪತ್ರಿಕೆ ಸೇರಿಸಲು ಮೇಲಿನ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Paper Modal */}
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
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-xs text-red-800 font-semibold">
                  {editError}
                </div>
              )}
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

              <div className="space-y-1">
                <label className="block text-xs font-bold text-neutral-700">
                  R2 PDF ವಿಳಾಸ (Public PDF URL)
                </label>
                <input
                  type="text"
                  value={editingEdition.pdfUrl || ""}
                  onChange={(e) =>
                    setEditingEdition({ ...editingEdition, pdfUrl: e.target.value })
                  }
                  placeholder="https://files.yourdomain.com/newspapers/2026/11-november/kannada.pdf"
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-lg font-mono text-xs"
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
                  className="w-4 h-4 text-[#C62828] rounded border-neutral-300 cursor-pointer"
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
      {/* Custom Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => !isDeleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="ಪತ್ರಿಕೆ ಶಾಶ್ವತ ಅಳಿಸುವಿಕೆ (Confirm Delete)"
        description={
          deleteTarget ? (
            <div className="space-y-2">
              <p>
                <strong className="text-neutral-800">&ldquo;{deleteTarget.title}&rdquo;</strong> ಪತ್ರಿಕೆಯನ್ನು ಅಳಿಸಲು ಬಯಸುವಿರಾ?
              </p>
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1">
                <p className="font-bold">⚠️ ಈ ಕ್ರಿಯೆಯನ್ನು ಹಿಂಪಡೆಯಲು ಸಾಧ್ಯವಿಲ್ಲ:</p>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-red-700">
                  <li>Cloudflare R2 ಬಕೆಟ್‌ನಿಂದ PDF ಫೈಲ್ ಅಳಿಸಿಹೋಗುತ್ತದೆ.</li>
                  <li>ಆನ್‌ಲೈನ್ ಡೇಟಾಬೇಸ್ ಮತ್ತು ಕ್ಯಾಟಲಾಗ್‌ನಿಂದ ವಿವರಗಳು ರದ್ದಾಗುತ್ತವೆ.</li>
                </ul>
              </div>
            </div>
          ) : ""
        }
        confirmText={isDeleting ? "ಅಳಿಸಲಾಗುತ್ತಿದೆ..." : "ಹೌದು, ಶಾಶ್ವತವಾಗಿ ಅಳಿಸಿ"}
        cancelText="ರದ್ದುಗೊಳಿಸಿ"
        variant="danger"
        iconType="trash"
        isLoading={isDeleting}
      />
    </div>
  );
}
