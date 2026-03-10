import type { Document, DocumentVersion, DocumentAlert } from "@/types/document"

const API_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || ""

export async function getDocuments(filters?: {
  estado?: string
  tipo?: string
  dossierId?: string
  dossierType?: string
}): Promise<Document[]> {
  const params = new URLSearchParams()
  if (filters?.estado) params.append("estado", filters.estado)
  if (filters?.tipo) params.append("tipo", filters.tipo)
  if (filters?.dossierId) params.append("dossierId", filters.dossierId)
  if (filters?.dossierType) params.append("dossierType", filters.dossierType)

  const response = await fetch(`${API_BASE}/api/documents?${params}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("sagra_token")}`,
    },
  })

  if (!response.ok) throw new Error("Error fetching documents")
  const data = await response.json()
  return data.data
}

export async function getDocumentById(id: string): Promise<Document> {
  const response = await fetch(`${API_BASE}/api/documents/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("sagra_token")}`,
    },
  })

  if (!response.ok) throw new Error("Error fetching document")
  const data = await response.json()
  return data.data
}

export async function getDocumentVersions(documentId: string): Promise<DocumentVersion[]> {
  const response = await fetch(`${API_BASE}/api/documents/${documentId}/versions`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("sagra_token")}`,
    },
  })

  if (!response.ok) throw new Error("Error fetching document versions")
  const data = await response.json()
  return data.data
}

export async function uploadDocument(formData: FormData): Promise<Document> {
  const response = await fetch(`${API_BASE}/api/documents`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("sagra_token")}`,
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Error uploading document")
  }

  const data = await response.json()
  return data.data
}

export async function approveDocument(documentId: string, observaciones?: string): Promise<Document> {
  const response = await fetch(`${API_BASE}/api/documents/${documentId}/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("sagra_token")}`,
    },
    body: JSON.stringify({ observaciones }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Error approving document")
  }

  const data = await response.json()
  return data.data
}

export async function observeDocument(documentId: string, observaciones: string): Promise<Document> {
  const response = await fetch(`${API_BASE}/api/documents/${documentId}/observe`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("sagra_token")}`,
    },
    body: JSON.stringify({ observaciones }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Error observing document")
  }

  const data = await response.json()
  return data.data
}

export async function rejectDocument(documentId: string, motivo: string): Promise<Document> {
  const response = await fetch(`${API_BASE}/api/documents/${documentId}/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("sagra_token")}`,
    },
    body: JSON.stringify({ motivo }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Error rejecting document")
  }

  const data = await response.json()
  return data.data
}

export async function getDocumentAlerts(): Promise<DocumentAlert[]> {
  const response = await fetch(`${API_BASE}/api/documents/alerts`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("sagra_token")}`,
    },
  })

  if (!response.ok) throw new Error("Error fetching document alerts")
  const data = await response.json()
  return data.data
}
