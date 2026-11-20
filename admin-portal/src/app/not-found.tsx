import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Home, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-between text-neutral-800 antialiased">
      {/* Top Simple Nav */}
      <header className="w-full bg-white border-b border-[#E2E8F0] px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-8 h-8 shrink-0">
              <Image
                src="/logo.png"
                alt="ನ್ಯಾಯ ಘರ್ಜನೆ"
                width={968}
                height={968}
                className="w-full h-full object-contain rounded-md"
              />
            </div>
            <span className="font-serif font-black text-lg text-[#172B4D] tracking-tight">
              ನ್ಯಾಯ ಘರ್ಜನೆ
            </span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C62828] hover:underline"
          >
            <Home className="w-3.5 h-3.5" />
            <span>ಮುಖಪುಟ</span>
          </Link>
        </div>
      </header>

      {/* Main 404 Container */}
      <main className="flex-1 flex items-center justify-center p-6 my-auto">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-red-50 text-[#C62828] border border-red-100 flex items-center justify-center mx-auto shadow-xs">
            <FileQuestion className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-4xl sm:text-5xl font-black font-mono text-[#172B4D] tracking-tight">
              404
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#172B4D] tracking-tight">
              ಪುಟ ಕಂಡುಬಂದಿಲ್ಲ (Page Not Found)
            </h1>
            <p className="text-xs sm:text-sm text-[#5A6A85] leading-relaxed">
              ನೀವು ವೀಕ್ಷಿಸಲು ಪ್ರಯತ್ನಿಸಿದ ಪುಟ ಲಭ್ಯವಿಲ್ಲ. ದಯವಿಟ್ಟು ಮುಖಪುಟಕ್ಕೆ ಹಿಂತಿರುಗಿ.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold text-xs sm:text-sm rounded-lg shadow-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ (Back to Dashboard)</span>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-[#E2E8F0] bg-white py-4 px-6 text-center text-xs text-neutral-400">
        © 2026 ನ್ಯಾಯ ಘರ್ಜನೆ (Nyaayagharjane). All rights reserved.
      </footer>
    </div>
  );
}
