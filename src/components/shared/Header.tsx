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
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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

      {/* Main Newspaper Masthead (Title in Dead Center for ALL Views, Nav Button on Left for ALL Views) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5">
        <div className="relative flex items-center justify-center min-h-[52px]">
          {/* Navigation Button - VISIBLE FOR ALL VIEWS */}
          <div className="absolute left-0 flex items-center">
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-[#172B4D] hover:bg-neutral-100 transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#C62828]"
              aria-expanded={menuOpen}
              aria-label="Toggle navigation menu"
            >
              {menuOpen ? (
                <X className="w-6 h-6 text-[#C62828]" />
              ) : (
                <Menu className="w-6 h-6 text-[#172B4D]" />
              )}
              <span className="hidden sm:inline-block text-xs font-bold uppercase tracking-wider text-[#172B4D]">
                ಮೆನು
              </span>
            </button>
          </div>

          {/* Centered Newspaper Brand Title - CENTERED FOR ALL VIEWS */}
          <Link
            href="/"
            className="group flex flex-col items-center justify-center text-center mx-auto"
          >
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-[#172B4D] font-serif">
                ನ್ಯಾಯಘರ್ಜನೆ
              </span>
              <span className="hidden sm:inline-block text-xs sm:text-sm font-bold tracking-widest text-[#C62828] uppercase">
                NYAAYAGHARJANE
              </span>
            </div>
            <p className="text-xs sm:text-sm font-medium text-[#C62828] mt-0.5 sm:mt-1 flex items-center justify-center gap-1.5">
              <span>ಸತ್ಯದ ಧ್ವನಿ</span>
              <span className="text-neutral-400">•</span>
              <span>ನ್ಯಾಯದ ಘರ್ಜನೆ</span>
            </p>
          </Link>

          {/* Quick Action Button on Right (Desktop & Tablet) */}
          <div className="absolute right-0 hidden sm:flex items-center gap-2">
            <Link
              href="/latest"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#C62828] hover:bg-[#B71C1C] text-white text-xs font-semibold rounded-md shadow-xs transition-all hover:shadow-md"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ಇತ್ತೀಚಿನ ಪತ್ರಿಕೆ</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Navigation Drawer - Opens for ALL views when Navigation Button is clicked */}
      {menuOpen && (
        <div className="border-t border-[#E2E8F0] border-b border-[#E2E8F0] bg-[#F8F9FA] shadow-md animate-in slide-in-from-top-2 duration-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            {/* Desktop / Tablet horizontal links */}
            <div className="hidden sm:flex flex-wrap items-center justify-center gap-2 lg:gap-4">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      isActive
                        ? "bg-white text-[#C62828] shadow-xs font-bold"
                        : "text-[#172B4D] hover:text-[#C62828] hover:bg-white/80"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Mobile vertical links */}
            <div className="sm:hidden space-y-1">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-md text-base font-medium ${
                      isActive
                        ? "bg-red-50 text-[#C62828] font-bold"
                        : "text-[#172B4D] hover:bg-neutral-100"
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-neutral-400" />
                  </Link>
                );
              })}
              <div className="pt-2">
                <Link
                  href="/latest"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#C62828] text-white rounded-md font-semibold text-sm shadow-xs"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>ಇತ್ತೀಚಿನ ಪತ್ರಿಕೆ ಓದಿ</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
