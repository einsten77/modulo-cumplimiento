"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { OccidentalLogo } from "@/components/shared/occidental-logo"
import {
  FileText,
  AlertTriangle,
  BarChart3,
  Users,
  Shield,
  Search,
  Settings,
  FileCheck,
  Building2,
  UserCog,
} from "lucide-react"

// TODO: Get navigation items based on user role from backend
const navigationItems = [
  {
    title: "Panel Principal",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    title: "Expedientes",
    icon: FileText,
    items: [
      { title: "Clientes", href: "/dashboard/dossiers/clients" },
      { title: "Intermediarios", href: "/dashboard/dossiers/intermediaries" },
      { title: "Reaseguradores", href: "/dashboard/dossiers/reinsurers" },
      { title: "Proveedores", href: "/dashboard/dossiers/suppliers" },
      { title: "Empleados", href: "/dashboard/dossiers/employees" },
    ],
  },
  {
    title: "Evaluación de Riesgo",
    href: "/dashboard/risk-assessment",
    icon: Shield,
  },
  {
    title: "Screening",
    href: "/dashboard/screening",
    icon: Search,
  },
  {
    title: "Alertas",
    href: "/dashboard/alerts",
    icon: AlertTriangle,
  },
  {
    title: "Debida Diligencia",
    href: "/dashboard/due-diligence",
    icon: FileCheck,
  },
  {
    title: "Reportes",
    href: "/dashboard/reports",
    icon: FileText,
  },
  {
    title: "Gestión PEP",
    href: "/dashboard/pep",
    icon: Users,
  },
  {
    title: "Auditoría",
    href: "/dashboard/audit",
    icon: Building2,
  },
  {
    title: "Usuarios",
    href: "/dashboard/users",
    icon: UserCog,
  },
  {
    title: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <aside className="w-64 border-r border-border bg-card">
      <div className="flex h-16 items-center border-b border-border px-6">
        <OccidentalLogo variant="icon" />
        <div className="ml-3">
          <h1 className="text-lg font-bold text-foreground">SAGRA</h1>
          <p className="text-xs text-muted-foreground">Gestión de Riesgos</p>
        </div>
      </div>

      <nav className="space-y-1 p-4">
        {navigationItems.map((item, index) => (
          <div key={index}>
            {item.href ? (
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.title}</span>
              </Link>
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-foreground">
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.title}</span>
                </div>
                {item.items && (
                  <div className="ml-8 space-y-1">
                    {item.items.map((subItem, subIndex) => (
                      <Link
                        key={subIndex}
                        href={subItem.href}
                        className={cn(
                          "block rounded-md px-3 py-2 text-sm transition-colors",
                          pathname === subItem.href
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                        )}
                      >
                        {subItem.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  )
}
