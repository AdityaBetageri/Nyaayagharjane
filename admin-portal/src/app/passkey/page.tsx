"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Fingerprint,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Monitor,
  Key,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Plus,
} from "lucide-react";
import { ThinArcLoader } from "@/components/shared/ThinArcLoader";
import {
  setAdminSession,
  isBiometricVerified,
  setBiometricVerified,
} from "@/lib/editionsStore";
import {
  onAdminAuthStateChanged,
  signOutAdmin,
} from "@/lib/firebase";
import {
  checkPasskeyStatus,
  registerPasskey,
  authenticatePasskey,
  PasskeyCredentialInfo,
} from "@/lib/passkeyClient";
import type { User } from "firebase/auth";

type PageView = "loading" | "enroll" | "verify" | "success" | "error";

export default function PasskeyPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<PageView>("loading");
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [credentials, setCredentials] = useState<PasskeyCredentialInfo[]>([]);
  const [successDevice, setSuccessDevice] = useState<string>("");
  const [successAction, setSuccessAction] = useState<"enrolled" | "verified">("verified");

  const authCheckedRef = useRef(false);

  // Monitor Firebase Auth state
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAdminAuthStateChanged(async (user) => {
      if (!isMounted) return;

      if (!user) {
        // Step 1 not completed: Redirect to primary email/password login
        router.replace("/login");
        return;
      }

      setCurrentUser(user);

      // Check if this browser session already passed Step 2 biometric verification
      if (isBiometricVerified(user.uid)) {
        router.replace("/dashboard");
        return;
      }

      // If already checked passkeys for this user, don't re-fetch needlessly
      if (authCheckedRef.current) return;
      authCheckedRef.current = true;

      // Load enrolled passkeys from server
      try {
        const { hasPasskeys, credentials: creds } = await checkPasskeyStatus();
        if (!isMounted) return;
        setCredentials(creds);
        setView(hasPasskeys ? "verify" : "enroll");
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : "Failed to check passkey status.";
        setError(msg);
        setView("error");
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [router]);

  // ─── Enrollment Flow ─────────────────────────────────────────────────────

  const handleEnroll = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      const result = await registerPasskey();
      setSuccessDevice(result.deviceName);
      setSuccessAction("enrolled");
      handleSuccess(result.deviceName, "enrolled");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Enrollment failed.";
      setError(msg);
      setIsProcessing(false);
    }
  };

  // ─── Verification Flow ───────────────────────────────────────────────────

  const handleVerify = async () => {
    setError(null);
    setIsProcessing(true);
    try {
      const result = await authenticatePasskey();
      setSuccessDevice(result.deviceName);
      setSuccessAction("verified");
      handleSuccess(result.deviceName, "verified");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Verification failed.";
      if (msg === "NO_PASSKEYS") {
        setView("enroll");
      } else {
        setError(msg);
      }
      setIsProcessing(false);
    }
  };

  // ─── Success Handler ─────────────────────────────────────────────────────

  const handleSuccess = (deviceName: string, action: "enrolled" | "verified") => {
    const uid = currentUser?.uid || "admin";
    // Mark biometric verification as valid for this browser session
    setBiometricVerified(uid);

    // Persist admin session
    const email = currentUser?.email || "admin@nyaayagharjane.com";
    const name = currentUser?.displayName || "ಹರೀಶ್ ಕಮ್ಮನಕೋಟೆ";

    setAdminSession({
      email,
      name,
      role: "Super Admin",
      loggedInAt: new Date().toISOString(),
    });

    setView("success");
    setIsProcessing(false);

    // Auto navigate to dashboard after a short confirmation
    setTimeout(() => {
      router.replace("/dashboard");
    }, 1200);
  };

  // ─── Switch Account / Cancel ─────────────────────────────────────────────

  const handleSwitchAccount = async () => {
    setIsProcessing(true);
    try {
      await signOutAdmin();
    } catch {}
    router.replace("/login");
  };

  const registeredName =
    currentUser?.displayName ||
    (currentUser?.email ? currentUser.email.split("@")[0] : "ಹರೀಶ್ ಕಮ್ಮನಕೋಟೆ");

  return (
    <main className="min-h-screen bg-neutral-900 text-white flex flex-col justify-center items-center relative overflow-hidden p-4">
      {/* Background accents */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff06_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#C62828]/10 blur-[140px] pointer-events-none" />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="bg-neutral-950/90 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md">
          {/* Logo */}
          <div className="text-center mb-5">
            <div className="w-14 h-14 mx-auto mb-3">
              <Image
                src="/logo.png"
                alt="ನ್ಯಾಯ ಘರ್ಜನೆ"
                width={968}
                height={968}
                priority
                className="w-full h-full object-contain rounded-lg drop-shadow-md"
              />
            </div>

            {/* Step 2 of 2 Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5" />
              <span>Step 2 of 2 • Hardware Biometric Gate</span>
            </div>
          </div>

          {/* Authenticated Admin Identity Card (Only when user is loaded) */}
          {currentUser && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-900/80 border border-neutral-800 mb-6">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-[#C62828] text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {registeredName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-white truncate">
                    {registeredName}
                  </div>
                  <div className="text-[11px] text-neutral-400 truncate">
                    {currentUser.email}
                  </div>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shrink-0">
                Admin Confirmed
              </span>
            </div>
          )}

          {/* ─── Loading View ────────────────────────────────────────── */}
          {view === "loading" && (
            <div className="text-center space-y-4 py-8">
              <ThinArcLoader className="w-10 h-10 mx-auto" strokeWidth={1.25} />
              <p className="text-xs text-neutral-400">
                Checking passkey security status...
              </p>
            </div>
          )}

          {/* ─── Enrollment View ────────────────────────────────────── */}
          {view === "enroll" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mb-2">
                  <Key className="w-8 h-8 text-amber-400" />
                </div>
                <h1 className="text-lg font-bold text-white">
                  Security Passkey Enrollment
                </h1>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Enroll your fingerprint, Windows Hello, or device PIN.
                  This ensures only your physical device can unlock the admin dashboard.
                </p>
              </div>

              {/* Supported registration methods */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
                  <Monitor className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Windows Hello</span>
                    <span className="text-neutral-400 ml-1">— Fingerprint, Face, or PIN</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
                  <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Mobile Device</span>
                    <span className="text-neutral-400 ml-1">— Touch ID, Face ID, or Screen Lock</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800">
                  <Fingerprint className="w-4 h-4 text-purple-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-white">Security Key</span>
                    <span className="text-neutral-400 ml-1">— USB or NFC FIDO2 Key</span>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg flex items-start gap-2 text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleEnroll}
                disabled={isProcessing}
                className="w-full py-3 bg-[#C62828] hover:bg-[#B71C1C] disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <ThinArcLoader className="w-4 h-4" strokeWidth={1.25} />
                    <span>Waiting for device...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Enroll This Device Passkey</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSwitchAccount}
                className="w-full py-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Use a different account</span>
              </button>
            </div>
          )}

          {/* ─── Verification View (Returning Admin) ──────────────────── */}
          {view === "verify" && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#C62828]/10 border-2 border-[#C62828]/40 flex items-center justify-center mb-3">
                  <Fingerprint className="w-10 h-10 text-[#C62828] animate-pulse" />
                </div>
                <h1 className="text-xl font-bold text-white">
                  Fingerprint / Passkey Verification
                </h1>
                <p className="text-xs text-neutral-400">
                  Use your registered device to verify your identity.
                </p>
              </div>

              {/* Enrolled devices */}
              {credentials.length > 0 && (
                <div className="space-y-2">
                  <p className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                    Enrolled Devices
                  </p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {credentials.map((cred) => (
                      <div
                        key={cred.credentialId}
                        className="flex items-center gap-3 p-2.5 rounded-lg bg-neutral-900/60 border border-neutral-800"
                      >
                        <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center shrink-0">
                          {cred.transports?.includes("internal") ? (
                            <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-white truncate">
                            {cred.deviceName}
                          </p>
                          <p className="text-[10px] text-neutral-500">
                            Last verified:{" "}
                            {new Date(cred.lastUsedAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg flex items-start gap-2 text-xs text-red-200">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleVerify}
                disabled={isProcessing}
                className="w-full py-3.5 bg-[#C62828] hover:bg-[#B71C1C] disabled:bg-neutral-800 disabled:text-neutral-500 text-white rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <ThinArcLoader className="w-4 h-4" strokeWidth={1.25} />
                    <span>Waiting for biometric scan...</span>
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4 h-4" />
                    <span>Verify with Fingerprint / Passkey</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSwitchAccount}
                className="w-full py-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Use a different account</span>
              </button>
            </div>
          )}

          {/* ─── Success View ────────────────────────────────────────── */}
          {view === "success" && (
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <div className="space-y-1.5">
                <h1 className="text-lg font-bold text-white">
                  {successAction === "enrolled" ? "Passkey Enrolled!" : "Authorization Check Passed"}
                </h1>
                <p className="text-xs text-neutral-400">
                  Verified via {successDevice || "Hardware Biometric"}. Opening Admin Dashboard...
                </p>
              </div>
              <ThinArcLoader className="w-5 h-5 mx-auto" strokeWidth={1.25} />
            </div>
          )}

          {/* ─── Error View ──────────────────────────────────────────── */}
          {view === "error" && (
            <div className="space-y-5 text-center py-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/10 border-2 border-red-500/40 flex items-center justify-center">
                <ShieldAlert className="w-8 h-8 text-red-400" />
              </div>
              <div className="space-y-1">
                <h1 className="text-lg font-bold text-white">
                  Security Check Failed
                </h1>
                <p className="text-xs text-red-300">{error}</p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setView("loading");
                    checkPasskeyStatus()
                      .then(({ hasPasskeys, credentials: creds }) => {
                        setCredentials(creds);
                        setView(hasPasskeys ? "verify" : "enroll");
                      })
                      .catch((err) => {
                        setView("error");
                        setError(err.message || "Failed to connect to authentication server.");
                      });
                  }}
                  className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                >
                  Retry Connection
                </button>
                <button
                  type="button"
                  onClick={handleSwitchAccount}
                  className="w-full py-2 text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  Back to Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-6 text-center text-xs text-neutral-600">
        © 2026 ನ್ಯಾಯ ಘರ್ಜನೆ • Two-Step Protected Admin Access
      </footer>
    </main>
  );
}
