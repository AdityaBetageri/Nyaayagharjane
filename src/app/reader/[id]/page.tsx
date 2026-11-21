import type { Metadata } from "next";
import { Suspense } from "react";
import { cacheLife } from "next/cache";
import ReaderView from "@/components/reader/ReaderView";
import { PageLoader } from "@/components/shared/PageLoader";
import { PLACEHOLDER_LATEST_EDITION, PLACEHOLDER_PREVIOUS_EDITIONS } from "@/lib/constants";
import { fetchR2Catalogue, r2ItemToEdition } from "@/lib/r2Service";
import { Edition } from "@/types";
import { getSiteUrl, SITE_CONFIG, generateEditionSchema } from "@/lib/siteConfig";

interface ReaderPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getEdition(id: string): Promise<Edition> {
  try {
    const r2Result = await fetchR2Catalogue({ bypassCache: true, publishedOnly: false });
    if (r2Result.success && r2Result.data.length > 0) {
      const foundR2 = r2Result.data.find((item) => item.id === id);
      if (foundR2) {
        return r2ItemToEdition(foundR2);
      }
    }
  } catch {
    // fallback
  }

  const allEditions = [PLACEHOLDER_LATEST_EDITION, ...PLACEHOLDER_PREVIOUS_EDITIONS];
  const found = allEditions.find((e) => e.id === id);
  return found || {
    ...PLACEHOLDER_LATEST_EDITION,
    id,
    title: `ನ್ಯಾಯ ಘರ್ಜನೆ - ಆವೃತ್ತಿ ${id}`,
  };
}

export async function generateMetadata({ params }: ReaderPageProps): Promise<Metadata> {
  const { id } = await params;
  const edition = await getEdition(id);
  const siteUrl = getSiteUrl();

  const title = `${edition.title} | ${SITE_CONFIG.name} (${SITE_CONFIG.nameEn})`;
  const description = `${edition.title} - ${edition.description || SITE_CONFIG.description}. ನ್ಯಾಯ ಘರ್ಜನೆ ಕನ್ನಡ ಮಾಸಿಕ ಇ-ಪತ್ರಿಕೆಯನ್ನು ಆನ್‌ಲೈನ್‌ನಲ್ಲಿ ಓದಿ.`;

  return {
    title,
    description,
    keywords: [
      edition.title,
      "ನ್ಯಾಯ ಘರ್ಜನೆ",
      "ನ್ಯಾಯ ಘರ್ಜನೆ ಇ-ಪತ್ರಿಕೆ",
      "Nyaayagharjane",
      "Kannada epaper reader",
      "ಕನ್ನಡ ಪತ್ರಿಕೆ ವಾಚಕ",
      edition.edition || "ರಾಜ್ಯ ಆವೃತ್ತಿ",
    ],
    alternates: {
      canonical: `/reader/${id}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/reader/${id}`,
      siteName: SITE_CONFIG.name,
      locale: "kn_IN",
      type: "article",
      images: [
        {
          url: `${siteUrl}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: edition.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/opengraph-image`],
    },
  };
}

async function ReaderContainer({ params }: ReaderPageProps) {
  const { id } = await params;
  const activeEdition = await getEdition(id);
  const jsonLd = generateEditionSchema(activeEdition);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ReaderView edition={activeEdition} />
    </>
  );
}

export default function ReaderPage(props: ReaderPageProps) {
  return (
    <Suspense fallback={<PageLoader fullScreen theme="dark" />}>
      <ReaderContainer {...props} />
    </Suspense>
  );
}
