"use client";

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
  Auth,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nyaayagharjane",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "",
};

/**
 * Checks if Firebase Client configuration is set.
 */
export function isFirebaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;

function getFirebaseInstances(): { app: FirebaseApp | null; auth: Auth | null } {
  if (typeof window === "undefined") {
    return { app: null, auth: null };
  }

  if (!isFirebaseConfigured()) {
    return { app: null, auth: null };
  }

  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }

  if (!auth && app) {
    auth = getAuth(app);
  }

  return { app, auth };
}

/**
 * Signs in an administrator using Firebase Authentication.
 */
export async function signInAdmin(
  email: string,
  pass: string
): Promise<{ user: User; idToken: string }> {
  const { auth } = getFirebaseInstances();
  if (!auth) {
    throw new Error(
      "Firebase Auth is not configured. Please add NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID to your environment variables."
    );
  }

  const credential = await signInWithEmailAndPassword(auth, email.trim(), pass);
  const idToken = await credential.user.getIdToken();
  return { user: credential.user, idToken };
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
