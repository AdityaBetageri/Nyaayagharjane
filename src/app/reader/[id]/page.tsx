import { Suspense } from "react";
import ReaderView from "@/components/reader/ReaderView";
import { PLACEHOLDER_LATEST_EDITION, PLACEHOLDER_PREVIOUS_EDITIONS } from "@/lib/constants";
import { fetchR2Catalogue, r2ItemToEdition } from "@/lib/r2Service";
import { Edition } from "@/types";

interface ReaderPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function ReaderContainer({ params }: ReaderPageProps) {
  const { id } = await params;

  let activeEdition: Edition | null = null;

  // 1. Try to fetch from Cloudflare R2 catalogue
  try {
    const r2Result = await fetchR2Catalogue({ bypassCache: false, publishedOnly: false });
    if (r2Result.success && r2Result.data.length > 0) {
      const foundR2 = r2Result.data.find((item) => item.id === id);
      if (foundR2) {
        activeEdition = r2ItemToEdition(foundR2);
      }
    }
  } catch {
    // Graceful fallback to static/local
  }

  // 2. Fallback to placeholder/static editions
  if (!activeEdition) {
    const allEditions = [PLACEHOLDER_LATEST_EDITION, ...PLACEHOLDER_PREVIOUS_EDITIONS];
    const found = allEditions.find((e) => e.id === id);
    activeEdition = found || {
      ...PLACEHOLDER_LATEST_EDITION,
      id,
      title: `ನ್ಯಾಯಘರ್ಜನೆ - ಆವೃತ್ತಿ ${id}`,
    };
  }

  return <ReaderView edition={activeEdition} />;
}

export default function ReaderPage(props: ReaderPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-white text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#C62828] border-t-transparent rounded-full animate-spin" />
            <span>ವಾಚಕ ಲೋಡ್ ಆಗುತ್ತಿದೆ...</span>
          </div>
        </div>
      }
    >
      <ReaderContainer {...props} />
    </Suspense>
  );
}
