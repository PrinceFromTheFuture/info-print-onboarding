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
  IconTicket,
  IconUsers,
} from "@tabler/icons-react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useSession } from "@/lib/auth/auth-client";
import { FileText, Headset, Upload, Workflow } from "lucide-react";
import Image from "next/image";

export function AppSidebarAdmin({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const user = session?.user!;

  const data = {
    user: {
      name: user.name,
      email: user.email,
      avatar: "/avatars/shadcn.jpg",
    },
    navMain: [
      {
        title: "Dashboard",
        url: "/admin",
        icon: IconDashboard,
      },
      {
        title: "Support",
        url: "/admin/support",
        icon: Headset,
      },
      {
        title: "Customers",
        url: "/admin/customers",
        icon: IconUsers,
      },
      {
        title: "Templates",
        url: "/admin/templates",
        icon: Workflow,
      },
      {
        title: "Submissions",
        url: "/admin/submissions",
        icon: FileText,
      },
    ],
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
                <span className="text-base font-semibold">Info-Flopay Admin</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} quickCreate={{ title: "New Customer", url: "", onClick: () => {} }} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
