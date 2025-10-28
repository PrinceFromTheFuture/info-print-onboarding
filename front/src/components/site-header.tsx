"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { authClient, useSession } from "@/lib/auth/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export function SiteHeader() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const router = useRouter();

  const onLogout = async () => {
    await authClient.signOut({ fetchOptions: { redirect: "manual" } });
    router.push("/login");
    await queryClient.invalidateQueries();
  };
  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">Documents</h1>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-muted-foreground ">{session?.user?.email}</span>
            <Button variant="ghost" size="icon" className=" cursor-pointer bg-red-600/5" onClick={onLogout}>
              <LogOut className="h-4 w-4 text-red-600" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
