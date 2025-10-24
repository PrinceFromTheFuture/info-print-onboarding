"use client";
import { useSession } from "@/lib/auth/auth-client";
import { redirect, useRouter } from "next/navigation";
import type { Auth } from "../../../back/src/auth";

export default function useRole() {
  const { data,  } = useSession();

  return { role: data?.user?.role };
}
