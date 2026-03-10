"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { useAuth } from "@/lib/auth/auth-context"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FolderOpen,
  Shield,
  Users,
  FileText,
  AlertTriangle,
  ClipboardList,
  ChevronDown,
} from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

const iconMap = {
  LayoutDashboard,
  FolderOpen,
  Shield,
  Users,
  FileText,
  AlertTriangle,
  ClipboardList,
}

export function Sidebar() {
  const pathname = usePathname()
  const { user, hasRole } = useAuth()
  const [openItems, setOpenItems] = useState<string[]>([])

  if (!user) return null

  // Filter routes based on user role
  const filteredRoutes = ROUTES.filter((route) => {
    if (!route.allowedRoles) return true
    return hasRole(route.allowedRoles)
  })

  const toggleItem = (path: string) => {
    setOpenItems((prev) => (prev.includes(path) ? prev.filter((item) => item !== path) : [...prev, path]))
  }

  return (
    <aside className="fixed left-0 top-20 z-40 h-[calc(100vh-5rem)] w-64 border-r border-border bg-sidebar">
      <div className="border-b border-border bg-card p-4">
        <Image
          src="/images/logo-occidental.png"
          alt="Seguros La Occidental"
          width={200}
          height={60}
          className="h-10 w-auto object-contain mx-auto"
        />
      </div>
      <nav className="flex h-[calc(100%-5rem)] flex-col gap-2 overflow-y-auto p-4">
        {filteredRoutes.map((route) => {
          const Icon = route.icon ? iconMap[route.icon as keyof typeof iconMap] : null
          const isActive = pathname === route.path
          const hasChildren = route.children && route.children.length > 0

          if (hasChildren) {
            const filteredChildren = route.children!.filter((child) => {
              if (!child.allowedRoles) return true
              return hasRole(child.allowedRoles)
            })

            if (filteredChildren.length === 0) return null

            const isOpen = openItems.includes(route.path)
            const isChildActive = filteredChildren.some((child) => pathname === child.path)

            return (
              <Collapsible key={route.path} open={isOpen} onOpenChange={() => toggleItem(route.path)}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-between",
                      (isActive || isChildActive) && "bg-sidebar-accent text-sidebar-accent-foreground",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      {Icon && <Icon className="h-4 w-4" />}
                      <span className="text-sm font-medium">{route.label}</span>
                    </span>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="ml-6 mt-1 space-y-1">
                  {filteredChildren.map((child) => {
                    const isChildRouteActive = pathname === child.path
                    return (
                      <Link key={child.path} href={child.path}>
                        <Button
                          variant="ghost"
                          className={cn(
                            "w-full justify-start text-xs",
                            isChildRouteActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                          )}
                        >
                          {child.label}
                        </Button>
                      </Link>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            )
          }

          return (
            <Link key={route.path} href={route.path}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-2",
                  isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
                )}
              >
                {Icon && <Icon className="h-4 w-4" />}
                <span className="text-sm font-medium">{route.label}</span>
              </Button>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
