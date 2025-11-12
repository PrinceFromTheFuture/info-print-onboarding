"use client";

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function NavMain({
  items,
  quickCreate,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
  quickCreate: {
    title: string;
    url: string;
    onClick?: () => void;
  };
}) {
  const pathname = usePathname();
  const isActive = (url: string) => pathname.includes(url);
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {quickCreate && (
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <Button size="icon" className="size-8 group-data-[collapsible=icon]:opacity-0" variant="outline">
                <IconMail />
                <span className="sr-only">Inbox</span>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <SidebarMenu>
          {items.map((item) => (
            <Link href={item.url} className=" cursor-pointer">
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  className={isActive(item.url) ? "bg-primary/5 text-primary cursor-pointer" : "cursor-pointer"}
                >
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </Link>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
