"use client";

import { IconCirclePlusFilled, IconMail, type Icon } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import Link from "next/link";
import { CreateCustomerDialog } from "./create-customer-dialog";

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
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        {quickCreate && (
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <CreateCustomerDialog
                trigger={
                  <SidebarMenuButton
                    onClick={quickCreate?.onClick}
                    tooltip="Quick Create"
                    className="bg-primary cursor-pointer text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                  >
                    <IconCirclePlusFilled />
                    <span>{quickCreate?.title}</span>
                  </SidebarMenuButton>
                }
              />
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
                <SidebarMenuButton tooltip={item.title}>
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
