import { apiClient } from "./client"
import { API_ENDPOINTS } from "./endpoints"
import type {
  Dossier,
  DossierDetail,
  CreateDossierRequest,
  UpdateDossierRequest,
  ApproveDossierRequest,
  RejectDossierRequest,
  DossierFilters,
  DossierListResponse,
  HistoryEntry,
} from "@/types/dossier"

export const dossierService = {
  /**
   * Obtener lista de expedientes con filtros
   */
  async list(filters?: DossierFilters): Promise<DossierListResponse> {
    const params = new URLSearchParams()

    if (filters?.search) params.append("search", filters.search)
    if (filters?.subjectType && filters.subjectType !== "ALL") params.append("subjectType", filters.subjectType)
    if (filters?.riskLevel && filters.riskLevel !== "ALL") params.append("riskLevel", filters.riskLevel)
    if (filters?.status && filters.status !== "ALL") params.append("status", filters.status)
    if (filters?.dateFrom) params.append("dateFrom", filters.dateFrom)
    if (filters?.dateTo) params.append("dateTo", filters.dateTo)
    if (filters?.isPep !== undefined) params.append("isPep", String(filters.isPep))
    if (filters?.hasAlerts !== undefined) params.append("hasAlerts", String(filters.hasAlerts))
    if (filters?.page) params.append("page", String(filters.page))
    if (filters?.pageSize) params.append("pageSize", String(filters.pageSize))

    const queryString = params.toString()
    const endpoint = queryString ? `${API_ENDPOINTS.dossiers.list}?${queryString}` : API_ENDPOINTS.dossiers.list

    return apiClient.get<DossierListResponse>(endpoint)
  },

  /**
   * Obtener detalle completo de un expediente
   */
  async getDetail(id: string): Promise<DossierDetail> {
    return apiClient.get<DossierDetail>(API_ENDPOINTS.dossiers.detail(id))
  },

  /**
   * Crear nuevo expediente
   */
  async create(data: CreateDossierRequest): Promise<Dossier> {
    return apiClient.post<Dossier>(API_ENDPOINTS.dossiers.create, data)
  },

  /**
   * Actualizar expediente existente
   */
  async update(id: string, data: UpdateDossierRequest): Promise<Dossier> {
    return apiClient.put<Dossier>(API_ENDPOINTS.dossiers.update(id), data)
  },

  /**
   * Aprobar expediente (solo Oficial de Cumplimiento)
   */
  async approve(data: ApproveDossierRequest): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(API_ENDPOINTS.dossiers.approve(data.dossierId), data)
  },

  /**
   * Rechazar expediente con observaciones (solo Oficial de Cumplimiento)
   */
  async reject(data: RejectDossierRequest): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(
      `${API_ENDPOINTS.dossiers.detail(data.dossierId)}/reject`,
      data,
    )
  },

  /**
   * Obtener historial de cambios de un expediente
   */
  async getHistory(id: string): Promise<HistoryEntry[]> {
    return apiClient.get<HistoryEntry[]>(API_ENDPOINTS.dossiers.history(id))
  },

  /**
   * Guardar borrador (expediente incompleto)
   */
  async saveDraft(data: CreateDossierRequest): Promise<Dossier> {
    return apiClient.post<Dossier>(API_ENDPOINTS.dossiers.create, {
      ...data,
      status: "INCOMPLETE",
    })
  },

  /**
   * Enviar a cumplimiento para revisión
   */
  async submitToCompliance(id: string): Promise<{ success: boolean; message: string }> {
    return apiClient.post<{ success: boolean; message: string }>(`${API_ENDPOINTS.dossiers.detail(id)}/submit`, {
      status: "UNDER_REVIEW",
    })
  },

  /**
   * Obtener resumen de expedientes según permisos del usuario
   */
  async getSummary(): Promise<{
    total: number
    byStatus: Record<string, number>
    byRisk: Record<string, number>
    byType: Record<string, number>
  }> {
    return apiClient.get<{
      total: number
      byStatus: Record<string, number>
      byRisk: Record<string, number>
      byType: Record<string, number>
    }>(`${API_ENDPOINTS.dossiers.list}/summary`)
  },
}

export const getDossierDetail = dossierService.getDetail
export const getDossierList = dossierService.list
export const createDossier = dossierService.create
export const updateDossier = dossierService.update
export const approveDossier = dossierService.approve
export const rejectDossier = dossierService.reject
