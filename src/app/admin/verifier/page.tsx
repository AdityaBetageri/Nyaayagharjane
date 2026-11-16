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
} from "lucide-react";
import { getR2PublicUrl, testR2Connection } from "@/lib/r2Service";

export default function AdminVerifierPage() {
  const [r2Url, setR2Url] = useState("");
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    loading: boolean;
    ok: boolean;
    status: number;
    url: string;
    itemCount: number;
    durationMs: number;
    error?: string;
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
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#C62828]">
            <Globe className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <h1 className="text-base sm:text-xl font-black text-[#172B4D]">
              Cloudflare R2 ಸಂಪರ್ಕ ಮತ್ತು ಪರಿಶೀಲನೆ (Connectivity Tester)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#5A6A85] mt-1">
            ನಿಮ್ಮ ಕಸ್ಟಮ್ ಡೊಮೈನ್ ಮತ್ತು <code>data/newspapers.json</code> ಸಾರ್ವಜನಿಕವಾಗಿ ಲಭ್ಯವಿದೆಯೇ ಎಂದು ಪರೀಕ್ಷಿಸಿ.
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

      <div className="space-y-4">
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-[#172B4D]">
            Cloudflare R2 ಸಾರ್ವಜನಿಕ ಡೊಮೈನ್ URL
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              value={r2Url}
              onChange={(e) => setR2Url(e.target.value)}
              placeholder="https://files.yourdomain.com"
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
            ಇದು <code>.env.local</code> ನಲ್ಲಿರುವ <code>NEXT_PUBLIC_R2_PUBLIC_URL</code> ನ ಮೌಲ್ಯವಾಗಿದೆ.
          </p>
        </div>

        {/* Test Results Display */}
        {testResult.tested && (
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
                  <span>ಸಂಪರ್ಕ ಯಶಸ್ವಿಯಾಗಿದೆ (HTTP {testResult.status})</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>ಸಂಪರ್ಕ ವಿಫಲವಾಗಿದೆ ({testResult.error || "Connection Failed"})</span>
                </>
              )}
            </div>

            <div className="text-xs space-y-1.5 font-mono bg-white/70 p-3 rounded-xl border border-black/5">
              <div className="break-all">
                <span className="font-sans font-bold text-neutral-600">ಪರೀಕ್ಷಿತ ವಿಳಾಸ:</span>{" "}
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
              {testResult.ok && (
                <div className="text-emerald-800 font-bold font-sans">
                  ಕ್ಯಾಟಲಾಗ್‌ನಲ್ಲಿ ಕಂಡುಬಂದ ಪತ್ರಿಕೆಗಳು: {testResult.itemCount}
                </div>
              )}
            </div>

            {!testResult.ok && (
              <div className="text-xs text-red-900 pt-2 border-t border-red-200">
                <strong>ಪರಿಹಾರ ಕ್ರಮಗಳು:</strong>
                <ul className="list-disc pl-5 mt-1 space-y-1 text-red-800">
                  <li>Cloudflare Dashboard ನಲ್ಲಿ R2 ಬಕೆಟ್‌ಗೆ Custom Domain ಸಂಪರ್ಕಗೊಂಡಿದೆಯೇ ಪರಿಶೀಲಿಸಿ.</li>
                  <li><code>data/newspapers.json</code> ಫೈಲ್ R2 ಬಕೆಟ್‌ನಲ್ಲಿ ಅಪ್‌ಲೋಡ್ ಆಗಿದೆಯೇ ಮತ್ತು ಸಾರ್ವಜನಿಕವಾಗಿ ತೆರೆಯುತ್ತದೆಯೇ ನೋಡಿ.</li>
                  <li>Cloudflare R2 CORS ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ <code>GET</code> ಮತ್ತು <code>HEAD</code> ಅನುಮತಿಸಲಾಗಿದೆಯೇ ಪರೀಕ್ಷಿಸಿ.</li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
