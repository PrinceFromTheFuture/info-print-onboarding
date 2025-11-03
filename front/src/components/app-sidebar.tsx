"use client";

import * as React from "react";
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth/auth-client";
import { Upload, Workflow } from "lucide-react";
import Image from "next/image";
import { NAV_ITEMS } from "@/lib/routes";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const user = session?.user!;

  const iconMap: Record<string, typeof Workflow> = {
    workflow: Workflow,
    uploads: Upload,
    help: Upload,
  };

  const data = {
    user: {
      name: user.name,
      email: user.email,
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: NAV_ITEMS.customer.map((item) => ({
      title: item.title,
      url: item.url,
      icon: iconMap[item.key],
    })),
    navClouds: [],
    navSecondary: [],
    documents: [],
  };
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <Image src="/logo.png" alt="Logo" width={24} height={24} />
                <span className="text-base font-semibold">Info-Flopay OnBoarding</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
