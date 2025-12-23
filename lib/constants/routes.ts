import type { RoleType } from "./roles"

export interface RouteConfig {
  path: string
  label: string
  icon?: string
  allowedRoles?: RoleType[]
  children?: RouteConfig[]
}

export const ROUTES: RouteConfig[] = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
  },
  {
    path: "/expedientes",
    label: "Expedientes",
    icon: "FolderOpen",
    allowedRoles: [
      "OFICIAL_CUMPLIMIENTO",
      "USUARIO_RRHH",
      "USUARIO_COMERCIAL",
      "CONSULTOR",
      "AUDITOR_INTERNO",
      "REGULADOR_SUDEASEG",
    ],
  },
  {
    path: "/screening",
    label: "Screening",
    icon: "Shield",
    allowedRoles: ["OFICIAL_CUMPLIMIENTO", "CONSULTOR", "AUDITOR_INTERNO", "REGULADOR_SUDEASEG"],
    children: [
      {
        path: "/screening/ejecutar",
        label: "Ejecutar Screening",
        allowedRoles: ["OFICIAL_CUMPLIMIENTO"],
      },
      {
        path: "/screening/resultados",
        label: "Resultados",
      },
      {
        path: "/screening/historial",
        label: "Historial",
      },
    ],
  },
  {
    path: "/pep",
    label: "PEP",
    icon: "Users",
    allowedRoles: ["OFICIAL_CUMPLIMIENTO", "CONSULTOR", "AUDITOR_INTERNO", "REGULADOR_SUDEASEG"],
  },
  {
    path: "/documentos",
    label: "Documentos",
    icon: "FileText",
    allowedRoles: [
      "OFICIAL_CUMPLIMIENTO",
      "USUARIO_RRHH",
      "USUARIO_COMERCIAL",
      "AUDITOR_INTERNO",
      "REGULADOR_SUDEASEG",
    ],
  },
  {
    path: "/casos",
    label: "Casos y Alertas",
    icon: "AlertTriangle",
    allowedRoles: [
      "OFICIAL_CUMPLIMIENTO",
      "USUARIO_RRHH",
      "USUARIO_COMERCIAL",
      "AUDITOR_INTERNO",
      "REGULADOR_SUDEASEG",
    ],
  },
  {
    path: "/auditoria",
    label: "Auditoría",
    icon: "ClipboardList",
    allowedRoles: ["OFICIAL_CUMPLIMIENTO", "AUDITOR_INTERNO", "REGULADOR_SUDEASEG"],
  },
]
