import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";

export default function Page() {
  // Redirect to workflow page as default
  redirect(ROUTES.customer.workflow);
}
