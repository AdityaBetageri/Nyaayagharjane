"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  BookOpen,
  Calendar,
  ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "ಮುಖಪುಟ", href: "/" },
  { label: "ಇತ್ತೀಚಿನ ಪತ್ರಿಕೆ", href: "/latest" },
  { label: "ಹಿಂದಿನ ಸಂಚಿಕೆಗಳು", href: "/archives" },
  { label: "ನಮ್ಮ ಬಗ್ಗೆ", href: "/about" },
  { label: "ಸಂಪರ್ಕಿಸಿ", href: "/contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="w-full bg-[#FFFFFF] border-b border-[#E2E8F0] sticky top-0 z-40 shadow-xs">
      {/* Top Dateline & Utility Bar */}
      <div className="w-full bg-[#172B4D] text-white text-xs py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-[1920px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-[#C62828]" />
            <span className="font-medium">ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ</span>
            <span className="hidden sm:inline text-neutral-400">•</span>
            <span className="hidden sm:inline text-neutral-300">ತಿಂಗಳ ಪ್ರತಿಯೊಂದು ಆವೃತ್ತಿ ಡಿಜಿಟಲ್ ರೂಪದಲ್ಲಿ</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden md:inline text-neutral-300">
              ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ
            </span>
            <Link
              href="/admin/login"
              className="text-neutral-300 hover:text-white transition-colors text-[11px] underline underline-offset-2"
            >
              ನಿರ್ವಾಹಕರ ವಿಭಾಗ
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================
          DESKTOP UNIFIED NAVBAR (lg: and above) - Single Clean Bar
          ========================================================= */}
      <div className="hidden lg:block w-full bg-[#FFFFFF]">
        <div className="w-full max-w-[1920px] mx-auto px-6 xl:px-12 2xl:px-16 h-20 flex items-center justify-between">
          {/* 1. Left: Brand Title */}
          <Link
            href="/"
            className="group flex flex-col justify-center shrink-0 pr-6"
          >
            <span className="text-2xl xl:text-3xl font-black tracking-tight text-[#172B4D] font-serif leading-none">
              ನ್ಯಾಯಘರ್ಜನೆ
            </span>
            <p className="text-[11px] font-medium text-[#C62828] mt-2 flex items-center gap-1.5">
              <span>ಸತ್ಯದ ಧ್ವನಿ</span>
              <span className="text-neutral-400">•</span>
              <span>ನ್ಯಾಯದ ಘರ್ಜನೆ</span>
            </p>
          </Link>

          {/* 2. Center: Navigation Items */}
          <nav className="flex items-center gap-1 xl:gap-2">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3.5 xl:px-5 py-2 text-sm font-semibold rounded-md transition-colors ${
                    isActive
                      ? "bg-red-50 text-[#C62828] font-bold shadow-2xs"
                      : "text-[#172B4D] hover:text-[#C62828] hover:bg-neutral-100/70"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* 3. Right: CTA Button */}
          <div className="shrink-0 pl-6">
            <Link
              href="/latest"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-bold rounded-lg shadow-xs hover:shadow-md transition-all"
            >
              <BookOpen className="w-4 h-4" />
              <span>ಇತ್ತೀಚಿನ ಪತ್ರಿಕೆ ಓದಿ</span>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================
          MOBILE / TABLET NAVBAR & DRAWER (< lg)
          Uses native disclosure for 100% reliable click & touch
          ========================================================= */}
      <details
        open={menuOpen}
        onToggle={(e) => setMenuOpen(e.currentTarget.open)}
        className="lg:hidden w-full group/details relative"
      >
        <summary className="list-none [&::-webkit-details-marker]:hidden w-full bg-[#FFFFFF] px-4 sm:px-6 py-3 select-none pointer-events-none">
          <div className="relative flex items-center justify-between min-h-[48px]">
            {/* Hamburger / Close Button on Left */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Toggle navigation menu"
              className="relative z-30 p-2 rounded-lg text-[#172B4D] hover:bg-neutral-100 transition-colors cursor-pointer pointer-events-auto focus:outline-hidden focus:ring-2 focus:ring-[#C62828] flex items-center justify-center"
            >
              <Menu className="w-6 h-6 text-[#172B4D] group-open/details:hidden block pointer-events-none" />
              <X className="w-6 h-6 text-[#C62828] group-open/details:block hidden pointer-events-none" />
            </div>

            {/* Brand Title (Centered in mobile view) */}
            <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center justify-center text-center z-10 pointer-events-auto">
              <Link
                href="/"
                onClick={(e) => e.stopPropagation()}
                className="text-2xl sm:text-3xl font-black tracking-tight text-[#172B4D] font-serif leading-none"
              >
                ನ್ಯಾಯಘರ್ಜನೆ
              </Link>
              <p className="text-[10px] sm:text-xs font-medium text-[#C62828] mt-1.5 flex items-center gap-1">
                <span>ಸತ್ಯದ ಧ್ವನಿ</span>
                <span>•</span>
                <span>ನ್ಯಾಯದ ಘರ್ಜನೆ</span>
              </p>
            </div>

            {/* Right Action Button on Mobile/Tablet */}
            <div className="relative z-20 pointer-events-auto">
              <Link
                href="/latest"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-semibold rounded-md shadow-xs transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">ಇತ್ತೀಚಿನ ಪತ್ರಿಕೆ</span>
              </Link>
            </div>
          </div>
        </summary>

        {/* Mobile / Tablet Navigation Drawer */}
        <div className="w-full border-t border-[#E2E8F0] bg-white shadow-lg px-4 py-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between px-3.5 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-red-50 text-[#C62828]"
                    : "text-[#172B4D] hover:bg-neutral-100 active:bg-neutral-200"
                }`}
              >
                <span>{item.label}</span>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </Link>
            );
          })}

          <div className="pt-3 pb-1">
            <Link
              href="/latest"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-center gap-2 w-full py-3 bg-[#C62828] hover:bg-[#B71C1C] text-white rounded-lg font-bold text-sm shadow-xs transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>ಇತ್ತೀಚಿನ ಪತ್ರಿಕೆ ಓದಿ</span>
            </Link>
          </div>
        </div>
      </details>
    </header>
  );
}
