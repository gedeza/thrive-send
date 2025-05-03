"use client"

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DashboardRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main dashboard page
    router.push("/");
  }, [router]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirecting to dashboard...</p>
    </div>
  );
}