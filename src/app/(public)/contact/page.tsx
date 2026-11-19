"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Send, Clock, AlertCircle, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="space-y-10 py-6 sm:py-8 w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-[#5A6A85]">
        <Link href="/" className="hover:text-[#C62828] transition-colors">
          ಮುಖಪುಟ
        </Link>
        <span>/</span>
        <span className="text-[#172B4D] font-semibold">ಸಂಪರ್ಕಿಸಿ</span>
      </div>

      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-7 bg-[#C62828] rounded-full"></div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#172B4D] tracking-tight">
            ಸಂಪರ್ಕಿಸಿ & ಪ್ರತಿಕ್ರಿಯಿಸಿ
          </h1>
        </div>
        <p className="text-xs sm:text-sm text-[#5A6A85] mt-1">
          ನ್ಯಾಯ ಘರ್ಜನೆ ಪತ್ರಿಕೆಯ ಸಂಪಾದಕೀಯ ಮಂಡಳಿ ಹಾಗೂ ಕಚೇರಿಯ ಸಂಪರ್ಕ ವಿವರಗಳು
        </p>
      </div>

      {/* Notice Banner */}
      <div className="bg-blue-50 border border-blue-200 text-[#172B4D] rounded-lg p-4 flex items-start gap-3 text-xs leading-relaxed">
        <AlertCircle className="w-4 h-4 text-[#C62828] shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold">ಗಮನಿಸಿ:</strong> ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿಯ ವರದಿಗಳು, ಜಾಹೀರಾತು ಅಥವಾ ಪ್ರತಿಕ್ರಿಯೆಗಳಿಗಾಗಿ ಕೆಳಗಿನ ವಿವರಗಳ ಮೂಲಕ ಸಂಪರ್ಕಿಸಬಹುದು.
        </div>
      </div>

      {/* Main Grid: Info + Form */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Contact Information Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="border-b border-[#E2E8F0] pb-3">
              <div>
                <h2 className="text-lg font-bold text-[#172B4D]">
                  ಕಚೇರಿ ಸಂಪರ್ಕ ವಿವರಗಳು
                </h2>
                <p className="text-xs text-[#5A6A85]">
                  ನ್ಯಾಯ ಘರ್ಜನೆ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ ಕಾರ್ಯಾಲಯ
                </p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-[#5A6A85]">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-50 text-[#C62828] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#172B4D]">ಕಚೇರಿ ವಿಳಾಸ (ಮಾದರಿ):</h4>
                  <p className="mt-0.5 leading-relaxed">
                    ನ್ಯಾಯ ಘರ್ಜನೆ ಭವನ, ಮುಖ್ಯ ರಸ್ತೆ,<br />
                    ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ - ೫೬೦೦೦೧ <span className="text-neutral-400 font-medium">(ಮಾದರಿ ವಿಳಾಸ / Placeholder)</span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#172B4D] flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#172B4D]">ಇ-ಮೇಲ್ (ಮಾದರಿ):</h4>
                  <p className="mt-0.5">contact@nyaayagharjane.com <span className="text-neutral-400 font-medium">(ಮಾದರಿ ಇಮೇಲ್)</span></p>
                  <p className="text-[11px] text-neutral-400">editor@nyaayagharjane.com (ಸಂಪಾದಕೀಯ ವಿಭಾಗ)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#172B4D]">ದೂರವಾಣಿ ಸಂಖ್ಯೆ (ಮಾದರಿ):</h4>
                  <p className="mt-0.5">+91 00000 00000 <span className="text-neutral-400 font-medium">(ಮಾದರಿ ಸಂಖ್ಯೆ / Placeholder)</span></p>
                  <p className="text-[11px] text-neutral-400">ಸೋಮವಾರದಿಂದ ಶನಿವಾರ (ಬೆಳಿಗ್ಗೆ ೧೦ ರಿಂದ ಸಂಜೆ ೬ ರವರೆಗೆ)</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-[#172B4D]">ಮಾಸಿಕ ಪ್ರಕಟಣಾ ದಿನ:</h4>
                  <p className="mt-0.5">ಪ್ರತಿ ತಿಂಗಳ ೧ ನೇ ತಾರೀಖು ಹೊಸ ಸಂಚಿಕೆ ಪ್ರಕಟಗೊಳ್ಳುತ್ತದೆ.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback / News Tip Submission Form (Marked as layout preview) */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-lg font-bold text-[#172B4D]">
                ಸುದ್ದಿ ಸುಳಿವು & ಸಂದೇಶ ಕಳುಹಿಸಿ
              </h2>
              <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-200">
                ನಮೂನೆ ಮುನ್ನೋಟ
              </span>
            </div>
            <p className="text-xs text-[#5A6A85] mb-6">
              ಸಾರ್ವಜನಿಕ ಸಮಸ್ಯೆಗಳು, ಲೇಖನಗಳು ಅಥವಾ ಪತ್ರಿಕೆಯ ಕುರಿತು ನಿಮ್ಮ ಅನಿಸಿಕೆಗಳನ್ನು ನಮ್ಮೊಂದಿಗೆ ಹಂಚಿಕೊಳ್ಳಿ (ವಿನ್ಯಾಸ ಮುನ್ನೋಟ).
            </p>

            {submitted ? (
              <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-3">
                <CheckCircle className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-base font-bold text-emerald-900">
                  ಧನ್ಯವಾದಗಳು! ನಿಮ್ಮ ಸಂದೇಶ ದಾಖಲಾಗಿದೆ.
                </h3>
                <p className="text-xs text-emerald-700 max-w-sm mx-auto">
                  (ಇದು ಡೆವಲಪ್‌ಮೆಂಟ್ ಹಂತದ ಪರೀಕ್ಷಾ ನಮೂನೆಯಾಗಿದೆ. ಮುಂದಿನ ಹಂತದಲ್ಲಿ ನೇರ ಇಮೇಲ್ ಹಾಗೂ ಡಾಟಾಬೇಸ್ ಸೌಲಭ್ಯ ಅಳವಡಿಸಲಾಗುವುದು.)
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-2 text-xs font-bold text-emerald-800 underline"
                >
                  ಮತ್ತೊಂದು ಸಂದೇಶ ಕಳುಹಿಸಿ
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#172B4D]">
                      ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರು <span className="text-[#C62828]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ಉದಾ: ರಮೇಶ್ ಕುಮಾರ್"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#C62828] text-[#172B4D]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[#172B4D]">
                      ದೂರವಾಣಿ / ಮೊಬೈಲ್ ಸಂಖ್ಯೆ
                    </label>
                    <input
                      type="tel"
                      placeholder="ಉದಾ: +91 98765 00000"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#C62828] text-[#172B4D]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#172B4D]">
                    ಇ-ಮೇಲ್ ವಿಳಾಸ <span className="text-[#C62828]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="ಉದಾ: name@example.com"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#C62828] text-[#172B4D]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#172B4D]">
                    ವಿಷಯ / ಸುದ್ದಿ ಶೀರ್ಷಿಕೆ
                  </label>
                  <input
                    type="text"
                    placeholder="ಸಂದೇಶದ ಸಾರಾಂಶ"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#C62828] text-[#172B4D]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#172B4D]">
                    ನಿಮ್ಮ ಸಂದೇಶ ಅಥವಾ ಸುದ್ದಿ ಸುಳಿವು <span className="text-[#C62828]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="ನಿಮ್ಮ ವಿವರವಾದ ಸಂದೇಶವನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ..."
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-[#F8F9FA] border border-[#E2E8F0] rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#C62828] text-[#172B4D]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>ಸಂದೇಶ ಕಳುಹಿಸಿ (ಪರೀಕ್ಷಾರ್ಥ ನಮೂನೆ)</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
