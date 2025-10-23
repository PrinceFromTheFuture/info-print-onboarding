"use client";
import { useSession } from "@/lib/auth/auth-client";
import { redirect, useRouter } from "next/navigation";
import type { Auth } from "../../../back/src/auth";

export default function DAL({ children }: { children: React.ReactNode }) {
  const { data, isPending } = useSession();
  const router = useRouter();
  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading user data...</p>
        </div>
      </div>
    );
  }
  if (!data || !data.session) {
    router.push("/login");
    return;
  }

  return <>{children}</>;
}
