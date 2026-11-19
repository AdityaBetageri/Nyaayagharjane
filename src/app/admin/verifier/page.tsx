"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Globe,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FolderTree,
  ExternalLink,
  Database,
  FileCheck,
  UploadCloud,
  Loader2,
} from "lucide-react";
import { getR2PublicUrl, testR2Connection } from "@/lib/r2Service";

export default function AdminVerifierPage() {
  const [r2Url, setR2Url] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const [testResult, setTestResult] = useState<{
    tested: boolean;
    loading: boolean;
    ok: boolean;
    status: number;
    url: string;
    itemCount: number;
    durationMs: number;
    error?: string;
    s3Status?: {
      configured: boolean;
      bucketName: string;
      catalogueFound: boolean;
      itemCount: number;
      ok: boolean;
      error: string | null;
    };
    pdfCheck?: {
      ok: boolean;
      status: number;
      url: string;
      error?: string;
    } | null;
  }>({
    tested: false,
    loading: false,
    ok: false,
    status: 0,
    url: "",
    itemCount: 0,
    durationMs: 0,
  });

  useEffect(() => {
    Promise.resolve().then(() => {
      setR2Url(getR2PublicUrl());
    });
  }, []);

  const handleRunR2Test = async () => {
    setTestResult({
      tested: false,
      loading: true,
      ok: false,
      status: 0,
      url: "",
      itemCount: 0,
      durationMs: 0,
    });
    setSyncMessage(null);

    const res = await testR2Connection(r2Url);
    setTestResult({
      tested: true,
      loading: false,
      ok: res.ok,
      status: res.status,
      url: res.url,
      itemCount: res.itemCount,
      durationMs: res.durationMs,
      error: res.error,
      s3Status: res.s3Status,
      pdfCheck: res.pdfCheck,
    });
  };

  const handleSyncCatalogue = async () => {
    setIsSyncing(true);
    setSyncMessage(null);

    try {
      // 1. Fetch current local catalogue
      const localRes = await fetch("/data/newspapers.json");
      const localData = await localRes.json();

      // 2. Push to R2 via update API
      const pushRes = await fetch("/api/r2/catalogue/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullCatalogue: localData,
        }),
      });

      const pushData = await pushRes.json();
      if (pushData.success) {
        setSyncMessage("ಕ್ಯಾಟಲಾಗ್ ಯಶಸ್ವಿಯಾಗಿ ಡೇಟಾಬೇಸ್‌ಗೆ ಸಿಂಕ್ ಆಗಿದೆ! ಮರುಪರೀಕ್ಷಿಸಲಾಗುತ್ತಿದೆ...");
        await handleRunR2Test();
      } else {
        setSyncMessage(`ಸಿಂಕ್ ವಿಫಲವಾಗಿದೆ: ${pushData.message || "ಡೇಟಾಬೇಸ್ ದೋಷ"}`);
      }
    } catch (err) {
      setSyncMessage(
        `ಸಿಂಕ್ ವಿಫಲವಾಗಿದೆ: ${err instanceof Error ? err.message : "ದೋಷ ಸಂಭವಿಸಿದೆ"}`
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#C62828]">
            <Globe className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <h1 className="text-base sm:text-xl font-black text-[#172B4D]">
              ಡೇಟಾಬೇಸ್ ಮತ್ತು ಸಂಗ್ರಹಣಾ ಪರಿಶೀಲನೆ (Connectivity Tester)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#5A6A85] mt-1">
            ನಿಮ್ಮ ಆನ್‌ಲೈನ್ ಸಂಗ್ರಹಣಾ ಡೊಮೈನ್, ಬಕೆಟ್ ಮತ್ತು <code>data/newspapers.json</code> ಲಭ್ಯತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.
          </p>
        </div>

        <Link
          href="/admin/guide"
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-[#172B4D] text-xs font-bold rounded-xl transition-colors shrink-0"
        >
          <FolderTree className="w-4 h-4" />
          <span>ಪ್ರಕಟಣಾ ಮಾರ್ಗದರ್ಶಿ</span>
        </Link>
      </div>

      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#172B4D]">
            ಸಾರ್ವಜನಿಕ ಸಂಗ್ರಹಣಾ ಡೊಮೈನ್ ಅಥವಾ PDF ವಿಳಾಸ (Domain / PDF URL)
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={r2Url}
              onChange={(e) => setR2Url(e.target.value)}
              placeholder="https://storage.yourdomain.com ಅಥವಾ PDF URL"
              className="flex-1 px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8F9FA] border border-neutral-300 rounded-xl text-[#172B4D] font-mono focus:border-[#172B4D] transition-colors"
            />
            <button
              type="button"
              disabled={testResult.loading}
              onClick={handleRunR2Test}
              className="px-5 py-2.5 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs sm:text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shrink-0 shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${testResult.loading ? "animate-spin" : ""}`} />
              <span>{testResult.loading ? "ಪರೀಕ್ಷಿಸಲಾಗುತ್ತಿದೆ..." : "ಸಂಪರ್ಕ ಪರೀಕ್ಷಿಸಿ"}</span>
            </button>
          </div>
          <p className="text-[11px] text-[#5A6A85]">
            ಕೇವಲ ಡೊಮೈನ್ ವಿಳಾಸ ಅಥವಾ ನಿರ್ದಿಷ್ಟ PDF ಫೈಲ್ ಲಿಂಕ್ (ಉದಾ: <code>.../newspaper.pdf</code>) ಎರಡನ್ನೂ ಸ್ವಯಂಚಾಲಿತವಾಗಿ ಗುರುತಿಸಿ ಪರೀಕ್ಷಿಸುತ್ತದೆ.
          </p>
        </div>

        {/* Sync message alert */}
        {syncMessage && (
          <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-900 flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{syncMessage}</span>
          </div>
        )}

        {/* Test Results Display */}
        {testResult.tested && (
          <div className="space-y-4">
            {/* 1. S3 Storage Bucket Status Card */}
            <div className="p-4 sm:p-5 rounded-2xl border bg-[#F8F9FA] border-[#E2E8F0] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-[#172B4D]">
                  <Database className="w-4 h-4 text-purple-600" />
                  <span>ಡೇಟಾಬೇಸ್ ಸಂಗ್ರಹಣಾ ಬಕೆಟ್ ಸ್ಥಿತಿ (Storage Bucket: {testResult.s3Status?.bucketName || "naresh"})</span>
                </div>
                {testResult.s3Status?.ok ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>ಬಕೆಟ್ ಸಂಪರ್ಕಿತ</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-600" />
                    <span>ಪರಿಶೀಲನೆ ಅಗತ್ಯ</span>
                  </span>
                )}
              </div>

              <div className="text-xs space-y-1 text-[#5A6A85]">
                <p>
                  <strong>ಕ್ಯಾಟಲಾಗ್ ಫೈಲ್ (data/newspapers.json):</strong>{" "}
                  {testResult.s3Status?.catalogueFound ? (
                    <span className="text-emerald-700 font-bold">
                      ಲಭ್ಯವಿದೆ ({testResult.s3Status.itemCount} ಪತ್ರಿಕೆಗಳು ದಾಖಲಾಗಿವೆ)
                    </span>
                  ) : (
                    <span className="text-amber-700 font-bold">
                      ಇನ್ನೂ ಡೇಟಾಬೇಸ್ ಬಕೆಟ್‌ನಲ್ಲಿ ಕಂಡುಬಂದಿಲ್ಲ
                    </span>
                  )}
                </p>
                {testResult.s3Status?.error && (
                  <p className="text-red-600 font-mono text-[11px]">{testResult.s3Status.error}</p>
                )}
              </div>

              {/* Sync Button if needed */}
              {(!testResult.s3Status?.catalogueFound || testResult.s3Status.itemCount === 0) && (
                <div className="pt-2">
                  <button
                    type="button"
                    disabled={isSyncing}
                    onClick={handleSyncCatalogue}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#172B4D] hover:bg-[#091E42] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isSyncing ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <UploadCloud className="w-3.5 h-3.5" />
                    )}
                    <span>ಸ್ಥಳೀಯ ಕ್ಯಾಟಲಾಗ್ ಅನ್ನು ಡೇಟಾಬೇಸ್‌ಗೆ ಈಗಲೇ ಸಿಂಕ್ ಮಾಡಿ (Sync Catalogue)</span>
                  </button>
                </div>
              )}
            </div>

            {/* 2. Public CDN / Custom Domain Status Card */}
            <div
              className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
                testResult.ok
                  ? "bg-emerald-50 border-emerald-300 text-emerald-950"
                  : "bg-red-50 border-red-300 text-red-950"
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
                {testResult.ok ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>ಸಾರ್ವಜನಿಕ ಡೊಮೈನ್ ಸಂಪರ್ಕ ಯಶಸ್ವಿಯಾಗಿದೆ (HTTP {testResult.status})</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>ಸಾರ್ವಜನಿಕ ಪ್ರವೇಶ ವಿಫಲವಾಗಿದೆ ({testResult.error || "Connection Failed"})</span>
                  </>
                )}
              </div>

              <div className="text-xs space-y-1.5 font-mono bg-white/70 p-3 rounded-xl border border-black/5">
                <div className="break-all">
                  <span className="font-sans font-bold text-neutral-600">ಪರೀಕ್ಷಿತ ಕ್ಯಾಟಲಾಗ್ ವಿಳಾಸ:</span>{" "}
                  <a
                    href={testResult.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-700 inline-flex items-center gap-1"
                  >
                    {testResult.url}
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>
                <div>
                  <span className="font-sans font-bold text-neutral-600">ಪ್ರತಿಕ್ರಿಯೆ ಸಮಯ:</span>{" "}
                  {testResult.durationMs} ms
                </div>
                {testResult.itemCount > 0 && (
                  <div className="text-emerald-800 font-bold font-sans">
                    ಸಾರ್ವಜನಿಕವಾಗಿ ದೊರೆತ ಪತ್ರಿಕೆಗಳು: {testResult.itemCount}
                  </div>
                )}
              </div>

              {/* 3. Specific PDF check if applicable */}
              {testResult.pdfCheck && (
                <div className="p-3 bg-white/80 rounded-xl border border-black/5 text-xs font-mono space-y-1">
                  <div className="flex items-center gap-1.5 font-sans font-bold text-[#172B4D]">
                    <FileCheck className="w-4 h-4 text-blue-600" />
                    <span>ನಿರ್ದಿಷ್ಟ PDF ಫೈಲ್ ತಪಾಸಣೆ:</span>
                  </div>
                  <div className="break-all">{testResult.pdfCheck.url}</div>
                  <div className="font-sans font-semibold">
                    ಸ್ಥಿತಿ:{" "}
                    {testResult.pdfCheck.ok ? (
                      <span className="text-emerald-700 font-bold">ಫೈಲ್ ತೆರೆಯುತ್ತದೆ (HTTP 200)</span>
                    ) : (
                      <span className="text-red-700 font-bold">
                        ಫೈಲ್ ತೆರೆಯುತ್ತಿಲ್ಲ ({testResult.pdfCheck.error || "ಕಂಡುಬಂದಿಲ್ಲ"})
                      </span>
                    )}
                  </div>
                </div>
              )}

              {!testResult.ok && (
                <div className="text-xs text-red-900 pt-2 border-t border-red-200">
                  <strong>ಪರಿಹಾರ ಕ್ರಮಗಳು:</strong>
                  <ul className="list-disc pl-5 mt-1 space-y-1 text-red-800">
                    <li>ಕ್ಲೌಡ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ನಲ್ಲಿ ಬಕೆಟ್ ಸೆಟ್ಟಿಂಗ್ಸ್‌ಗೆ ಹೋಗಿ (Settings -&gt; Public Access).</li>
                    <li>ಅಲ್ಲಿ ಸಾರ್ವಜನಿಕ ಡೊಮೈನ್ ಸಕ್ರಿಯಗೊಳಿಸಿ ಅಥವಾ Custom Domain ಸಂಪರ್ಕಿಸಿ.</li>
                    <li><code>.env.local</code> ನಲ್ಲಿ ಸರಿಯಾದ ಡೊಮೈನ್ ವಿಳಾಸ ನೀಡಲಾಗಿದೆಯೇ ಎಂದು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

