"use client"

import { SidebarNav } from "./sidebar-nav"

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r bg-background">
      <SidebarNav />
    </aside>
  )
}
