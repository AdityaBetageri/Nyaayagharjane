import { Suspense } from "react";
import ReaderView from "@/components/reader/ReaderView";
import { PLACEHOLDER_LATEST_EDITION, PLACEHOLDER_PREVIOUS_EDITIONS } from "@/lib/constants";
import { Edition } from "@/types";

interface ReaderPageProps {
  params: Promise<{
    id: string;
  }>;
}

async function ReaderContainer({ params }: ReaderPageProps) {
  const { id } = await params;

  // Find corresponding edition or fallback gracefully to placeholder latest edition
  const allEditions = [PLACEHOLDER_LATEST_EDITION, ...PLACEHOLDER_PREVIOUS_EDITIONS];
  const foundEdition = allEditions.find((e) => e.id === id);

  const activeEdition: Edition = foundEdition || {
    ...PLACEHOLDER_LATEST_EDITION,
    id,
    title: `ನ್ಯಾಯಘರ್ಜನೆ - ಆವೃತ್ತಿ ${id}`,
  };

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
