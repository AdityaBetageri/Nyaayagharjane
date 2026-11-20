"use client";

import { initializeApp, getApps, getApp, FirebaseApp, setLogLevel } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
} from "firebase/auth";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey:
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    "AIzaSyApHFR59foCyeCstt8XF7mA2n0RXobhMwU",
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ||
    "nyaayagharjane-01.firebaseapp.com",
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    "nyaayagharjane-01",
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    "nyaayagharjane-01.firebasestorage.app",
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    "112453164063",
  appId:
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID ||
    "1:112453164063:web:f9ccb6a6200e489e5b892a",
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    "G-CQHFFHSFZ1",
};

// Silence Firebase internal console logs to prevent dev overlays on invalid logins
try {
  setLogLevel("silent");
} catch {
  // Ignore in unsupported environments
}

/**
 * Checks if Firebase Client configuration is set.
 */
export function isFirebaseConfigured(): boolean {
  return !!(firebaseConfig.apiKey && firebaseConfig.projectId);
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let analytics: Analytics | null = null;

export function getFirebaseInstances(): {
  app: FirebaseApp | null;
  auth: Auth | null;
  analytics: Analytics | null;
} {
  if (typeof window === "undefined") {
    return { app: null, auth: null, analytics: null };
  }

  if (!isFirebaseConfigured()) {
    return { app: null, auth: null, analytics: null };
  }

  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

    // Initialize Analytics if supported in this environment
    isSupported().then((supported) => {
      if (supported && app) {
        analytics = getAnalytics(app);
      }
    }).catch(() => {
      // Analytics not supported in this browser/environment (e.g. adblocker or SSR)
    });
  }

  if (!auth && app) {
    auth = getAuth(app);
  }

  return { app, auth, analytics };
}

export interface SignInResult {
  success: boolean;
  user?: User;
  idToken?: string;
  error?: string;
  code?: string;
}

/**
 * Signs in an administrator using Firebase Authentication.
 * Catches internal auth errors safely so invalid credentials do not bubble uncaught.
 */
export async function signInAdmin(
  email: string,
  pass: string
): Promise<SignInResult> {
  const { auth } = getFirebaseInstances();
  if (!auth) {
    return {
      success: false,
      error: "Firebase Auth is not configured. Please verify your Firebase project setup.",
      code: "auth/not-configured",
    };
  }

  try {
    const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
    const idToken = await credential.user.getIdToken();
    return { success: true, user: credential.user, idToken };
  } catch (err: unknown) {
    let code = "auth/unknown";
    let message = "Unauthorized access. Login failed.";
    if (err && typeof err === "object") {
      if ("code" in err && typeof (err as { code?: unknown }).code === "string") {
        code = (err as { code: string }).code;
      }
      if ("message" in err && typeof (err as { message?: unknown }).message === "string") {
        message = (err as { message: string }).message;
      }
    }
    return { success: false, error: message, code };
  }
}

/**
 * Signs out the administrator from Firebase Authentication.
 */
export async function signOutAdmin(): Promise<void> {
  const { auth } = getFirebaseInstances();
  if (auth) {
    await signOut(auth);
  }
}

/**
 * Retrieves the current Firebase user's ID token.
 * Force refreshes if specified.
 */
export async function getAdminIdToken(
  forceRefresh: boolean = false
): Promise<string | null> {
  const { auth } = getFirebaseInstances();
  if (!auth || !auth.currentUser) {
    // Check if an ID token is stored in sessionStorage as fallback
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("admin_firebase_id_token");
    }
    return null;
  }

  try {
    const token = await auth.currentUser.getIdToken(forceRefresh);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("admin_firebase_id_token", token);
    }
    return token;
  } catch (err) {
    console.error("Failed to retrieve Firebase ID token:", err);
    return null;
  }
}

/**
 * Subscribes to Firebase Authentication state changes.
 */
export function onAdminAuthStateChanged(
  callback: (user: User | null) => void
): () => void {
  const { auth } = getFirebaseInstances();
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, async (user) => {
    if (user && typeof window !== "undefined") {
      try {
        const token = await user.getIdToken();
        sessionStorage.setItem("admin_firebase_id_token", token);
      } catch (e) {
        console.warn("Could not cache ID token:", e);
      }
    } else if (typeof window !== "undefined") {
      sessionStorage.removeItem("admin_firebase_id_token");
    }
    callback(user);
  });
}
