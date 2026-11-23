import { Edition } from "@/types";
import { PLACEHOLDER_LATEST_EDITION, PLACEHOLDER_PREVIOUS_EDITIONS } from "@/lib/constants";

const EDITIONS_STORAGE_KEY = "nyaayagharjane_editions_v1";
const ADMIN_AUTH_KEY = "nyaayagharjane_admin_session";
const BIOMETRIC_VERIFIED_KEY = "admin_biometric_verified";

/**
 * Checks whether biometric/passkey verification was completed in this browser session.
 * Stored in sessionStorage so closing the browser/tab resets it, requiring step 2 on next launch.
 */
export function isBiometricVerified(uid?: string): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (uid && sessionStorage.getItem(`${BIOMETRIC_VERIFIED_KEY}_${uid}`) === "true") {
      return true;
    }
    return sessionStorage.getItem(BIOMETRIC_VERIFIED_KEY) === "true";
  } catch {
    return false;
  }
}

/**
 * Marks biometric verification as completed for the current browser session.
 */
export function setBiometricVerified(uid?: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(BIOMETRIC_VERIFIED_KEY, "true");
    if (uid) {
      sessionStorage.setItem(`${BIOMETRIC_VERIFIED_KEY}_${uid}`, "true");
    }
  } catch (err) {
    console.error("Failed to set biometric verification:", err);
  }
}

/**
 * Clears biometric verification state.
 */
export function clearBiometricVerified(uid?: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(BIOMETRIC_VERIFIED_KEY);
    if (uid) {
      sessionStorage.removeItem(`${BIOMETRIC_VERIFIED_KEY}_${uid}`);
    }
  } catch {}
}

export const INITIAL_EDITIONS: Edition[] = [];

/**
 * Retrieve all editions from localStorage or default fallback
 */
export function getStoredEditions(): Edition[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = localStorage.getItem(EDITIONS_STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch {
    return [];
  }
}

/**
 * Save editions to localStorage
 */
export function saveStoredEditions(editions: Edition[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(EDITIONS_STORAGE_KEY, JSON.stringify(editions));
  } catch (err) {
    console.error("Failed to save editions to localStorage:", err);
  }
}

/**
 * Add a new edition
 */
export function addStoredEdition(newEdition: Edition): Edition[] {
  const current = getStoredEditions();
  // Newest at the top
  const updated = [newEdition, ...current.filter((e) => e.id !== newEdition.id)];
  saveStoredEditions(updated);
  return updated;
}

/**
 * Update an existing edition
 */
export function updateStoredEdition(id: string, updates: Partial<Edition>): Edition[] {
  const current = getStoredEditions();
  const updated = current.map((e) => (e.id === id ? { ...e, ...updates } : e));
  saveStoredEditions(updated);
  return updated;
}

/**
 * Delete an edition by id
 */
export function deleteStoredEdition(id: string): Edition[] {
  const current = getStoredEditions();
  const updated = current.filter((e) => e.id !== id);
  saveStoredEditions(updated);
  return updated;
}

/**
 * Toggle publish status of an edition
 */
export function togglePublishStoredEdition(id: string): Edition[] {
  const current = getStoredEditions();
  const updated = current.map((e) =>
    e.id === id ? { ...e, isPublished: !e.isPublished } : e
  );
  saveStoredEditions(updated);
  return updated;
}

/**
 * Reset to default placeholder editions
 */
export function resetEditionsToDefaults(): Edition[] {
  saveStoredEditions(INITIAL_EDITIONS);
  return INITIAL_EDITIONS;
}

/**
 * Admin authentication helpers
 */
export interface AdminUser {
  email: string;
  name: string;
  role: string;
  loggedInAt: string;
}

export function getAdminSession(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(ADMIN_AUTH_KEY);
    if (raw) {
      return JSON.parse(raw) as AdminUser;
    }
    // Cookie fallback
    if (typeof document !== "undefined" && document.cookie.includes("nyaayagharjane_admin=1")) {
      return {
        email: "admin@nyaayagharjane.com",
        name: "ಹರೀಶ್ ಕಮ್ಮನಕೋಟೆ",
        role: "Super Admin",
        loggedInAt: new Date().toISOString(),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function setAdminSession(user: AdminUser): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ADMIN_AUTH_KEY, JSON.stringify(user));
    if (typeof document !== "undefined") {
      document.cookie = "nyaayagharjane_admin=1; path=/; max-age=604800; SameSite=Lax";
    }
  } catch (err) {
    console.error("Failed to set admin session:", err);
  }
}

export function updateAdminSession(updates: Partial<AdminUser>): AdminUser | null {
  const current = getAdminSession();
  if (!current) return null;
  const updated: AdminUser = { ...current, ...updates };
  setAdminSession(updated);
  return updated;
}

export function clearAdminSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(ADMIN_AUTH_KEY);
    clearBiometricVerified();
    if (typeof document !== "undefined") {
      document.cookie = "nyaayagharjane_admin=; path=/; max-age=0; SameSite=Lax";
    }
    // Clear temporary session tokens
    sessionStorage.removeItem("admin_firebase_id_token");
    sessionStorage.removeItem("admin_firebase_uid");
    sessionStorage.removeItem("admin_pending_email");
    sessionStorage.removeItem("admin_pending_name");
  } catch (err) {
    console.error("Failed to clear admin session:", err);
  }
}
