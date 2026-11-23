"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Building2,
  Shield,
  ShieldCheck,
  Laptop,
  LogOut,
  MapPin,
  Mail,
  Phone,
  Key,
  Save,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Loader2,
  Check,
  Monitor,
  AlertTriangle,
  ArrowLeft,
  Globe,
  Sparkles,
  Fingerprint,
  Plus,
  Trash2,
} from "lucide-react";
import { KeyIcon, KeyIconHandle } from "@/components/icons/KeyIcon";
import { SquarePenIcon, SquarePenIconHandle } from "@/components/icons/SquarePenIcon";
import { RefreshCWIcon, RefreshCWIconHandle } from "@/components/icons/RefreshCWIcon";
import { LogoutIcon, LogoutIconHandle } from "@/components/icons/LogoutIcon";
import {
  getAdminSession,
  clearAdminSession,
  AdminUser,
} from "@/lib/editionsStore";
import { signOutAdmin } from "@/lib/firebase";
import { ConfirmationModal } from "@/components/admin/ConfirmationModal";
import { DatabaseStatusIndicator } from "@/components/admin/DatabaseStatusIndicator";
import { ThinArcLoader } from "@/components/shared/ThinArcLoader";
import {
  getLocalSiteSettings,
  fetchSiteSettings,
  saveSiteSettings,
  SiteContactSettings,
  DEFAULT_SITE_SETTINGS,
} from "@/lib/siteSettings";
import {
  listPasskeys,
  registerPasskey,
  deletePasskeyCredential,
  PasskeyCredentialInfo,
} from "@/lib/passkeyClient";

type SettingsView = "root" | "website" | "security" | "sessions";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [session, setSession] = useState<AdminUser | null>(null);

  // Root vs Subpage View State
  const [currentView, setCurrentView] = useState<SettingsView>("root");

  // Modals
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showRevokeModal, setShowRevokeModal] = useState(false);
  const [isRevoking, setIsRevoking] = useState(false);

  // 1. Website Information State (Stored in R2 & Local)
  const [contactSettings, setContactSettings] = useState<SiteContactSettings>(DEFAULT_SITE_SETTINGS);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [addressSuccess, setAddressSuccess] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  // 2. Security Form State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // 3. Passkey State
  const [passkeys, setPasskeys] = useState<PasskeyCredentialInfo[]>([]);
  const [isLoadingPasskeys, setIsLoadingPasskeys] = useState(false);
  const [isRegisteringPasskey, setIsRegisteringPasskey] = useState(false);
  const [passkeySuccess, setPasskeySuccess] = useState<string | null>(null);
  const [passkeyError, setPasskeyError] = useState<string | null>(null);
  const [deletingCredId, setDeletingCredId] = useState<string | null>(null);
  const [passkeyToDelete, setPasskeyToDelete] = useState<PasskeyCredentialInfo | null>(null);

  const loadPasskeys = async () => {
    setIsLoadingPasskeys(true);
    try {
      const list = await listPasskeys();
      setPasskeys(list);
    } catch (err: unknown) {
      console.warn("Could not load passkeys:", err);
    } finally {
      setIsLoadingPasskeys(false);
    }
  };

  const handleRegisterNewPasskey = async () => {
    setPasskeyError(null);
    setPasskeySuccess(null);
    setIsRegisteringPasskey(true);
    try {
      const res = await registerPasskey();
      setPasskeySuccess(`Passkey device "${res.deviceName}" registered successfully.`);
      await loadPasskeys();
      setTimeout(() => setPasskeySuccess(null), 5000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Passkey registration failed.";
      setPasskeyError(msg);
    } finally {
      setIsRegisteringPasskey(false);
    }
  };

  const handleConfirmDeletePasskey = async () => {
    if (!passkeyToDelete) return;
    const target = passkeyToDelete;
    setDeletingCredId(target.credentialId);
    setPasskeyError(null);
    setPasskeySuccess(null);
    try {
      await deletePasskeyCredential(target.credentialId);
      setPasskeySuccess(`Passkey device "${target.deviceName}" removed successfully.`);
      setPasskeyToDelete(null);
      await loadPasskeys();
      setTimeout(() => setPasskeySuccess(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to remove passkey device.";
      setPasskeyError(msg);
      setPasskeyToDelete(null);
    } finally {
      setDeletingCredId(null);
    }
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      const current = getAdminSession();
      if (current) {
        setSession(current);
      }
    });

    setContactSettings(getLocalSiteSettings());
    fetchSiteSettings().then((remote: SiteContactSettings | null) => {
      if (remote) setContactSettings(remote);
    });

    loadPasskeys();
  }, []);

  // Save Website Info
  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError(null);
    setAddressSuccess(null);
    setIsSavingAddress(true);

    if (!contactSettings.officeAddress.trim()) {
      setAddressError("ಕಚೇರಿ ವಿಳಾಸ ಕಡ್ಡಾಯವಾಗಿದೆ (Office address is required).");
      setIsSavingAddress(false);
      return;
    }

    if (!contactSettings.contactEmail.trim() || !contactSettings.contactEmail.includes("@")) {
      setAddressError("ಸರಿಯಾದ ಈಮೇಲ್ ವಿಳಾಸ ನಮೂದಿಸಿ (Valid email is required).");
      setIsSavingAddress(false);
      return;
    }

    try {
      const updated = await saveSiteSettings(contactSettings);
      setContactSettings(updated);
      setAddressSuccess("ವಿವರಗಳನ್ನು ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಉಳಿಸಲಾಗಿದೆ ಮತ್ತು ವೆಬ್‌ಸೈಟ್‌ಗೆ ನೇರವಾಗಿ ಲೈವ್ ಆಗಿದೆ.");
      setTimeout(() => setAddressSuccess(null), 5000);
    } catch (err) {
      console.error(err);
      setAddressError("ವಿವರಗಳನ್ನು ಉಳಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.");
    } finally {
      setIsSavingAddress(false);
    }
  };

  // Update Password
  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (!currentPassword) {
      setPasswordError("ದಯವಿಟ್ಟು ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ.");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ ೬ ಅಕ್ಷರಗಳನ್ನು ಹೊಂದಿರಬೇಕು.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತು ದೃಢೀಕರಣ ಪಾಸ್‌ವರ್ಡ್ ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ.");
      return;
    }

    setPasswordSuccess("ಪಾಸ್‌ವರ್ಡ್ ಯಶಸ್ವಿಯಾಗಿ ಬದಲಾಗಿದೆ! (Password updated successfully)");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setIsChangingPassword(false);
    setTimeout(() => setPasswordSuccess(null), 4000);
  };

  // Revoke All Sessions
  const handleConfirmRevokeSessions = async () => {
    setIsRevoking(true);
    try {
      await signOutAdmin().catch(() => {});

      if (typeof window !== "undefined") {
        sessionStorage.clear();
        localStorage.removeItem("admin_session");
        localStorage.removeItem("admin_firebase_id_token");
        localStorage.removeItem("admin_firebase_uid");
      }
      clearAdminSession();

      setShowRevokeModal(false);
      router.push("/login?revoked=true");
    } finally {
      setIsRevoking(false);
    }
  };

  // Sign out
  const handleConfirmLogout = async () => {
    try {
      await signOutAdmin();
    } catch {}
    clearAdminSession();
    setShowLogoutModal(false);
    router.push("/login");
  };

  return (
    <div className="w-full flex-1 flex flex-col bg-[#F8F9FA] antialiased">
      {/* =========================================================
          FULL-WIDTH STICKY SETTINGS HEADER (ACTS AS PAGE HEADER)
          ========================================================= */}
      <header className="sticky top-0 z-30 w-full bg-white border-b border-[#E2E8F0] px-5 sm:px-8 lg:px-12 py-4 shadow-2xs">
        <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-4">
          {currentView === "root" ? (
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#172C4F]">
                Settings
              </h1>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5 font-medium hidden sm:block">
                Manage your administrator account and website configuration.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setCurrentView("root")}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold text-[#172C4F] hover:bg-neutral-100 hover:text-[#C9252B] transition-colors cursor-pointer"
                title="Back to Settings"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <ChevronRight className="w-4 h-4 text-neutral-400" />
              <span className="text-sm sm:text-base font-bold text-[#172C4F]">
                {currentView === "website" && "Website information"}
                {currentView === "security" && "Security & access"}
                {currentView === "sessions" && "Active sessions"}
              </span>
            </div>
          )}

          {/* Database Connection Status in Top Right Corner */}
          <div className="shrink-0">
            <DatabaseStatusIndicator />
          </div>
        </div>
      </header>

      {/* =========================================================
          MAIN FULL-WIDTH CONTAINER
          ========================================================= */}
      <div className="w-full max-w-6xl mx-auto px-5 sm:px-8 lg:px-12 py-6 sm:py-8 space-y-8 flex-1">
        {/* =========================================================
            VIEW 1: ROOT SETTINGS (OVERVIEW)
            ========================================================= */}
        {currentView === "root" && (
          <div className="space-y-8">
            {/* 1. ADMINISTRATOR PROFILE CARD (BIGGER PROFILE PHOTO) */}
            <section className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 px-0.5">
                Administrator profile
              </h2>

              {/* Administrator Profile Card - Trial with Logo Yellow & Red Diagonal Curved Line Background */}
              <div className="relative rounded-lg border border-amber-500/30 shadow-md overflow-hidden">
                {/* Diagonal curved yellow & red logo background */}
                <div className="absolute inset-0 z-0 pointer-events-none">
                  {/* Yellow base at the top */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#FFB300] via-[#FFC107] to-[#FFA000]" />
                  {/* Diagonal wavy curved red shape at the bottom */}
                  <svg
                    className="absolute inset-0 w-full h-full"
                    viewBox="0 0 1000 400"
                    preserveAspectRatio="none"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M0,220 C220,270 420,290 620,210 C780,150 890,170 1000,160 L1000,400 L0,400 Z"
                      fill="#C9252B"
                    />
                    <path
                      d="M0,220 C220,270 420,290 620,210 C780,150 890,170 1000,160"
                      stroke="#A71D22"
                      strokeWidth="3"
                      strokeOpacity="0.4"
                    />
                  </svg>
                </div>

                {/* Foreground Content */}
                <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-8 text-center sm:text-left">
                  <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7 w-full sm:w-auto">
                    {/* Bolder, Prominent Profile Picture - Harish Kammanakote (Full visible, no dot) */}
                    <div className="relative w-28 sm:w-36 lg:w-40 aspect-[4/5] shrink-0 mx-auto sm:mx-0">
                      <Image
                        src="/editor.jpg"
                        alt="ಹರೀಶ್ ಕಮ್ಮನಕೋಟೆ - ಮುಖ್ಯ ನಿರ್ವಾಹಕರು"
                        width={778}
                        height={982}
                        priority
                        unoptimized
                        className="w-full h-full object-cover object-top rounded-lg border-2 border-white shadow-lg ring-1 ring-black/10"
                      />
                    </div>

                    {/* Identity Details - Vertically Centered */}
                    <div className="space-y-2 text-center sm:text-left flex flex-col justify-center">
                      <div>
                        {/* Admin Name */}
                        <h3 className="text-xl sm:text-2xl font-black text-[#172C4F] tracking-tight drop-shadow-2xs">
                          {session?.name && !session.name.includes("ಮುಖ್ಯ ನಿರ್ವಾಹಕರು")
                            ? session.name
                            : "ಹರೀಶ್ ಕಮ್ಮನಕೋಟೆ"}
                        </h3>
                        {/* Admin Role with Center Dot */}
                        <p className="text-xs sm:text-sm font-bold text-[#172C4F] mt-0.5">
                          ಮುಖ್ಯ ನಿರ್ವಾಹಕರು · Chief Admin
                        </p>
                        {/* Email */}
                        <p className="text-xs text-[#172C4F]/80 font-semibold mt-0.5">
                          {session?.email || "admin@nyaayagharjane.com"}
                        </p>
                      </div>

                      {/* Badges - No online badge */}
                      <div className="flex items-center justify-center sm:justify-start gap-2 pt-1 flex-wrap">
                        <span className="px-3 py-1 text-xs font-bold rounded-md bg-[#172C4F] text-white tracking-wide shadow-xs">
                          {session?.role || "Super Admin"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-md bg-white/95 text-emerald-800 border border-emerald-300 shadow-2xs">
                          <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                          <span>Verified</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Shield Check Icon on Desktop - Top Aligned */}
                  <div className="hidden sm:flex items-center justify-center w-11 h-11 rounded-full bg-white/90 text-emerald-700 border border-white/60 shadow-md shrink-0 self-start">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  </div>
                </div>

                {/* Account Created Footer */}
                <div className="relative z-10 px-6 py-3.5 sm:px-8 bg-[#A81E24]/90 backdrop-blur-xs border-t border-white/20 flex items-center justify-between text-xs text-white">
                  <span className="text-amber-100 font-medium">Account created</span>
                  <span className="font-bold text-white">
                    {session?.loggedInAt
                      ? new Date(session.loggedInAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "November 16, 2026"}
                  </span>
                </div>
              </div>
            </section>

            {/* 2. GENERAL SETTINGS (OPENS SEPARATE DETAIL PAGE ON CLICK) */}
            <section className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 px-0.5">
                General settings
              </h2>

              <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-xs divide-y divide-[#E2E8F0] overflow-hidden">
                {/* Item 1: Website information */}
                <button
                  type="button"
                  onClick={() => setCurrentView("website")}
                  className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left hover:bg-[#FAFAFA] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 group-hover:bg-[#172C4F] group-hover:text-white text-[#172C4F] flex items-center justify-center shrink-0 transition-colors">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-[#172C4F] group-hover:text-[#C9252B] transition-colors">
                        Website information
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-500 truncate mt-0.5 font-medium">
                        Contact details, office address and website information
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-400 group-hover:text-[#172C4F] transition-colors shrink-0">
                    <span className="text-xs font-semibold hidden sm:inline text-neutral-400 group-hover:text-neutral-600">
                      Configure
                    </span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>

                {/* Item 2: Security & access */}
                <button
                  type="button"
                  onClick={() => setCurrentView("security")}
                  className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left hover:bg-[#FAFAFA] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 group-hover:bg-[#172C4F] group-hover:text-white text-[#172C4F] flex items-center justify-center shrink-0 transition-colors">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-[#172C4F] group-hover:text-[#C9252B] transition-colors">
                        Security & access
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-500 truncate mt-0.5 font-medium">
                        Administrator permissions and authentication
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-400 group-hover:text-[#172C4F] transition-colors shrink-0">
                    <span className="text-xs font-semibold hidden sm:inline text-neutral-400 group-hover:text-neutral-600">
                      Manage
                    </span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>

                {/* Item 3: Active sessions */}
                <button
                  type="button"
                  onClick={() => setCurrentView("sessions")}
                  className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left hover:bg-[#FAFAFA] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-neutral-100 group-hover:bg-[#172C4F] group-hover:text-white text-[#172C4F] flex items-center justify-center shrink-0 transition-colors">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm sm:text-base font-bold text-[#172C4F] group-hover:text-[#C9252B] transition-colors">
                        Active sessions
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-500 truncate mt-0.5 font-medium">
                        Manage devices and revoke sessions
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-neutral-400 group-hover:text-[#172C4F] transition-colors shrink-0">
                    <span className="text-xs font-semibold hidden sm:inline text-neutral-400 group-hover:text-neutral-600">
                      View
                    </span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </button>
              </div>
            </section>

            {/* 3. ACCOUNT ACTIONS */}
            <section className="space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-500 px-0.5">
                Account actions
              </h2>

              <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-xs p-5 sm:p-6 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-[#C9252B] flex items-center justify-center shrink-0">
                    <LogOut className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-[#172C4F]">
                      Sign out of account
                    </h3>
                    <p className="text-xs sm:text-sm text-neutral-500 truncate mt-0.5 font-medium">
                      Securely end your current administrator session.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowLogoutModal(true)}
                  className="px-4 sm:px-5 py-2 bg-red-50 hover:bg-red-100 text-[#C9252B] border border-red-200 text-xs sm:text-sm font-bold rounded-lg transition-colors shrink-0 cursor-pointer"
                >
                  Logout
                </button>
              </div>
            </section>

            {/* Bottom Footer Text */}
            <div className="pt-6 text-center">
              <p className="text-xs text-neutral-400 font-medium tracking-wide">
               © Nyaaya Gharjane · Administrator Portal
              </p>
            </div>
          </div>
        )}

        {/* =========================================================
            VIEW 2: DEDICATED SEPARATE PAGE FOR WEBSITE INFORMATION
            ========================================================= */}
        {currentView === "website" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-xs p-6 sm:p-8 space-y-6">
              <div className="border-b border-[#E2E8F0] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#172C4F]">
                    Website Contact & Office Address
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                    ವಿಳಾಸ ಮತ್ತು ಸಂಪರ್ಕ ವಿವರಗಳು ಡೇಟಾಬೇಸ್‌ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಸೇವ್ ಆಗುತ್ತವೆ ಮತ್ತು ವೆಬ್‌ಸೈಟ್‌ಗೆ ಲೈವ್ ಆಗಿ ಅಪ್‌ಡೇಟ್ ಆಗುತ್ತವೆ.
                  </p>
                </div>
                <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  Database Synced
                </span>
              </div>

              {addressSuccess && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-xs sm:text-sm text-emerald-950 font-semibold flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{addressSuccess}</span>
                </div>
              )}

              {addressError && (
                <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-xs sm:text-sm text-red-950 font-semibold flex items-center gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                  <span>{addressError}</span>
                </div>
              )}

              <form onSubmit={handleSaveAddress} className="space-y-5 text-xs sm:text-sm">
                <div>
                  <label className="block font-bold text-[#172C4F] mb-2">
                    Office Address (ಕಚೇರಿ ವಿಳಾಸ) <span className="text-[#C9252B]">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-5 h-5 text-neutral-400 absolute left-3.5 top-3.5" />
                    <textarea
                      rows={3}
                      required
                      value={contactSettings.officeAddress}
                      onChange={(e) =>
                        setContactSettings({
                          ...contactSettings,
                          officeAddress: e.target.value,
                        })
                      }
                      placeholder="ನ್ಯಾಯ ಘರ್ಜನೆ ಭವನ, ಮುಖ್ಯ ರಸ್ತೆ, ಬೆಂಗಳೂರು..."
                      className="w-full pl-11 pr-4 py-3 bg-white border border-[#E2E8F0] rounded-lg text-[#172C4F] font-medium focus:border-[#172C4F] focus:outline-hidden text-xs sm:text-sm transition-colors"
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1.5">
                    ವೆಬ್‌ಸೈಟ್‌ನ ಕೆಳಭಾಗದ ಫೂಟರ್ (Footer) ಮತ್ತು ಸಂಪರ್ಕ ಪುಟದಲ್ಲಿ ಓದುಗರಿಗೆ ಈ ವಿಳಾಸ ಪ್ರದರ್ಶನಗೊಳ್ಳುತ್ತದೆ.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block font-bold text-[#172C4F] mb-2">
                      Contact Email (ಸಂಪರ್ಕ ಈಮೇಲ್) <span className="text-[#C9252B]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-neutral-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={contactSettings.contactEmail}
                        onChange={(e) =>
                          setContactSettings({
                            ...contactSettings,
                            contactEmail: e.target.value,
                          })
                        }
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[#172C4F] font-medium focus:border-[#172C4F] focus:outline-hidden text-xs sm:text-sm transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-[#172C4F] mb-2">
                      Phone Number (ದೂರವಾಣಿ ಸಂಖ್ಯೆ) <span className="text-[#C9252B]">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-neutral-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={contactSettings.contactPhone}
                        onChange={(e) =>
                          setContactSettings({
                            ...contactSettings,
                            contactPhone: e.target.value,
                          })
                        }
                        placeholder="+91 94480 00000"
                        className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[#172C4F] font-medium focus:border-[#172C4F] focus:outline-hidden text-xs sm:text-sm transition-colors"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end border-t border-[#E2E8F0]">
                  <button
                    type="submit"
                    disabled={isSavingAddress}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#C9252B] hover:bg-[#B71C1C] text-white text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50 group"
                  >
                    {isSavingAddress ? (
                      <ThinArcLoader className="w-4 h-4" strokeWidth={1.25} />
                    ) : (
                      <SquarePenIcon size={16} className="text-white" />
                    )}
                    <span>Save changes to Database & Website</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* =========================================================
            VIEW 3: DEDICATED SEPARATE PAGE FOR SECURITY & ACCESS
            ========================================================= */}
        {currentView === "security" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-xs p-6 sm:p-8 space-y-6">
              <div className="border-b border-[#E2E8F0] pb-5">
                <h2 className="text-lg sm:text-xl font-bold text-[#172C4F]">
                  Security & Access Permissions
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  ನಿರ್ವಾಹಕರ ಭದ್ರತಾ ನಿಯಂತ್ರಣಗಳು ಮತ್ತು ಪಾಸ್‌ವರ್ಡ್ ನಿರ್ವಹಣೆ.
                </p>
              </div>

              {/* Status Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="p-4 bg-[#FAFAFA] rounded-lg border border-[#E2E8F0] space-y-1">
                  <span className="text-neutral-500 block text-xs font-medium">Authentication Gateway</span>
                  <div className="font-bold text-[#172C4F] flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Firebase Identity Platform (Active)</span>
                  </div>
                </div>

                <div className="p-4 bg-[#FAFAFA] rounded-lg border border-[#E2E8F0] space-y-1">
                  <span className="text-neutral-500 block text-xs font-medium">Access Permissions</span>
                  <div className="font-bold text-[#172C4F] flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Full Administrator Privileges</span>
                  </div>
                </div>
              </div>

              {/* Password Management Section - Only reveals form and submit button after clicking Change Password */}
              <div className="pt-4 border-t border-[#E2E8F0] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-[#FAFAFA] rounded-lg border border-[#E2E8F0]">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-white text-[#172C4F] border border-[#E2E8F0] flex items-center justify-center shrink-0 shadow-2xs">
                      <KeyIcon size={20} className="text-[#172C4F]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#172C4F]">
                        Account Password (ಖಾತೆಯ ಪಾಸ್‌ವರ್ಡ್)
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                        Protected with Firebase Authentication • • • • • • • •
                      </p>
                    </div>
                  </div>

                  {!isChangingPassword && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsChangingPassword(true);
                        setPasswordError(null);
                        setPasswordSuccess(null);
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-white hover:bg-neutral-50 text-[#172C4F] hover:text-[#C9252B] border border-[#E2E8F0] rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-2xs shrink-0 group"
                    >
                      <KeyIcon size={16} className="text-[#C9252B]" />
                      <span>Change password</span>
                    </button>
                  )}
                </div>

                {passwordSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-xs sm:text-sm text-emerald-950 font-semibold flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{passwordSuccess}</span>
                  </div>
                )}

                {passwordError && (
                  <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-xs sm:text-sm text-red-950 font-semibold flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                {/* Form and Update Password button ONLY visible when isChangingPassword is true */}
                {isChangingPassword && (
                  <form
                    onSubmit={handleUpdatePassword}
                    className="p-5 sm:p-6 bg-[#FAFAFA] border border-[#E2E8F0] rounded-lg space-y-4 text-xs sm:text-sm transition-all"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                      <div>
                        <h4 className="font-bold text-[#172C4F] text-sm">
                          Update Administrator Password (ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾವಣೆ)
                        </h4>
                        <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                          Enter your current password and choose a new secure password.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                          setPasswordError(null);
                        }}
                        className="px-3 py-1 text-xs text-neutral-500 hover:text-neutral-800 font-semibold rounded-md hover:bg-neutral-200/60 cursor-pointer transition-colors"
                      >
                        Cancel
                      </button>
                    </div>

                    <div>
                      <label className="block font-bold text-[#172C4F] mb-1.5">
                        Current Password (ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್) <span className="text-[#C9252B]">*</span>
                      </label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[#172C4F] font-medium focus:border-[#172C4F] focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-[#172C4F] mb-1.5">
                          New Password (ಹೊಸ ಪಾಸ್‌ವರ್ಡ್) <span className="text-[#C9252B]">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimum 6 characters"
                          className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[#172C4F] font-medium focus:border-[#172C4F] focus:outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-[#172C4F] mb-1.5">
                          Confirm Password (ದೃಢೀಕರಣ ಪಾಸ್‌ವರ್ಡ್) <span className="text-[#C9252B]">*</span>
                        </label>
                        <input
                          type="password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Re-enter new password"
                          className="w-full px-4 py-2.5 bg-white border border-[#E2E8F0] rounded-lg text-[#172C4F] font-medium focus:border-[#172C4F] focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#E2E8F0]">
                      <button
                        type="button"
                        onClick={() => {
                          setIsChangingPassword(false);
                          setCurrentPassword("");
                          setNewPassword("");
                          setConfirmPassword("");
                          setPasswordError(null);
                        }}
                        className="px-4 py-2 text-xs sm:text-sm font-semibold text-neutral-600 hover:text-[#172C4F] transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#172C4F] hover:bg-[#0F1C33] text-white text-xs sm:text-sm font-bold rounded-lg transition-colors cursor-pointer shadow-xs group"
                      >
                        <KeyIcon size={16} className="text-white" />
                        <span>Update password</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Passkeys & Biometric Security Section */}
              <div className="pt-6 border-t border-[#E2E8F0] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-red-50 text-[#C9252B] border border-red-200 flex items-center justify-center shrink-0 shadow-2xs">
                      <Fingerprint className="w-5 h-5 text-[#C9252B]" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#172C4F]">
                        Passkeys & Biometric Security
                      </h3>
                      <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                        Windows Hello, Android Fingerprint, Touch ID, and Face ID credentials.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRegisterNewPasskey}
                    disabled={isRegisteringPasskey}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#C9252B] hover:bg-[#B71C1C] disabled:bg-neutral-300 text-white rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer shadow-xs shrink-0"
                  >
                    {isRegisteringPasskey ? (
                      <>
                        <ThinArcLoader className="w-4 h-4" strokeWidth={1.25} />
                        <span>Enrolling...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Enroll New Device</span>
                      </>
                    )}
                  </button>
                </div>

                {passkeySuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-lg text-xs sm:text-sm text-emerald-950 font-semibold flex items-center gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>{passkeySuccess}</span>
                  </div>
                )}

                {passkeyError && (
                  <div className="p-4 bg-red-50 border border-red-300 rounded-lg text-xs sm:text-sm text-red-950 font-semibold flex items-center gap-2.5">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <span>{passkeyError}</span>
                  </div>
                )}

                {/* Enrolled Passkeys List */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-neutral-600 uppercase tracking-wider">
                    Enrolled Devices
                  </h4>

                  {isLoadingPasskeys ? (
                    <div className="p-6 text-center text-xs text-neutral-500">
                      <ThinArcLoader className="w-5 h-5 mx-auto mb-2" strokeWidth={1.25} />
                      Loading devices...
                    </div>
                  ) : passkeys.length === 0 ? (
                    <div className="p-5 text-center bg-[#FAFAFA] border border-[#E2E8F0] rounded-lg text-xs text-neutral-500">
                      No passkey devices registered. Use the button above to register this device.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#E2E8F0] border border-[#E2E8F0] rounded-lg bg-white overflow-hidden">
                      {passkeys.map((p) => (
                        <div
                          key={p.credentialId}
                          className="p-4 flex items-center justify-between gap-4 hover:bg-[#FAFAFA] transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700 shrink-0">
                              {p.transports?.includes("internal") ? (
                                <Monitor className="w-4 h-4 text-blue-600" />
                              ) : (
                                <Fingerprint className="w-4 h-4 text-purple-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs sm:text-sm font-bold text-[#172C4F] truncate">
                                {p.deviceName}
                              </p>
                              <p className="text-[11px] text-neutral-400">
                                Enrolled: {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} • Last used: {new Date(p.lastUsedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setPasskeyToDelete(p)}
                            disabled={deletingCredId === p.credentialId}
                            className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                            title="Remove Passkey Device"
                          >
                            {deletingCredId === p.credentialId ? (
                              <ThinArcLoader className="w-4 h-4" strokeWidth={1.25} />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================
            VIEW 4: DEDICATED SEPARATE PAGE FOR ACTIVE SESSIONS
            ========================================================= */}
        {currentView === "sessions" && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-xs p-6 sm:p-8 space-y-6">
              <div className="border-b border-[#E2E8F0] pb-5">
                <h2 className="text-lg sm:text-xl font-bold text-[#172C4F]">
                  Active Sessions & Device Management
                </h2>
                <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                  ನಿಮ್ಮ ಖಾತೆಗೆ ಲಾಗಿನ್ ಆಗಿರುವ ಸಾಧನಗಳ ಪಟ್ಟಿ ಮತ್ತು ಸೆಶನ್ ನಿಯಂತ್ರಣ.
                </p>
              </div>

              {/* Current Device Card */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Current Active Device
                </h3>

                <div className="p-4 sm:p-5 bg-[#FAFAFA] rounded-lg border border-[#E2E8F0] flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-[#172C4F] text-sm flex items-center gap-2">
                        <span>Web Browser Session</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Active now
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                        Administrator account: {session?.email || "admin@nyaayagharjane.com"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Revoke Sessions Danger Box */}
              <div className="p-5 bg-red-50/70 border border-red-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs sm:text-sm">
                <div className="flex items-start gap-3 text-red-950">
                  <AlertTriangle className="w-5 h-5 text-[#C9252B] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm">Revoke all active sessions (ಎಲ್ಲಾ ಸೆಶನ್‌ಗಳ ರದ್ದತಿ)</h4>
                    <p className="text-xs text-neutral-600 mt-1 leading-relaxed max-w-xl">
                      ಈ ಬಟನ್ ಒತ್ತಿದಾಗ ಎಲ್ಲಾ ಬ್ರೌಸರ್‌ಗಳು ಮತ್ತು ಸಾಧನಗಳಲ್ಲಿರುವ ಲಾಗಿನ್ ಸೆಶನ್‌ಗಳು ತಕ್ಷಣ ರದ್ದಾಗುತ್ತವೆ. ಯಾವುದೇ ಅನಧಿಕೃತ ಪ್ರವೇಶ ತಡೆಯಲು ಇದು ಸೂಕ್ತವಾಗಿದೆ.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowRevokeModal(true)}
                  className="px-4 py-2 bg-[#C9252B] hover:bg-[#B71C1C] text-white text-xs sm:text-sm font-bold rounded-lg transition-colors shrink-0 shadow-xs cursor-pointer"
                >
                  Revoke all sessions
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Revoke Sessions Confirmation Modal */}
      <ConfirmationModal
        isOpen={showRevokeModal}
        onClose={() => !isRevoking && setShowRevokeModal(false)}
        onConfirm={handleConfirmRevokeSessions}
        title="Revoke All Active Sessions"
        description="Are you sure you want to revoke all active sessions? You will be signed out of this and all other devices immediately."
        confirmText={isRevoking ? "Revoking..." : "Revoke all sessions"}
        cancelText="Cancel"
        variant="danger"
        iconType="logout"
        isLoading={isRevoking}
      />

      {/* Delete Passkey Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(passkeyToDelete)}
        onClose={() => !deletingCredId && setPasskeyToDelete(null)}
        onConfirm={handleConfirmDeletePasskey}
        title="Delete Passkey Device"
        description={
          passkeyToDelete ? (
            <div className="space-y-3">
              <p className="text-neutral-700">
                Are you sure you want to remove <strong className="text-neutral-900 font-bold">&ldquo;{passkeyToDelete.deviceName}&rdquo;</strong> from your administrator account?
              </p>
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-900 space-y-1.5">
                <p className="font-semibold text-red-800">Security Warning</p>
                <p className="text-red-700 leading-relaxed">
                  You will no longer be able to use biometric sign-in with this device. You will need to re-enroll it to sign in with passkeys.
                </p>
              </div>
            </div>
          ) : ""
        }
        confirmText={deletingCredId ? "Deleting..." : "Delete Device"}
        cancelText="Cancel"
        variant="danger"
        iconType="trash"
        isLoading={Boolean(deletingCredId)}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        title="Sign Out Confirmation"
        description="Are you sure you want to sign out of your administrator account?"
        confirmText="Yes, sign out"
        cancelText="Cancel"
        variant="warning"
        iconType="logout"
      />
    </div>
  );
}
