import { type NextRequest, NextResponse } from "next/server"

// Mock data para desarrollo - en producción esto vendría del backend Java
const mockDossier = {
  id: "1",
  dossierId: "DOSS-2024-00001",
  subjectType: "CLIENT",
  name: "INVERSIONES LA CANDELARIA C.A.",
  documentNumber: "J-12345678-9",
  riskLevel: "MEDIUM",
  status: "UNDER_REVIEW",
  isPep: false,
  completenessPercentage: 85,
  alertCount: 2,
  createdAt: "2024-01-15T10:30:00Z",
  createdBy: "juan.perez",
  createdByRole: "Comercial",
  lastModifiedAt: "2024-01-20T14:22:00Z",
  lastModifiedBy: "maria.lopez",
  lastModifiedByRole: "Unidad de Cumplimiento",
  // Datos generales
  address: "Av. Francisco de Miranda, Torre Empresarial, Piso 10, Chacao, Miranda",
  economicActivity: "Comercio al por mayor de equipos industriales",
  originOfFunds: "Actividad comercial de importación y distribución de equipos industriales",
  beneficialOwner: "José González (65%), María Rodríguez (35%)",
  country: "Venezuela",
  state: "Miranda",
  city: "Chacao",
  highRiskZone: false,
  latitude: "10.4806",
  longitude: "-66.8528",
  email: "contacto@lacandelaria.com",
  phone: "+58 212-1234567",
  // Productos y canales
  products: ["Seguro de Transporte de Mercancías", "Responsabilidad Civil", "Incendio"],
  distributionChannel: "DIRECTO",
  // Evaluación de riesgo
  currentRiskScore: 2.8,
  riskFactors: [
    { factor: "Producto", score: 3, observation: "Seguros de transporte tienen riesgo medio" },
    { factor: "Canal", score: 2, observation: "Canal directo - riesgo bajo" },
    { factor: "Ubicación", score: 2, observation: "Zona urbana estable" },
    { factor: "Origen de fondos", score: 3, observation: "Actividad comercial verificada" },
    { factor: "Beneficiario", score: 3, observation: "Estructura simple - 2 accionistas" },
    { factor: "PEP", score: 2, observation: "No es PEP" },
  ],
  lastRiskEvaluation: "2024-01-18T10:00:00Z",
  riskEvaluationBy: "ana.garcia",
  // Documentos
  documents: [
    {
      id: "doc1",
      name: "Registro Mercantil",
      status: "APPROVED",
      uploadDate: "2024-01-15",
      expiryDate: "2025-01-15",
      uploadedBy: "juan.perez",
    },
    {
      id: "doc2",
      name: "RIF",
      status: "APPROVED",
      uploadDate: "2024-01-15",
      uploadedBy: "juan.perez",
    },
    {
      id: "doc3",
      name: "Estados Financieros 2023",
      status: "PENDING",
      uploadDate: "2024-01-20",
      uploadedBy: "maria.lopez",
    },
    {
      id: "doc4",
      name: "Certificación Bancaria",
      status: "APPROVED",
      uploadDate: "2024-01-16",
      expiryDate: "2024-07-16",
      uploadedBy: "juan.perez",
    },
    {
      id: "doc5",
      name: "Acta Constitutiva",
      status: "APPROVED",
      uploadDate: "2024-01-15",
      uploadedBy: "juan.perez",
    },
  ],
  // Screening
  screenings: [
    {
      id: "scr1",
      date: "2024-01-18T14:30:00Z",
      lists: ["ONU", "OFAC", "UE", "Nacionales"],
      matches: 0,
      status: "NO_MATCH",
      decision: "APROBADO",
      decidedBy: "ana.garcia",
    },
  ],
  // PEP information
  pepInfo: null,
  pepHistory: [],
  // Alertas
  alerts: [
    {
      id: "ALR-001",
      type: "DOCUMENTACION_VENCIDA",
      level: "MEDIUM",
      description: "Certificación Bancaria próxima a vencer (30 días)",
      status: "ACTIVE",
      createdAt: "2024-01-20",
    },
    {
      id: "ALR-002",
      type: "REVISION_PERIODICA",
      level: "LOW",
      description: "Revisión periódica programada",
      status: "ACTIVE",
      createdAt: "2024-01-19",
    },
  ],
  // Historial
  history: [
    {
      id: "hist1",
      date: "2024-01-20T14:22:00Z",
      user: "maria.lopez",
      role: "Unidad de Cumplimiento",
      action: "Modificó información económica",
      details: "Actualizó origen de fondos con documentación soporte",
    },
    {
      id: "hist2",
      date: "2024-01-18T16:30:00Z",
      user: "ana.garcia",
      role: "Unidad de Cumplimiento",
      action: "Realizó evaluación de riesgo",
      details: "Resultado: MEDIO (2.8/5)",
    },
    {
      id: "hist3",
      date: "2024-01-18T14:30:00Z",
      user: "ana.garcia",
      role: "Unidad de Cumplimiento",
      action: "Ejecutó screening",
      details: "Sin coincidencias en listas restrictivas",
    },
    {
      id: "hist4",
      date: "2024-01-15T10:30:00Z",
      user: "juan.perez",
      role: "Comercial",
      action: "Creó el expediente",
      details: "Expediente inicial de cliente nuevo",
    },
  ],
}

// Mock data para expediente PEP
const mockPepDossier = {
  ...mockDossier,
  id: "2",
  dossierId: "DOSS-2024-00002",
  name: "GRUPO EMPRESARIAL BOLIVAR C.A.",
  documentNumber: "J-98765432-1",
  riskLevel: "HIGH",
  isPep: true,
  pepInfo: {
    id: "pep1",
    isPep: true,
    pepType: "RELATED",
    position: "Asesor Ministerial",
    entity: "Ministerio de Economía y Finanzas",
    country: "Venezuela",
    startDate: "2020-01-15",
    source: "Base de datos SUDEASEG",
    verifiedBy: "ana.garcia",
    verifiedAt: "2024-01-10T10:00:00Z",
    observations:
      "Familiar directo de funcionario público. Se requiere debida diligencia reforzada y aprobación de comité.",
    riskLevel: "HIGH",
  },
  pepHistory: [
    {
      id: "peph1",
      date: "2024-01-10T10:00:00Z",
      action: "Identificación como PEP Relacionado",
      previousStatus: false,
      newStatus: true,
      user: "ana.garcia",
      details: "Identificado como familiar de funcionario público durante el proceso de screening",
    },
  ],
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Retornar datos mock según el ID
    if (id === "2") {
      return NextResponse.json(mockPepDossier)
    }

    return NextResponse.json(mockDossier)
  } catch (error) {
    console.error("[v0] Error fetching dossier:", error)
    return NextResponse.json({ error: "Error al obtener el expediente" }, { status: 500 })
  }
}
