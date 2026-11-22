"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isBiometricVerified } from "@/lib/editionsStore";
import { onAdminAuthStateChanged } from "@/lib/firebase";
import { PageLoader } from "@/components/shared/PageLoader";

export default function AdminRootPage() {
  const router = useRouter();

  useEffect(() => {
    const unsub = onAdminAuthStateChanged((user) => {
      if (!user) {
        router.replace("/login");
      } else if (isBiometricVerified(user.uid)) {
        router.replace("/dashboard");
      } else {
        router.replace("/passkey");
      }
    });

    return () => unsub();
  }, [router]);

  return <PageLoader fullScreen />;
}
