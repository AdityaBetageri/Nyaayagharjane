/**
 * Central SEO & Site Configuration for Nyaayagharjane (ನ್ಯಾಯ ಘರ್ಜನೆ) E-Newspaper
 * Designed to provide top-ranking SEO in Google Search for Kannada & English queries.
 */

export function getSiteUrl(): string {
  // 1. Environment variable if provided
  const envUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() ||
    process.env.SITE_URL?.trim();

  if (envUrl) {
    return envUrl.replace(/\/+$/, "");
  }

  // 2. Vercel deployment URL fallback
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/+$/, "")}`;
  }

  // 3. Default production domain (configured prior to domain purchase)
  return "https://www.nyaayagharjane.com";
}

export const SITE_CONFIG = {
  name: "ನ್ಯಾಯ ಘರ್ಜನೆ",
  nameEn: "Nyaayagharjane",
  alternateNames: [
    "Nyaaya Gharjane",
    "Nyaya Gharjane",
    "Nyaayagharjane E-Paper",
    "ನ್ಯಾಯ ಘರ್ಜನೆ ಇ-ಪತ್ರಿಕೆ",
    "ನ್ಯಾಯ ಘರ್ಜನೆ ಮಾಸಿಕ ಪತ್ರಿಕೆ",
  ],
  tagline: "ಸತ್ಯದ ಧ್ವನಿ • ನ್ಯಾಯದ ಘರ್ಜನೆ",
  taglineEn: "The Voice of Truth • The Roar of Justice",
  description:
    "ನ್ಯಾಯ ಘರ್ಜನೆ — ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆ. ಸಮಾಜದ ಧ್ವನಿ, ಜನರ ಸಮಸ್ಯೆಗಳು, ಭ್ರಷ್ಟಾಚಾರದ ವಿರುದ್ಧ ಹೋರಾಟ ಮತ್ತು ಸಾರ್ವಜನಿಕ ಹಿತಾಸಕ್ತಿಯ ವಿಶೇಷ ವರದಿಗಳನ್ನು ಹೊತ್ತು ತರುವ ನಿರ್ಭೀತ ಪತ್ರಿಕೆ. ಇತ್ತೀಚಿನ ಮತ್ತು ಹಿಂದಿನ ಎಲ್ಲಾ ಸಂಚಿಕೆಗಳನ್ನು ಉಚಿತವಾಗಿ ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಓದಿ.",
  descriptionEn:
    "Nyaayagharjane is a leading monthly Kannada e-newspaper from Karnataka, India. Fearless journalism delivering in-depth investigative reports, public interest issues, legal awareness, and social justice news. Read the latest and archived monthly editions online for free.",
  locale: "kn_IN",
  languages: ["kn", "en"],
  keywords: [
    // Primary Brand Keywords
    "ನ್ಯಾಯ ಘರ್ಜನೆ",
    "Nyaayagharjane",
    "Nyaaya Gharjane",
    "Nyaya Gharjane",
    "Nyaayagharjane Kannada Paper",
    "Nyaayagharjane e-paper",
    "Nyaayagharjane online",
    "ನ್ಯಾಯ ಘರ್ಜನೆ",
    "ನ್ಯಾಯ ಘರ್ಜನೆ ಪತ್ರಿಕೆ",
    "ನ್ಯಾಯ ಘರ್ಜನೆ ಇ-ಪತ್ರಿಕೆ",
    "ನ್ಯಾಯ ಘರ್ಜನೆ ಮಾಸಿಕ ಪತ್ರಿಕೆ",

    // Industry / Category Keywords
    "Kannada e-paper",
    "Kannada monthly newspaper",
    "Kannada monthly magazine",
    "Kannada news online",
    "Kannada daily news",
    "Karnataka e-newspaper",
    "ಕನ್ನಡ ಇ-ಪತ್ರಿಕೆ",
    "ಕನ್ನಡ ಮಾಸಿಕ ಪತ್ರಿಕೆ",
    "ಕನ್ನಡ ಪತ್ರಿಕೆ",
    "ಕರ್ನಾಟಕ ಸುದ್ದಿ",
    "ಮಾಸಿಕ ಸಂಚಿಕೆ",

    // Regional Keywords
    "Dakshina Kannada newspaper",
    "Mangalore Kannada newspaper",
    "Udupi Kannada news",
    "Bengaluru Kannada newspaper",
    "ದಕ್ಷಿಣ ಕನ್ನಡ ಪತ್ರಿಕೆ",
    "ಮಂಗಳೂರು ಕನ್ನಡ ವಾರ್ತೆ",
    "ರಾಜ್ಯ ಆವೃತ್ತಿ ಪತ್ರಿಕೆ",

    // Topic Keywords
    "investigative journalism Karnataka",
    "legal news Kannada",
    "social justice news Kannada",
    "public interest journalism",
    "ಭ್ರಷ್ಟಾಚಾರ ನಿರ್ಮೂಲನೆ ವರದಿ",
    "ಕಾನೂನು ಜಾಗೃತಿ ಲೇಖನಗಳು",
  ],
  publisher: {
    name: "ನ್ಯಾಯ ಘರ್ಜನೆ ಪ್ರಕಾಶನ (Nyaayagharjane Publications)",
    founder: "ನ್ಯಾಯ ಘರ್ಜನೆ ಸಂಪಾದಕೀಯ ಮಂಡಳಿ",
    address: {
      addressLocality: "ಮಂಗಳೂರು / ಬೆಂಗಳೂರು",
      addressRegion: "Karnataka",
      addressCountry: "IN",
    },
    contactEmail: "contact@nyaayagharjane.com",
    editorialEmail: "editor@nyaayagharjane.com",
  },
  social: {
    facebook: "https://facebook.com/nyaayagharjane",
    twitter: "https://twitter.com/nyaayagharjane",
    youtube: "https://youtube.com/@nyaayagharjane",
    whatsapp: "https://whatsapp.com/channel/nyaayagharjane",
  },
};

/**
 * Generate Organization & NewsMediaOrganization JSON-LD schema
 */
export function generateOrganizationSchema() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": `${siteUrl}/#organization`,
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.alternateNames,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: `${siteUrl}/icon.png`,
      caption: SITE_CONFIG.name,
    },
    slogan: SITE_CONFIG.tagline,
    description: SITE_CONFIG.description,
    knowsLanguage: ["kn", "en"],
    address: {
      "@type": "PostalAddress",
      addressLocality: "Mangalore",
      addressRegion: "Karnataka",
      addressCountry: "India",
    },
    publishingPrinciples: `${siteUrl}/about`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "Editorial Office",
        email: SITE_CONFIG.publisher.contactEmail,
        availableLanguage: ["Kannada", "English"],
      },
    ],
    sameAs: [
      SITE_CONFIG.social.facebook,
      SITE_CONFIG.social.twitter,
      SITE_CONFIG.social.youtube,
    ],
  };
}

/**
 * Generate WebSite JSON-LD schema with search query support
 */
export function generateWebSiteSchema() {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    url: siteUrl,
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.nameEn,
    description: SITE_CONFIG.description,
    inLanguage: "kn-IN",
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${siteUrl}/archives?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Generate Periodical / PublicationIssue schema for a specific edition
 */
export function generateEditionSchema(edition: {
  id: string;
  title: string;
  editionMonth?: string;
  formattedDate?: string;
  pdfUrl?: string;
  totalPages?: number;
  description?: string;
}) {
  const siteUrl = getSiteUrl();
  const pageUrl = `${siteUrl}/reader/${edition.id}`;

  return {
    "@context": "https://schema.org",
    "@type": "PublicationIssue",
    "@id": pageUrl,
    url: pageUrl,
    name: edition.title,
    headline: edition.title,
    description:
      edition.description ||
      `${edition.title} - ${edition.editionMonth || ""} ಸಂಚಿಕೆ. ಸತ್ಯದ ಧ್ವನಿ, ನ್ಯಾಯದ ಘರ್ಜನೆ.`,
    inLanguage: "kn-IN",
    datePublished: edition.formattedDate || "2026-11-16",
    pageCount: edition.totalPages || 16,
    isPartOf: {
      "@type": "Periodical",
      name: SITE_CONFIG.name,
      alternateName: SITE_CONFIG.nameEn,
      issn: "Pending",
      publisher: {
        "@id": `${siteUrl}/#organization`,
      },
    },
    associatedMedia: edition.pdfUrl
      ? {
          "@type": "MediaObject",
          contentUrl: edition.pdfUrl,
          encodingFormat: "application/pdf",
        }
      : undefined,
  };
}

/**
 * Generate BreadcrumbList JSON-LD schema
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; path: string }>
) {
  const siteUrl = getSiteUrl();

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.path}`,
    })),
  };
}
