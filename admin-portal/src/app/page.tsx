"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminSession } from "@/lib/editionsStore";
import { PageLoader } from "@/components/shared/PageLoader";

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    const session = getAdminSession();
    if (session) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return <PageLoader fullScreen />;
}
