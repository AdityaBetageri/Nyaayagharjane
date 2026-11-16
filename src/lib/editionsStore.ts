import { Edition } from "@/types";
import { PLACEHOLDER_LATEST_EDITION, PLACEHOLDER_PREVIOUS_EDITIONS } from "@/lib/constants";

const EDITIONS_STORAGE_KEY = "nyaayagharjane_editions_v1";
const ADMIN_AUTH_KEY = "nyaayagharjane_admin_session";

export const INITIAL_EDITIONS: Edition[] = [
  PLACEHOLDER_LATEST_EDITION,
  ...PLACEHOLDER_PREVIOUS_EDITIONS,
];

/**
 * Retrieve all editions from localStorage or default fallback
 */
export function getStoredEditions(): Edition[] {
  if (typeof window === "undefined") {
    return INITIAL_EDITIONS;
  }

  try {
    const raw = localStorage.getItem(EDITIONS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(EDITIONS_STORAGE_KEY, JSON.stringify(INITIAL_EDITIONS));
      return INITIAL_EDITIONS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return INITIAL_EDITIONS;
  } catch {
    return INITIAL_EDITIONS;
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
        name: "ಮುಖ್ಯ ನಿರ್ವಾಹಕರು (Chief Admin)",
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
    if (typeof document !== "undefined") {
      document.cookie = "nyaayagharjane_admin=; path=/; max-age=0; SameSite=Lax";
    }
  } catch (err) {
    console.error("Failed to clear admin session:", err);
  }
}
