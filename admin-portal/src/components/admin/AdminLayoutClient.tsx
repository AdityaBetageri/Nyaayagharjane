"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Menu,
  X,
  ShieldCheck,
  User,
} from "lucide-react";
import {
  getAdminSession,
  clearAdminSession,
  isBiometricVerified,
  setAdminSession,
  AdminUser,
} from "@/lib/editionsStore";
import { onAdminAuthStateChanged, signOutAdmin } from "@/lib/firebase";
import { ThinArcLoader } from "@/components/shared/ThinArcLoader";
import { ConfirmationModal } from "@/components/admin/ConfirmationModal";
import { DatabaseStatusIndicator } from "@/components/admin/DatabaseStatusIndicator";

import { LayoutGridIcon } from "@/components/icons/LayoutGridIcon";
import { FileTextIcon } from "@/components/icons/FileTextIcon";
import { CloudUploadIcon } from "@/components/icons/CloudUploadIcon";
import { FolderTreeIcon } from "@/components/icons/FolderTreeIcon";
import { GlobeAltIcon } from "@/components/icons/GlobeAltIcon";
import { Cog6ToothIcon, Cog6ToothIconHandle } from "@/components/icons/Cog6ToothIcon";
import { LogoutIcon, LogoutIconHandle } from "@/components/icons/LogoutIcon";

interface SidebarNavItemProps {
  label: string;
  href: string;
  IconComponent: React.ComponentType<{
    ref?: React.Ref<any>;
    size?: number;
    className?: string;
  }>;
  isActive: boolean;
  onNavigate: () => void;
}

function SidebarNavItem({
  label,
  href,
  IconComponent,
  isActive,
  onNavigate,
}: SidebarNavItemProps) {
  const iconRef = useRef<{ startAnimation: () => void; stopAnimation: () => void } | null>(null);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
      className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-colors ${
        isActive
          ? "bg-[#C62828] text-white shadow-xs"
          : "text-neutral-300 hover:bg-white/10 hover:text-white"
      }`}
    >
      <IconComponent ref={iconRef} size={18} className="shrink-0 text-current transition-transform duration-200" />
      <span>{label}</span>
    </Link>
  );
}

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AdminUser | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const profileSettingsRef = useRef<Cog6ToothIconHandle>(null);
  const logoutIconRef = useRef<LogoutIconHandle>(null);

  const isLoginPage = pathname === "/login" || pathname.startsWith("/login") || pathname === "/admin/login" || pathname.startsWith("/admin/login");
  const isPasskeyPage = pathname === "/passkey" || pathname.startsWith("/passkey");
  const isSettingsPage = pathname === "/settings" || pathname.startsWith("/settings") || pathname === "/admin/settings" || pathname.startsWith("/admin/settings");

  const [isAuthLoading, setIsAuthLoading] = useState(!isLoginPage && !isPasskeyPage);

  useEffect(() => {
    if (isLoginPage || isPasskeyPage) {
      setIsAuthLoading(false);
      return;
    }

    const unsub = onAdminAuthStateChanged((user) => {
      if (!user) {
        // Step 1: Not authenticated in Firebase
        clearAdminSession();
        router.replace("/login");
        return;
      }

      // Step 2: User exists in Firebase, but check if passkey was verified in this session
      if (!isBiometricVerified(user.uid)) {
        // Direct to Step 2 passkey verification gate immediately
        router.replace("/passkey");
        return;
      }

      // Both Step 1 & Step 2 verified!
      const current = getAdminSession();
      if (current) {
        setSession(current);
      } else {
        const newSession: AdminUser = {
          email: user.email || "admin@nyaayagharjane.com",
          name: user.displayName || "ಹರೀಶ್ ಕಮ್ಮನಕೋಟೆ",
          role: "Super Admin",
          loggedInAt: new Date().toISOString(),
        };
        setAdminSession(newSession);
        setSession(newSession);
      }
      setIsAuthLoading(false);
    });

    return () => unsub();
  }, [pathname, isLoginPage, isPasskeyPage, router]);

  // If on login or passkey page, render children directly without admin layout
  if (isLoginPage || isPasskeyPage) {
    return <>{children}</>;
  }

  // Prevent dashboard content flashing while verifying session
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#F1F3F5] flex flex-col items-center justify-center gap-3">
        <ThinArcLoader className="w-8 h-8 text-[#C62828]" strokeWidth={1.5} />
        <span className="text-xs text-neutral-500 font-medium">
          ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ (Verifying session)...
        </span>
      </div>
    );
  }

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    try {
      await signOutAdmin();
    } catch {}
    clearAdminSession();
    setShowLogoutModal(false);
    router.push("/login");
  };

  const navLinks = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutGridIcon,
    },
    {
      label: "Manage Papers",
      href: "/papers",
      icon: FileTextIcon,
    },
    {
      label: "Upload Paper",
      href: "/upload",
      icon: CloudUploadIcon,
    },
    {
      label: "Publishing Guide",
      href: "/guide",
      icon: FolderTreeIcon,
    },
    {
      label: "Connectivity Tester",
      href: "/verifier",
      icon: GlobeAltIcon,
    },
    {
      label: "Settings",
      href: "/settings",
      icon: Cog6ToothIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-[#F1F3F5] text-neutral-900 flex flex-col lg:flex-row antialiased">
      {/* Mobile Header Bar */}
      <div className="lg:hidden bg-[#172B4D] text-white px-4 py-2.5 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 text-white cursor-pointer transition-colors"
          aria-label="Toggle admin sidebar"
        >
          {mobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Centered Brand Title in Mobile Header */}
        <div className="flex items-center gap-2">
          <Image
            src="/logo.png"
            alt="ನ್ಯಾಯ ಘರ್ಜನೆ"
            width={968}
            height={968}
            className="w-7 h-7 object-contain rounded-md shadow-xs"
          />
          <span className="font-serif font-black text-base sm:text-lg text-white tracking-tight leading-none">
            ನ್ಯಾಯ ಘರ್ಜನೆ
          </span>
          <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider bg-[#C62828] text-white rounded-md leading-none shadow-xs">
            ADMIN
          </span>
        </div>

        {/* Right Balancer / Database Status in Mobile Header */}
        <div className="flex items-center justify-end">
          <DatabaseStatusIndicator compact />
        </div>
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
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 shrink-0">
                <Image
                  src="/logo.png"
                  alt="Nyaayagharjane"
                  width={968}
                  height={968}
                  className="w-full h-full object-contain rounded-lg drop-shadow-sm group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-xl font-black text-white font-serif tracking-tight leading-tight">
                  ನ್ಯಾಯ ಘರ್ಜನೆ
                </span>
                <p className="text-[11px] text-[#FF8A80] mt-3.5 flex items-center gap-1.5 font-medium tracking-wide leading-none">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#FF8A80]" />
                  <span>Admin Portal</span>
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <p className="text-[10px] uppercase font-bold tracking-wider text-neutral-400 px-3 pb-1">
              MAIN MENU
            </p>
            {navLinks.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <SidebarNavItem
                  key={item.label}
                  label={item.label}
                  href={item.href}
                  IconComponent={item.icon}
                  isActive={isActive}
                  onNavigate={() => setMobileSidebarOpen(false)}
                />
              );
            })}
          </nav>
        </div>

        {/* Locked Footer: Admin ID Profile & Logout Section */}
        <div className="mt-auto shrink-0 p-4 border-t border-white/10 bg-[#0F1C33]/90 backdrop-blur-xs">
          <Link
            href="/settings"
            onClick={() => setMobileSidebarOpen(false)}
            onMouseEnter={() => profileSettingsRef.current?.startAnimation()}
            onMouseLeave={() => profileSettingsRef.current?.stopAnimation()}
            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors group cursor-pointer"
            title="Settings"
          >
            <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20 shrink-0 shadow-xs group-hover:scale-105 transition-transform bg-[#C62828] flex items-center justify-center">
              <Image
                src="/editor.jpg"
                alt="ಹರೀಶ್ ಕಮ್ಮನಕೋಟೆ"
                width={72}
                height={72}
                unoptimized
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-white truncate">
                {session?.name && !session.name.includes("ಮುಖ್ಯ ನಿರ್ವಾಹಕರು") ? session.name : "ಹರೀಶ್ ಕಮ್ಮನಕೋಟೆ"}
              </p>
              <p className="text-[10px] text-neutral-400 truncate">
                ಮುಖ್ಯ ನಿರ್ವಾಹಕರು · Chief Admin
              </p>
            </div>
            <Cog6ToothIcon
              ref={profileSettingsRef}
              size={18}
              className="text-neutral-400 group-hover:text-white transition-colors shrink-0"
            />
          </Link>

          <button
            type="button"
            onClick={handleLogoutClick}
            onMouseEnter={() => logoutIconRef.current?.startAnimation()}
            onMouseLeave={() => logoutIconRef.current?.stopAnimation()}
            className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-red-600/80 text-neutral-300 hover:text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer group"
          >
            <LogoutIcon ref={logoutIconRef} size={16} className="text-current" />
            <span>Logout</span>
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
        {/* Top Desktop Bar (hidden on settings page per user request) */}
        {!isSettingsPage && (
          <header className="hidden lg:flex items-center justify-between h-16 bg-white border-b border-[#E2E8F0] px-8 sticky top-0 z-30 shadow-2xs">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-bold text-[#172B4D]">
                ನ್ಯಾಯ ಘರ್ಜನೆ ಇ-ಪತ್ರಿಕೆ ಆಡಳಿತ ವ್ಯವಸ್ಥೆ
              </h2>
              <span className="h-4 w-px bg-neutral-300" />
              <span className="text-xs text-neutral-500 font-medium">
                ಆವೃತ್ತಿ ನಿರ್ವಹಣೆ ಮತ್ತು ಪ್ರಕಟಣೆ
              </span>
            </div>

            <div className="flex items-center gap-4">
              
              <DatabaseStatusIndicator />
            </div>
          </header>
        )}

        {/* Page Children */}
        <main className={isSettingsPage ? "p-0 flex-1 flex flex-col w-full" : "p-4 sm:p-6 lg:p-8 flex-1"}>
          {children}
        </main>
      </div>

      {/* Custom Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title="ಲಾಗ್‌ಔಟ್ ದೃಢೀಕರಣ (Confirm Logout)"
        description="ನೀವು ಆಡಳಿತ ಮಂಡಳಿಯಿಂದ ಲಾಗ್ಔಟ್ ಆಗಲು ಬಯಸುವಿರಾ? ಮುಂದಿನ ಬಾರಿ ಲಾಗಿನ್ ಮಾಡಲು ನಿಮ್ಮ ಈಮೇಲ್ ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ಅಗತ್ಯವಿರುತ್ತದೆ."
        confirmText="ಹೌದು, ಲಾಗ್‌ಔಟ್ ಆಗಿ"
        cancelText="ರದ್ದುಗೊಳಿಸಿ"
        variant="warning"
        iconType="logout"
      />
    </div>
  );
}
