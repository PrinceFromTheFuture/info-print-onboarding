import { redirect } from "next/navigation";

export default function Page() {
  // Redirect to uploads page as default
  redirect("/customer/workflow");
}
