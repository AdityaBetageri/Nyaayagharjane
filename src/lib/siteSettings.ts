export interface SiteContactSettings {
  officeAddress: string;
  contactEmail: string;
  contactPhone: string;
  editorName: string;
  editorTitle: string;
  updatedAt?: string;
}

export const DEFAULT_SITE_SETTINGS: SiteContactSettings = {
  officeAddress: "ನ್ಯಾಯ ಘರ್ಜನೆ ಭವನ, ಮುಖ್ಯ ರಸ್ತೆ, ಬೆಂಗಳೂರು, ಕರ್ನಾಟಕ - ೫೬೦೦೦೧",
  contactEmail: "contact@nyaayagharjane.com",
  contactPhone: "+91 94480 00000",
  editorName: "ನ್ಯಾಯ ಘರ್ಜನೆ ಸಂಪಾದಕರು",
  editorTitle: "ಪ್ರಧಾನ ಸಂಪಾದಕರು (Chief Editor)",
};

const STORAGE_KEY = "nyaayagharjane_site_settings";

/**
 * Reads settings synchronously from localStorage (or returns default).
 */
export function getLocalSiteSettings(): SiteContactSettings {
  if (typeof window === "undefined") {
    return DEFAULT_SITE_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }

  return DEFAULT_SITE_SETTINGS;
}

/**
 * Fetches settings from API and updates local cache.
 */
export async function fetchSiteSettings(): Promise<SiteContactSettings> {
  try {
    const res = await fetch("/api/settings/contact", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new Event("site_settings_updated"));
      }
      return data;
    }
  } catch (err) {
    console.warn("Could not fetch remote site settings, using local:", err);
  }

  return getLocalSiteSettings();
}

/**
 * Saves site settings both to the server API and local storage.
 */
export async function saveSiteSettings(
  settings: SiteContactSettings
): Promise<SiteContactSettings> {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    window.dispatchEvent(new Event("site_settings_updated"));
  }

  try {
    const res = await fetch("/api/settings/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.settings && typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.settings));
      }
      return data.settings || settings;
    }
  } catch (err) {
    console.error("Failed to persist site settings to server:", err);
  }

  return settings;
}
