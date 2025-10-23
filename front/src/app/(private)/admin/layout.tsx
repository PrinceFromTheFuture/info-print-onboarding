import { AppSidebar } from "@/components/app-sidebar";
import { AppSidebarAdmin } from "@/components/app-sidebar-admin";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import DAL from "@/components/DAL";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DAL>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebarAdmin variant="inset" />
        <SidebarInset>
          <SiteHeader />
          <main className="p-12">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </DAL>
  );
}
