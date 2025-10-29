"use client";
import { authClient, useSession } from "@/lib/auth/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import React from "react";
import { Button } from "./ui/button";
import { LogOut as IconLogOut } from "lucide-react";

function Logout() {
  const { data: session } = useSession();

  const router = useRouter();
  const queryClient = useQueryClient();
  const onLogout = async () => {
    await authClient.signOut({ fetchOptions: { redirect: "manual" } });
    router.push("/login");
    await queryClient.invalidateQueries();
  };
  return (
    <div className="flex items-center gap-2 ml-auto">
      <span className="text-sm text-muted-foreground ">{session?.user?.email}</span>
      <Button variant="ghost" size="icon" className=" cursor-pointer bg-red-600/5" onClick={onLogout}>
        <IconLogOut className="h-4 w-4 text-red-600" />
        <span className="sr-only">Logout</span>
      </Button>
    </div>
  );
}

export default Logout;
