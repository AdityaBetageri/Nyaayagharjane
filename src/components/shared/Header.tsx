"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, BookOpen, ChevronRight } from "lucide-react";

const NAV_ITEMS = [
  { label: "ಮುಖಪುಟ", href: "/" },
  { label: "ಪತ್ರಿಕೆ ಓದಿ", href: "/read" },
  { label: "ಹಿಂದಿನ ಸಂಚಿಕೆಗಳು", href: "/archives" },
  { label: "ನಮ್ಮ ಬಗ್ಗೆ", href: "/about" },
  { label: "ಸಂಪರ್ಕಿಸಿ", href: "/contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="w-full bg-white border-b border-[#E2E8F0] sticky top-0 z-40 shadow-sm">
      {/* ── Thin Utility Bar ── */}
      <div className="w-full bg-[#172B4D] text-white text-[11px] py-1 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="text-neutral-300 hidden sm:block">
            ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ &nbsp;•&nbsp; ತಿಂಗಳ ಪ್ರತಿಯೊಂದು ಆವೃತ್ತಿ ಡಿಜಿಟಲ್ ರೂಪದಲ್ಲಿ
          </span>
          <span className="text-neutral-300 sm:hidden">ಕರ್ನಾಟಕ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ</span>
          <div className="flex items-center gap-4">
            <span className="hidden md:block text-neutral-400">ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ</span>
            <Link
              href="/admin/login"
              className="text-neutral-400 hover:text-white transition-colors underline underline-offset-2"
            >
              ನಿರ್ವಾಹಕರ ವಿಭಾಗ
            </Link>
          </div>
        </div>
      </div>

      {/* ── Main Header Row: Logo Left | Nav Center | CTA Right ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-2.5 sm:py-3">

          {/* Logo / Brand — left-aligned */}
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group">
            {/* Logo Mark */}
            <div className="relative w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 shrink-0">
              <Image
                src="/logo.png"
                alt="ನ್ಯಾಯ ಘರ್ಜನೆ ಲೋಗೋ"
                width={968}
                height={968}
                priority
                className="w-full h-full object-contain rounded-lg drop-shadow-xs group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="flex items-center">
              <Image
                src="/nyaayagharjane-title.png"
                alt="ನ್ಯಾಯ ಘರ್ಜನೆ"
                width={918}
                height={198}
                priority
                className="h-6 sm:h-7 lg:h-8 w-auto object-contain"
              />
            </div>
          </Link>

          {/* Desktop nav — centered, hidden on mobile */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 flex-1 justify-center">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 lg:px-4 py-1.5 rounded-md text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#172B4D] text-white font-semibold"
                      : "text-[#172B4D] hover:bg-[#F0F2F5] hover:text-[#C62828]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* CTA + Mobile Menu — right-aligned */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/read"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs sm:text-sm font-semibold rounded-md shadow-sm transition-all hover:shadow-md"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ಪತ್ರಿಕೆ ಓದಿ</span>
              <span className="sm:hidden">ಓದಿ</span>
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-1.5 rounded-md text-[#172B4D] hover:bg-neutral-100 transition-colors"
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X className="w-5 h-5 text-[#C62828]" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Navigation Drawer ── */}
      {menuOpen && (
        <div className="md:hidden border-t border-[#E2E8F0] bg-[#F8F9FA]">
          <div className="px-4 py-2 space-y-0.5">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-white text-[#C62828] font-semibold shadow-sm border-l-4 border-[#C62828]"
                      : "text-[#172B4D] hover:bg-white hover:text-[#C62828]"
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className={`w-4 h-4 ${isActive ? "text-[#C62828]" : "text-neutral-400"}`} />
                </Link>
              );
            })}
            <div className="pt-2 pb-1">
              <Link
                href="/read"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-md font-semibold text-sm transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                <span>ಪತ್ರಿಕೆ ಓದಿ</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
