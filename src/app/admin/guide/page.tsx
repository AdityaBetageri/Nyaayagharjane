"use client";

import Link from "next/link";
import {
  Upload,
  ExternalLink,
  Zap,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

export default function AdminGuidePage() {
  return (
    <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#E2E8F0] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#C62828]">
            <Upload className="w-5 h-5 sm:w-6 sm:h-6 shrink-0" />
            <h1 className="text-base sm:text-xl font-black text-[#172B4D]">
              ಪತ್ರಿಕೆ ಅಪ್‌ಲೋಡ್ ಮತ್ತು ಪ್ರಕಟಣಾ ಮಾರ್ಗದರ್ಶಿ (Newspaper Upload Guide)
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-[#5A6A85] mt-1">
            ಹೊಸ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆಯನ್ನು ವೆಬ್‌ಸೈಟ್‌ಗೆ ಯಶಸ್ವಿಯಾಗಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಪ್ರಕಟಿಸುವ ಹಂತಗಳು.
          </p>
        </div>

        <Link
          href="/admin/upload"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-xs"
        >
          <Upload className="w-4 h-4" />
          <span>ಪತ್ರಿಕೆ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ</span>
        </Link>
      </div>

      {/* Quick Summary Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-red-50 to-amber-50 border-2 border-[#C62828]/25 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-[#172B4D]">
        <div className="flex items-start gap-3">
          <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-[#C62828] shrink-0 mt-0.5" />
          <div>
            <h3 className="font-black text-sm sm:text-base text-[#172B4D]">
              ಸ್ವಯಂಚಾಲಿತ ೧-ಕ್ಲಿಕ್ ಅಪ್‌ಲೋಡ್ ವ್ಯವಸ್ಥೆ
            </h3>
            <p className="text-xs text-[#5A6A85] mt-1 leading-relaxed">
              &ldquo;ಹೊಸ ಪತ್ರಿಕೆ ಅಪ್‌ಲೋಡ್&rdquo; ಪುಟದಲ್ಲಿ ಕೇವಲ PDF ಫೈಲ್ ಆಯ್ಕೆಮಾಡಿ ಅಪ್‌ಲೋಡ್ ಬಟನ್ ಒತ್ತಿದರೆ ಸಾಕು. ಪತ್ರಿಕೆಯು ಸುರಕ್ಷಿತವಾಗಿ ಅಪ್‌ಲೋಡ್ ಆಗಿ, ಕ್ಯಾಟಲಾಗ್ ತಂತಾನೇ ನವೀಕರಣಗೊಂಡು ಓದುಗರಿಗೆ ಪ್ರಕಟವಾಗುತ್ತದೆ.
            </p>
          </div>
        </div>

        <Link
          href="/admin/upload"
          className="inline-flex items-center gap-1 px-4 py-2 bg-[#172B4D] hover:bg-[#0F1C33] text-white text-xs font-bold rounded-xl shrink-0 transition-colors"
        >
          <span>ಅಪ್‌ಲೋಡ್ ಪುಟ</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Step 1 */}
      <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 bg-[#F8F9FA] space-y-2.5">
        <div className="flex items-center gap-2 font-black text-sm text-[#172B4D]">
          <span className="w-6 h-6 rounded-full bg-[#172B4D] text-white flex items-center justify-center text-xs shrink-0 font-bold">
            ೧
          </span>
          <span>ಹಂತ ೧: PDF ಫೈಲ್ ಆಯ್ಕೆಮಾಡುವುದು (Select PDF File)</span>
        </div>
        <div className="text-xs text-[#5A6A85] space-y-1.5 pl-0 sm:pl-8">
          <p>
            1. ನಿಮ್ಮ ಕಂಪ್ಯೂಟರ್‌ನಲ್ಲಿ ಸಿದ್ಧವಿರುವ ಪತ್ರಿಕೆಯ <strong>.pdf</strong> ಫೈಲ್ ಅನ್ನು ಆಯ್ಕೆಮಾಡಿ.
          </p>
          <p>
            2. ಫೈಲ್ ಆಯ್ಕೆಯಾದ ಕೂಡಲೇ ಅದರ ಗಾತ್ರ (MB) ಮತ್ತು ಹೆಸರು ತಾನಾಗಿಯೇ ಲೆಕ್ಕಹಾಕಲ್ಪಡುತ್ತದೆ.
          </p>
        </div>
      </div>

      {/* Step 2 */}
      <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 bg-[#F8F9FA] space-y-2.5">
        <div className="flex items-center gap-2 font-black text-sm text-[#172B4D]">
          <span className="w-6 h-6 rounded-full bg-[#172B4D] text-white flex items-center justify-center text-xs shrink-0 font-bold">
            ೨
          </span>
          <span>ಹಂತ ೨: ಸಂಚಿಕೆ ವಿವರಗಳ ಪರಿಶೀಲನೆ (Fill Details)</span>
        </div>
        <div className="text-xs text-[#5A6A85] space-y-1.5 pl-0 sm:pl-8">
          <p>ಫಾರ್ಮ್‌ನಲ್ಲಿ ಅಗತ್ಯವಿರುವ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ ಅಥವಾ ನಮೂದಿಸಿ:</p>
          <ul className="list-disc pl-5 space-y-1 text-neutral-700">
            <li><strong>ಪತ್ರಿಕೆಯ ಶೀರ್ಷಿಕೆ:</strong> ತಿಂಗಳು ಮತ್ತು ವರ್ಷ ಆಯ್ಕೆಮಾಡಿದಂತೆ ತಾನಾಗಿಯೇ ನವೀಕರಣಗೊಳ್ಳುತ್ತದೆ.</li>
            <li><strong>ವರ್ಷ & ತಿಂಗಳು:</strong> ಪ್ರಕಟವಾಗುತ್ತಿರುವ ಸರಿಯಾದ ತಿಂಗಳು ಮತ್ತು ವರ್ಷವನ್ನು ಆರಿಸಿ.</li>
            <li><strong>ಆವೃತ್ತಿ & ಭಾಷೆ:</strong> ರಾಜ್ಯ ಆವೃತ್ತಿ ಅಥವಾ ಜಿಲ್ಲಾ ಆವೃತ್ತಿ ಮತ್ತು ಭಾಷೆಯನ್ನು ಖಚಿತಪಡಿಸಿ.</li>
            <li><strong>ಒಟ್ಟು ಪುಟಗಳು:</strong> ಪತ್ರಿಕೆಯಲ್ಲಿರುವ ಪುಟಗಳ ಸಂಖ್ಯೆಯನ್ನು ನಮೂದಿಸಿ.</li>
          </ul>
        </div>
      </div>

      {/* Step 3 */}
      <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 bg-[#F8F9FA] space-y-2.5">
        <div className="flex items-center gap-2 font-black text-sm text-[#172B4D]">
          <span className="w-6 h-6 rounded-full bg-[#172B4D] text-white flex items-center justify-center text-xs shrink-0 font-bold">
            ೩
          </span>
          <span>ಹಂತ ೩: ಸ್ವಯಂಚಾಲಿತ ಅಪ್‌ಲೋಡ್ (Chunked Uploading)</span>
        </div>
        <div className="text-xs text-[#5A6A85] space-y-1.5 pl-0 sm:pl-8">
          <p>
            1. ಕೆಳಗಿರುವ <strong>&ldquo;ಸ್ವಯಂಚಾಲಿತ ಅಪ್‌ಲೋಡ್&rdquo;</strong> ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ.
          </p>
          <p>
            2. ದೊಡ್ಡ ಫೈಲ್‌ಗಳು 5MB ತುಂಡುಗಳಾಗಿ ಸುರಕ್ಷಿತವಾಗಿ ರವಾನೆಯಾಗುತ್ತವೆ. ಪ್ರೋಗ್ರೆಸ್ ಬಾರ್‌ನಲ್ಲಿ ಶೇಕಡಾವಾರು ಪ್ರಗತಿಯನ್ನು ನೇರವಾಗಿ ಗಮನಿಸಬಹುದು.
          </p>
          <p className="text-emerald-800 font-semibold flex items-center gap-1.5 pt-0.5">
            <RotateCcw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>ನೆಟ್‌ವರ್ಕ್ ಕಡಿತಗೊಂಡರೂ ಮೊದಲಿನಿಂದ ಪ್ರಾರಂಭವಾಗುವುದಿಲ್ಲ; ನಿಂತಿದ್ದಲ್ಲಿಂದಲೇ ಮುಂದುವರಿಯುತ್ತದೆ. ಅಲ್ಲದೆ ಅಗತ್ಯವಿದ್ದಲ್ಲಿ ಅಪ್‌ಲೋಡ್ ರದ್ದುಗೊಳಿಸಬಹುದು.</span>
          </p>
        </div>
      </div>

      {/* Step 4 */}
      <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 bg-[#F8F9FA] space-y-2.5">
        <div className="flex items-center gap-2 font-black text-sm text-[#172B4D]">
          <span className="w-6 h-6 rounded-full bg-[#172B4D] text-white flex items-center justify-center text-xs shrink-0 font-bold">
            ೪
          </span>
          <span>ಹಂತ ೪: ಪ್ರಕಟಣೆ ಮತ್ತು ವಾಚಕದಲ್ಲಿ ಪರಿಶೀಲನೆ (Verify in Reader)</span>
        </div>
        <div className="text-xs text-[#5A6A85] space-y-1.5 pl-0 sm:pl-8">
          <p>
            1. ಅಪ್‌ಲೋಡ್ ಪೂರ್ಣಗೊಂಡ ತಕ್ಷಣ ಪರದೆಯ ಮೇಲೆ ಹಸಿರು ಬ್ಯಾನರ್ ಕಾಣಿಸುತ್ತದೆ.
          </p>
          <p>
            2. <strong>&ldquo;ವಾಚಕದಲ್ಲಿ ನೋಡಿ (Test in Reader)&rdquo;</strong> ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ಇ-ಪತ್ರಿಕೆ ವಾಚಕದಲ್ಲಿ ಸರಿಯಾಗಿ ಲೋಡ್ ಆಗುತ್ತಿದೆಯೇ ಎಂದು ತಕ್ಷಣ ಪರೀಕ್ಷಿಸಿ.
          </p>
          <p>
            3. ಇದು ವೆಬ್‌ಸೈಟ್‌ನ ಮುಖಪುಟ,{" "}
            <Link href="/latest" target="_blank" className="text-[#C62828] font-bold underline inline-flex items-center gap-0.5">
              ಇತ್ತೀಚಿನ ಪುಟ <ExternalLink className="w-3 h-3" />
            </Link>{" "}
            ಮತ್ತು{" "}
            <Link href="/archives" target="_blank" className="text-[#C62828] font-bold underline inline-flex items-center gap-0.5">
              ಆರ್ಕೈವ್ಸ್ <ExternalLink className="w-3 h-3" />
            </Link>{" "}
            ನಲ್ಲಿ ಸಾರ್ವಜನಿಕ ಓದುಗರಿಗೆ ತಕ್ಷಣ ಲಭ್ಯವಾಗುತ್ತದೆ.
          </p>
        </div>
      </div>

      {/* Step 5 */}
      <div className="p-4 sm:p-5 rounded-xl border border-neutral-200 bg-[#F8F9FA] space-y-2.5">
        <div className="flex items-center gap-2 font-black text-sm text-[#172B4D]">
          <span className="w-6 h-6 rounded-full bg-[#172B4D] text-white flex items-center justify-center text-xs shrink-0 font-bold">
            ೫
          </span>
          <span>ಹಂತ ೫: ಪತ್ರಿಕೆಗಳ ಪಟ್ಟಿ ನಿರ್ವಹಣೆ (Manage Past Editions)</span>
        </div>
        <div className="text-xs text-[#5A6A85] space-y-1.5 pl-0 sm:pl-8">
          <p>
            ಹಿಂದೆ ಪ್ರಕಟಿಸಿದ ಯಾವುದೇ ಸಂಚಿಕೆಯನ್ನು ವೀಕ್ಷಿಸಲು, ಎಡಿಟ್ ಮಾಡಲು, ಕರಡು (Draft) ಸ್ಥಿತಿಗೆ ಇರಿಸಲು ಅಥವಾ ಡಿಲೀಟ್ ಮಾಡಲು{" "}
            <Link href="/admin/papers" className="text-[#C62828] font-bold underline">
              &ldquo;ಪತ್ರಿಕೆಗಳ ನಿರ್ವಹಣೆ&rdquo;
            </Link>{" "}
            ಪುಟವನ್ನು ಬಳಸಿ.
          </p>
        </div>
      </div>
    </div>
  );
}
