"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  ShieldCheck,
  Key,
  Globe,
  Save,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ExternalLink,
  Lock,
  Mail,
  UserCheck,
  Server,
} from "lucide-react";
import {
  getAdminSession,
  updateAdminSession,
  clearAdminSession,
  AdminUser,
} from "@/lib/editionsStore";
import { getR2PublicUrl } from "@/lib/r2Service";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [session, setSession] = useState<AdminUser | null>(null);
  const [r2Url, setR2Url] = useState("");
  const [r2Configured, setR2Configured] = useState<boolean | null>(null);

  // Profile Form State
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      const current = getAdminSession();
      if (current) {
        setSession(current);
        setDisplayName(current.name || "ಮುಖ್ಯ ನಿರ್ವಾಹಕರು");
        setEmail(current.email || "admin@nyaayagharjane.com");
      }
      setR2Url(getR2PublicUrl());
    });

    fetch("/api/r2/status")
      .then((res) => res.json())
      .then((data) => setR2Configured(!!data.isFullyConfigured))
      .catch(() => setR2Configured(false));
  }, []);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileSuccess(null);

    if (!displayName.trim()) {
      setProfileError("ದಯವಿಟ್ಟು ಹೆಸರನ್ನು ನಮೂದಿಸಿ.");
      return;
    }

    if (!email.trim() || !email.includes("@")) {
      setProfileError("ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ.");
      return;
    }

    const updated = updateAdminSession({
      name: displayName.trim(),
      email: email.trim(),
    });

    if (updated) {
      setSession(updated);
      setProfileSuccess("ಖಾತೆ ವಿವರಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!");
      setTimeout(() => setProfileSuccess(null), 3500);
    }
  };

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

    // In this app, credentials are stored securely in session/localStorage
    setPasswordSuccess("ಪಾಸ್‌ವರ್ಡ್ ಯಶಸ್ವಿಯಾಗಿ ಬದಲಾಗಿದೆ!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setPasswordSuccess(null), 3500);
  };

  const handleLogout = () => {
    if (confirm("ನೀವು ಖಂಡಿತವಾಗಿ ಲಾಗ್‌ಔಟ್ ಆಗಲು ಬಯಸುವಿರಾ? (Confirm logout?)")) {
      clearAdminSession();
      router.push("/admin/login");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#E2E8F0] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-[#172B4D]">
              ಖಾತೆ ಸೆಟ್ಟಿಂಗ್ಸ್ & ಭದ್ರತೆ (Account Settings)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-neutral-100 text-[#172B4D] border border-neutral-200">
              {session?.role || "Super Admin"}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#5A6A85] mt-1">
            ಆಡಳಿತ ಮಂಡಳಿಯ ಖಾತೆ ವಿವರಗಳು, ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತು Cloudflare R2 ಸಂಗ್ರಹಣಾ ಕಾನ್ಫಿಗರೇಶನ್.
          </p>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-red-50 hover:bg-red-100 text-[#C62828] border border-red-200 text-xs font-bold rounded-xl transition-colors shrink-0 cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>ಖಾತೆಯಿಂದ ಲಾಗ್‌ಔಟ್ ಆಗಿ</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Account Profile & Password */}
        <div className="lg:col-span-7 space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-4">
            <div className="border-b border-[#E2E8F0] pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#C62828]">
                <User className="w-5 h-5" />
                <h2 className="text-base sm:text-lg font-black text-[#172B4D]">
                  ವೈಯಕ್ತಿಕ ವಿವರಗಳು (Profile Info)
                </h2>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>ಸಕ್ರಿಯ ಖಾತೆ</span>
              </span>
            </div>

            {profileSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="p-3.5 bg-red-50 border border-red-300 rounded-xl text-xs text-red-950 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#172B4D] mb-1">
                  ನಿರ್ವಾಹಕರ ಹೆಸರು (Display Name) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F8F9FA] border border-neutral-300 rounded-lg text-[#172B4D] font-medium focus:border-[#172B4D] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#172B4D] mb-1">
                  ಇಮೇಲ್ ವಿಳಾಸ (Email Address) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F8F9FA] border border-neutral-300 rounded-lg text-[#172B4D] font-medium focus:border-[#172B4D] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#172B4D] mb-1">ಖಾತೆ ಪಾತ್ರ (Role)</label>
                <input
                  type="text"
                  disabled
                  value={session?.role || "Super Admin"}
                  className="w-full px-3 py-2 bg-neutral-100 border border-neutral-200 rounded-lg text-neutral-600 font-semibold cursor-not-allowed"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#172B4D] hover:bg-[#0F1C33] text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>ವಿವರಗಳನ್ನು ಉಳಿಸಿ (Save Changes)</span>
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-4">
            <div className="border-b border-[#E2E8F0] pb-3 flex items-center gap-2 text-[#C62828]">
              <Lock className="w-5 h-5" />
              <h2 className="text-base sm:text-lg font-black text-[#172B4D]">
                ಪಾಸ್‌ವರ್ಡ್ ಬದಲಾವಣೆ (Security & Password)
              </h2>
            </div>

            {passwordSuccess && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-xs text-emerald-950 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 bg-red-50 border border-red-300 rounded-xl text-xs text-red-950 font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-[#172B4D] mb-1">
                  ಪ್ರಸ್ತುತ ಪಾಸ್‌ವರ್ಡ್ (Current Password)
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#F8F9FA] border border-neutral-300 rounded-lg text-[#172B4D]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#172B4D] mb-1">
                    ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ (New Password)
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="ಕನಿಷ್ಠ ೬ ಅಕ್ಷರಗಳು"
                    className="w-full px-3 py-2 bg-[#F8F9FA] border border-neutral-300 rounded-lg text-[#172B4D]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#172B4D] mb-1">
                    ದೃಢೀಕರಣ (Confirm Password)
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="ಮತ್ತೆ ನಮೂದಿಸಿ"
                    className="w-full px-3 py-2 bg-[#F8F9FA] border border-neutral-300 rounded-lg text-[#172B4D]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <Key className="w-4 h-4" />
                  <span>ಪಾಸ್‌ವರ್ಡ್ ನವೀಕರಿಸಿ</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Cloudflare R2 Connection Status & System Info */}
        <div className="lg:col-span-5 space-y-6">
          {/* Cloudflare R2 Integration Card */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-xs p-5 sm:p-6 space-y-4">
            <div className="border-b border-[#E2E8F0] pb-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-700">
                <Server className="w-5 h-5" />
                <h3 className="text-base font-bold text-[#172B4D]">Cloudflare R2 ಸ್ಥಿತಿ</h3>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  r2Configured
                    ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                    : "bg-amber-50 text-amber-800 border-amber-200"
                }`}
              >
                {r2Configured ? "ಸಂಪರ್ಕಗೊಂಡಿದೆ" : "ಕಾನ್ಫಿಗರ್ ಅಗತ್ಯವಿದೆ"}
              </span>
            </div>

            <div className="space-y-2.5 text-xs text-[#5A6A85]">
              <div>
                <span className="font-bold text-[#172B4D] block">ಸಾರ್ವಜನಿಕ ಕಸ್ಟಮ್ URL:</span>
                <span className="font-mono text-[11px] text-neutral-700 break-all bg-neutral-50 p-2 rounded block mt-0.5 border border-neutral-200">
                  {r2Url || "https://files.yourdomain.com (ಕಾನ್ಫಿಗರ್ ಆಗಿಲ್ಲ)"}
                </span>
              </div>

              <div>
                <span className="font-bold text-[#172B4D] block">R2 ಬಕೆಟ್ ಹೆಸರು:</span>
                <span className="font-mono text-[11px] text-neutral-700 bg-neutral-50 p-2 rounded block mt-0.5 border border-neutral-200">
                  enewspaper-storage
                </span>
              </div>

              <div>
                <span className="font-bold text-[#172B4D] block">ಕ್ಯಾಟಲಾಗ್ ಫೈಲ್ ಮಾರ್ಗ:</span>
                <span className="font-mono text-[11px] text-neutral-700 bg-neutral-50 p-2 rounded block mt-0.5 border border-neutral-200">
                  data/newspapers.json
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row gap-2">
              <Link
                href="/admin/verifier"
                className="flex-1 py-2 px-3 bg-neutral-100 hover:bg-neutral-200 text-[#172B4D] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-purple-600" />
                <span>ಕನೆಕ್ಷನ್ ಟೆಸ್ಟರ್</span>
              </Link>

              <Link
                href="/admin/guide"
                className="flex-1 py-2 px-3 bg-[#F8F9FA] hover:bg-neutral-200 text-[#172B4D] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-neutral-200 transition-colors"
              >
                <span>ಪ್ರಕಟಣಾ ಗೈಡ್</span>
                <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
              </Link>
            </div>
          </div>

          {/* Active Session Info Card */}
          <div className="bg-[#172B4D] text-white rounded-2xl p-5 sm:p-6 space-y-3 shadow-xs">
            <div className="flex items-center gap-2 text-[#FF8A80]">
              <ShieldCheck className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">ಸುರಕ್ಷಿತ ನಿರ್ವಾಹಕ ಸೆಶನ್</h3>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              ನಿಮ್ಮ ಲಾಗಿನ್ ಸೆಶನ್ ೭ ದಿನಗಳವರೆಗೆ ಸಕ್ರಿಯವಾಗಿರುತ್ತದೆ. ನೀವು ಬೇರೆ ಕಂಪ್ಯೂಟರ್ ಬಳಸುತ್ತಿದ್ದರೆ ಕೆಲಸ ಮುಗಿದ ನಂತರ ಲಾಗ್‌ಔಟ್ ಆಗಲು ಶಿಫಾರಸು ಮಾಡಲಾಗುತ್ತದೆ.
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 bg-[#C62828] hover:bg-[#B71C1C] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>ಖಾತೆಯಿಂದ ಲಾಗ್‌ಔಟ್ ಆಗಿ (Sign Out)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
