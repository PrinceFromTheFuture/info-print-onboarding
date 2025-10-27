import DAL from "@/components/DAL";
import { CustomerNavbar } from "./_components/customer-navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <DAL redirect={{ role: "admin", href: "/admin" }}>
      <div className="min-h-screen flex flex-col">
        <CustomerNavbar />
        <main className="flex-1 pb-14 md:pb-0">{children}</main>
      </div>
    </DAL>
  );
}
