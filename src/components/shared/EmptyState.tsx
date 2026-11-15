import Link from "next/link";
import { Newspaper, RotateCcw } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  actionHref?: string;
}

export default function EmptyState({
  title = "ಯಾವುದೇ ಸಂಚಿಕೆಗಳು ಲಭ್ಯವಿಲ್ಲ",
  description = "ಪ್ರಸ್ತುತ ಆವೃತ್ತಿಯ ಪತ್ರಿಕೆ ಸಿದ್ಧವಾಗುತ್ತಿದ್ದು, ಶೀಘ್ರದಲ್ಲೇ ಇಲ್ಲಿ ಪ್ರಕಟಿಸಲಾಗುವುದು.",
  actionText,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="w-full max-w-md mx-auto my-12 p-8 bg-white border border-[#E2E8F0] rounded-xl text-center shadow-xs">
      <div className="w-16 h-16 bg-red-50 text-[#C62828] rounded-full flex items-center justify-center mx-auto mb-4">
        <Newspaper className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-[#172B4D] mb-2">{title}</h3>
      <p className="text-sm text-[#5A6A85] leading-relaxed mb-6">
        {description}
      </p>

      {actionHref && actionText && (
        <Link
          href={actionHref}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#172B4D] hover:bg-[#0F1C33] text-white text-sm font-semibold rounded-md transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{actionText}</span>
        </Link>
      )}
    </div>
  );
}
