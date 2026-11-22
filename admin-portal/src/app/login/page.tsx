"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  LogIn,
} from "lucide-react";
import { getAdminSession, isBiometricVerified } from "@/lib/editionsStore";
import { isFirebaseConfigured, signInAdmin, onAdminAuthStateChanged } from "@/lib/firebase";
import { ThinArcLoader } from "@/components/shared/ThinArcLoader";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // If already authenticated with Firebase, redirect directly to dashboard or passkey gate
  useEffect(() => {
    const unsub = onAdminAuthStateChanged((user) => {
      if (user) {
        if (isBiometricVerified(user.uid)) {
          router.replace("/dashboard");
        } else {
          router.replace("/passkey");
        }
      }
    });
    return () => unsub();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const userEmail = email.trim();
    if (!userEmail) {
      setError("Please enter your email address.");
      setIsLoading(false);
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      setIsLoading(false);
      return;
    }

    try {
      // Strict Firebase Authentication: only registered admin accounts can log in
      if (!isFirebaseConfigured()) {
        setError("Firebase authentication is not configured.");
        setIsLoading(false);
        return;
      }

      const result = await signInAdmin(userEmail, password);

      if (!result.success || !result.user || !result.user.email || !result.idToken) {
        let errorMsg = "Unauthorized: No access to this account.";
        const code = (result.code || "").toLowerCase();
        const msg = (result.error || "").toLowerCase();

        if (
          code.includes("user-not-found") ||
          code.includes("invalid-credential") ||
          msg.includes("user-not-found") ||
          msg.includes("invalid-credential")
        ) {
          errorMsg = "Unauthorized: No access to this account.";
        } else if (code.includes("wrong-password") || msg.includes("wrong-password")) {
          errorMsg = "Incorrect password. Please try again.";
        } else if (code.includes("invalid-email") || msg.includes("invalid-email")) {
          errorMsg = "Invalid email address format.";
        } else if (code.includes("operation-not-allowed") || msg.includes("operation-not-allowed")) {
          errorMsg = "Email/Password provider is not enabled in Firebase Console.";
        } else if (code.includes("too-many-requests") || msg.includes("too-many-requests")) {
          errorMsg = "Too many failed attempts. Please try again later.";
        } else if (code.includes("not-configured")) {
          errorMsg = "Firebase authentication is not configured.";
        }

        setError(errorMsg);
        setIsLoading(false);
        return;
      }

      const { user, idToken } = result;

      if (typeof window !== "undefined") {
        sessionStorage.setItem("admin_firebase_id_token", idToken);
        sessionStorage.setItem("admin_firebase_uid", user.uid);
        // Store pending session data for passkey page to use after verification
        sessionStorage.setItem("admin_pending_email", user.email || userEmail);
        sessionStorage.setItem(
          "admin_pending_name",
          user.displayName || "ಹರೀಶ್ ಕಮ್ಮನಕೋಟೆ"
        );
      }

      // Do NOT create full admin session here — passkey page does that after verification
      router.push("/passkey");
      return;
    } catch {
      setError("Unauthorized access: Account not found.");
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-700 text-white flex flex-col justify-between relative overflow-hidden">
      {/* Background radial subtle accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#fffff00a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-40" />
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-red-600/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

      {/* Top Navbar Back Link */}
      <header className="relative z-10 p-4 sm:p-6 flex items-center justify-between max-w-6xl mx-auto w-full">
        <a
          href={process.env.NEXT_PUBLIC_MAIN_SITE_URL || "https://www.nyaayagharjane.com"}
          className="inline-flex items-center gap-2 text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3.5 py-2 rounded-lg border border-white/10 backdrop-blur-xs"
        >
          <ArrowLeft className="w-4 h-4 text-[#C62828]" />
          <span>ಮುಖ್ಯ ವೆಬ್‌ಸೈಟ್‌ಗೆ ಹಿಂತಿರುಗಿ</span>
        </a>

        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <ShieldCheck className="w-4 h-4 text-[#C62828]" />
          <span className="hidden sm:inline">ಸುರಕ್ಷಿತ ಆಡಳಿತ ಪ್ರವೇಶ</span>
        </div>
      </header>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-auto p-4 sm:p-6 my-auto">
        <div className="bg-neutral-950/80 border border-neutral-800 rounded-lg p-6 sm:p-8 shadow-2xl backdrop-blur-md space-y-6">
          {/* Brand & Icon Header */}
          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto shrink-0">
              <Image
                src="/logo.png"
                alt="ನ್ಯಾಯ ಘರ್ಜನೆ"
                width={968}
                height={968}
                priority
                className="w-full h-full object-contain rounded-lg drop-shadow-md"
              />
            </div>

            <div className="pt-2">
              <h1 className="text-2xl sm:text-3xl font-black text-white font-serif tracking-tight">
                ನ್ಯಾಯ ಘರ್ಜನೆ
              </h1>
              <p className="text-xs font-semibold text-[#FF8A80] mt-3.5">
                ಆಡಳಿತ ಮಂಡಳಿ ಲಾಗಿನ್ (Admin Portal)
              </p>
            </div>
            <p className="text-xs text-neutral-400">
              ಇ-ಪತ್ರಿಕೆಗಳನ್ನು ನಿರ್ವಹಿಸಲು ಮತ್ತು ಹೊಸ ಸಂಚಿಕೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಲು ಪ್ರವೇಶಿಸಿ
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg flex items-start gap-2.5 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold text-neutral-300"
              >
                ಇಮೇಲ್ / ಬಳಕೆದಾರ ಐಡಿ (Email)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-email"
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nyaayagharjane.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold text-neutral-300"
                >
                  ಗುಪ್ತಪದ (Password)
                </label>
                <span className="text-[11px] text-neutral-500">ಕನಿಷ್ಠ ೪ ಅಕ್ಷರ</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-hidden focus:ring-2 focus:ring-[#C62828] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#C62828] hover:bg-[#B71C1C] disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-lg font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <ThinArcLoader className="w-4 h-4" strokeWidth={1.25} />
                  <span>ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>ಪ್ರವೇಶಿಸಿ (Login to Dashboard)</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 p-4 text-center text-xs text-neutral-500">
        © 2026 ನ್ಯಾಯ ಘರ್ಜನೆ • ಆಡಳಿತ ವಿಭಾಗ (Admin Panel)
      </footer>
    </main>
  );
}
