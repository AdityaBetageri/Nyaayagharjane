import { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/siteConfig";
import { fetchR2Catalogue, r2ItemToEdition } from "@/lib/r2Service";
import { PLACEHOLDER_LATEST_EDITION, PLACEHOLDER_PREVIOUS_EDITIONS } from "@/lib/constants";
import { Edition } from "@/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const currentDate = "2026-11-20";

  // 1. Static Core Public Pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}/`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${siteUrl}/latest`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.95,
    },
    {
      url: `${siteUrl}/archives`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: "2026-11-16",
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: "2026-11-16",
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];

  // 2. Dynamic Edition Reader Pages
  let editions: Edition[] = [PLACEHOLDER_LATEST_EDITION, ...PLACEHOLDER_PREVIOUS_EDITIONS];

  try {
    const res = await fetchR2Catalogue({ bypassCache: false, publishedOnly: true });
    if (res.success && res.data.length > 0) {
      editions = res.data.map(r2ItemToEdition);
    }
  } catch {
    // Fall back to placeholders
  }

  const editionRoutes: MetadataRoute.Sitemap = editions.map((edition) => ({
    url: `${siteUrl}/reader/${edition.id}`,
    lastModified: edition.publishedAt || currentDate,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  return [...staticRoutes, ...editionRoutes];
}
