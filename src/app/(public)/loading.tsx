import { PageLoader } from "@/components/shared/PageLoader";

export default function PublicLoading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh] w-full">
      <PageLoader />
    </div>
  );
}
