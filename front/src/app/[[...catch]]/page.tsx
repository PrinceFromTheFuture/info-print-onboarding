"use client";
import React from "react";
import useRole from "@/hooks/useRole";
import { useSession } from "@/lib/auth/auth-client";
import { useRouter } from "next/navigation";
function page() {
  const { data, isPending } = useSession();
  const router = useRouter();
  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ...</p>
        </div>
      </div>
    );
  }
  if (!data || !data.session) {
    router.push("/login");
    return;
  }
  if (data.user.role === "admin") {
    router.push("/admin");
    return;
  }
  if (data.user.role === "customer") {
    router.push("/customer");
    return;
  }
}

export default page;
