"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Globe,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  ChevronRight,
  User,
  FolderTree,
  Settings,
} from "lucide-react";
import { getAdminSession, clearAdminSession, AdminUser } from "@/lib/editionsStore";

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AdminUser | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const isLoginPage = pathname === "/admin/login" || pathname.startsWith("/admin/login");

  useEffect(() => {
    if (isLoginPage) return;

    Promise.resolve().then(() => {
      const currentSession = getAdminSession();
      if (!currentSession) {
        router.push("/admin/login");
      } else {
        setSession(currentSession);
      }
    });
  }, [pathname, isLoginPage, router]);

  // If on login page, just render children directly
  if (isLoginPage) {
    return <>{children}</>;
  }

  const handleLogout = () => {
    if (confirm("ನೀವು ಖಂಡಿತವಾಗಿ ಲಾಗ್‌ಔಟ್ ಆಗಲು ಬಯಸುವಿರಾ? (Confirm logout?)")) {
      clearAdminSession();
      router.push("/admin/login");
    }
  };

  const navLinks = [
    {
      label: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ (Dashboard)",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "ಪತ್ರಿಕೆಗಳ ನಿರ್ವಹಣೆ (Manage Papers)",
      href: "/admin/papers",
      icon: FileText,
    },
    {
      label: "ಹೊಸ ಪತ್ರಿಕೆ ಅಪ್‌ಲೋಡ್ (Upload Paper)",
      href: "/admin/upload",
      icon: Upload,
    },
    {
      label: "R2 ಪ್ರಕಟಣಾ ಮಾರ್ಗದರ್ಶಿ (R2 Guide)",
      href: "/admin/guide",
      icon: FolderTree,
    },
    {
      label: "R2 ಕನೆಕ್ಟಿವಿಟಿ ಟೆಸ್ಟರ್ (Verifier)",
      href: "/admin/verifier",
      icon: Globe,
    },
    {
      label: "ಖಾತೆ ಸೆಟ್ಟಿಂಗ್ಸ್ (Settings)",
      href: "/admin/settings",
      icon: Settings,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F1F3F5] text-neutral-900 flex flex-col lg:flex-row antialiased">
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-[#172B4D] text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="p-1.5 rounded-md hover:bg-white/10 text-white cursor-pointer"
          aria-label="Toggle admin sidebar"
        >
          {mobileSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <div className="flex items-center gap-2">
          <span className="font-serif font-black text-lg text-white">ನ್ಯಾಯಘರ್ಜನೆ</span>
          <span className="px-1.5 py-0.5 text-[10px] bg-red-600 rounded font-bold uppercase tracking-wider">
            ಆಡಳಿತ
          </span>
        </div>

        <Link
          href="/"
          target="_blank"
          className="p-1.5 rounded-md hover:bg-white/10 text-neutral-300 hover:text-white"
          title="ವೆಬ್‌ಸೈಟ್‌ಗೆ ಭೇಟಿ ನೀಡಿ"
        >
          <Globe className="w-5 h-5" />
        </Link>
      </div>

      {/* Sidebar Navigation - Sticky Full Height Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#172B4D] text-white flex flex-col h-screen max-h-screen lg:sticky lg:top-0 transform transition-transform duration-200 ease-in-out ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Scrollable Top & Middle Navigation Section - Scrollbar hidden */}
        <div className="flex-1 overflow-y-auto min-h-0 p-5 sm:p-6 space-y-6 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {/* Brand Logo */}
          <div className="border-b border-white/10 pb-5">
            <Link href="/admin/dashboard" className="flex flex-col group">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black text-white font-serif tracking-tight">
                  ನ್ಯಾಯಘರ್ಜನೆ
                </span>
                <span className="px-2 py-0.5 text-[9px] bg-[#C62828] text-white font-bold rounded">
                  ಆಡಳಿತ
                </span>
              </div>
              <p className="text-[11px] text-[#FF8A80] mt-1 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>ಆಡಳಿತ ಮಂಡಳಿ ಪೋರ್ಟಲ್</span>
              </p>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 px-3 pb-1">
              ಮುಖ್ಯ ಮೆನು (Main Menu)
            </p>
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-[#C62828] text-white shadow-xs"
                      : "text-neutral-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* External Links */}
          <div className="space-y-1.5 pt-4 border-t border-white/10">
            <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 px-3 pb-1">
              ಸೈಟ್ ಲಿಂಕ್‌ಗಳು (Website Links)
            </p>
            <Link
              href="/"
              target="_blank"
              className="flex items-center justify-between px-3.5 py-2 rounded-lg text-xs font-semibold text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>ನೇರ ವೆಬ್‌ಸೈಟ್ ನೋಡಿ (Live Site)</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-500" />
            </Link>
          </div>
        </div>

        {/* Locked Footer: Admin ID Profile & Logout Section */}
        <div className="mt-auto shrink-0 p-4 border-t border-white/10 bg-[#0F1C33]/90 backdrop-blur-xs">
          <Link
            href="/admin/settings"
            onClick={() => setMobileSidebarOpen(false)}
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors group"
            title="ಖಾತೆ ಸೆಟ್ಟಿಂಗ್ಸ್ ತೆರೆಯಿರಿ"
          >
            <div className="w-9 h-9 rounded-full bg-[#C62828] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs group-hover:scale-105 transition-transform">
              <User className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {session?.name || "ಮುಖ್ಯ ನಿರ್ವಾಹಕರು"}
              </p>
              <p className="text-[10px] text-neutral-400 truncate">
                {session?.email || "admin@nyaayagharjane.com"}
              </p>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-white transition-colors" />
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-red-600/80 text-neutral-300 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ಲಾಗ್‌ಔಟ್ (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile sidebar */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Desktop Bar */}
        <header className="hidden lg:flex items-center justify-between h-16 bg-white border-b border-[#E2E8F0] px-8 sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-[#172B4D]">
              ನ್ಯಾಯಘರ್ಜನೆ ಇ-ಪತ್ರಿಕೆ ಆಡಳಿತ ವ್ಯವಸ್ಥೆ
            </h2>
            <span className="h-4 w-px bg-neutral-300" />
            <span className="text-xs text-neutral-500 font-medium">
              ಆವೃತ್ತಿ ನಿರ್ವಹಣೆ ಮತ್ತು ಪ್ರಕಟಣೆ
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F9FA] hover:bg-neutral-100 text-[#172B4D] border border-[#E2E8F0] rounded-lg text-xs font-semibold transition-colors"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>ಮುಖ್ಯ ವೆಬ್‌ಸೈಟ್ ತೆರೆಯಿರಿ</span>
            </Link>

            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F8F9FA] hover:bg-neutral-100 text-[#172B4D] border border-[#E2E8F0] rounded-lg text-xs font-semibold transition-colors"
              title="ಖಾತೆ ಸೆಟ್ಟಿಂಗ್ಸ್"
            >
              <Settings className="w-3.5 h-3.5 text-neutral-600" />
              <span>ಸೆಟ್ಟಿಂಗ್ಸ್</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-semibold transition-colors cursor-pointer"
              title="ಲಾಗ್‌ಔಟ್"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>ಲಾಗ್‌ಔಟ್</span>
            </button>
          </div>
        </header>

        {/* Page Children */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
