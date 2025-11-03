"use client";
import { useSession } from "@/lib/auth/auth-client";
import { redirect, useRouter } from "next/navigation";
import type { Auth } from "../../../back/src/auth";
import LoadingSpinner from "./loading-spinner";
import { ROUTES } from "@/lib/routes";

export default function DAL({ children, redirect }: { children: React.ReactNode; redirect?: { role: "admin" | "customer"; href: string } }) {
  const router = useRouter();
  const { data, isPending } = useSession();
  if (isPending) {
    return <LoadingSpinner title="Loading user data..." />;
  }

  if (!data || !data.session) {
    router.push(ROUTES.auth.login);
    return;
  }
  if (!data?.user?.isApproved && data?.user?.role === "customer") {
    router.push(ROUTES.auth.login);
    return;
  }

  if (redirect && redirect.role === data.user?.role) {
    router.push(redirect.href);
    return;
  }
  return <>{children}</>;
}
