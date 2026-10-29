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
    children: [
      { path: "/expedientes/clients", label: "Clientes" },
      { path: "/expedientes/intermediaries", label: "Intermediarios" },
      { path: "/expedientes/reinsurers", label: "Reaseguradores" },
      { path: "/expedientes/suppliers", label: "Proveedores" },
      { path: "/expedientes/employees", label: "Empleados" },
    ],
  },
  {
    path: "/riesgo",
    label: "Evaluacion de Riesgo",
    icon: "Shield",
    allowedRoles: ["OFICIAL_CUMPLIMIENTO", "CONSULTOR", "AUDITOR_INTERNO", "REGULADOR_SUDEASEG"],
    children: [
      { path: "/riesgo/evaluacion", label: "Evaluacion" },
      { path: "/riesgo/historial", label: "Historial" },
      { path: "/riesgo/resultado", label: "Resultado" },
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
      { path: "/screening/resultados", label: "Resultados" },
      { path: "/screening/historial", label: "Historial" },
    ],
  },
  {
    path: "/pep",
    label: "PEP",
    icon: "Users",
    allowedRoles: ["OFICIAL_CUMPLIMIENTO", "CONSULTOR", "AUDITOR_INTERNO", "REGULADOR_SUDEASEG"],
    children: [
      { path: "/pep/identificacion", label: "Identificacion" },
      { path: "/pep/historial", label: "Historial" },
      { path: "/pep/familiares", label: "Familiares" },
      { path: "/pep/medidas-reforzadas", label: "Medidas Reforzadas" },
      { path: "/pep/seguimiento", label: "Seguimiento" },
    ],
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
    children: [
      { path: "/documentos/lista", label: "Listado" },
      { path: "/documentos/carga", label: "Carga" },
      { path: "/documentos/alertas", label: "Alertas" },
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
    label: "Auditoria",
    icon: "ClipboardList",
    allowedRoles: ["OFICIAL_CUMPLIMIENTO", "AUDITOR_INTERNO", "REGULADOR_SUDEASEG"],
  },
]
