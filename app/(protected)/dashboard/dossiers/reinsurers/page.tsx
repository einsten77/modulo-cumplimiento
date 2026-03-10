import { redirect } from "next/navigation"
export default function Page() {
  redirect("/dossiers?tab=reinsurers")
}
