export async function getDashboardMetrics(role: string): Promise<any> {
  const token = localStorage.getItem("sagra_token")

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL}/api/dashboard/metrics?role=${role}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error("Error al obtener métricas del dashboard")
  }

  return response.json()
}

export async function getRecentAlerts(limit = 5): Promise<any> {
  const token = localStorage.getItem("sagra_token")

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL}/api/dashboard/alerts?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error("Error al obtener alertas")
  }

  return response.json()
}

export async function getRecentActivity(limit = 10): Promise<any> {
  const token = localStorage.getItem("sagra_token")

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL}/api/dashboard/activity?limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error("Error al obtener actividad reciente")
  }

  return response.json()
}

export async function getPendingDossiers(status?: string, limit = 10): Promise<any> {
  const token = localStorage.getItem("sagra_token")

  const params = new URLSearchParams()
  if (status) params.append("status", status)
  params.append("limit", limit.toString())

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL}/api/dashboard/dossiers?${params.toString()}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  if (!response.ok) {
    throw new Error("Error al obtener expedientes")
  }

  return response.json()
}
