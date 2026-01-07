"use client"

import { useEffect, useMemo, useState } from "react"
import { apiClient } from "@/lib/api/client"

type SummaryResponse = {
  TOTAL?: number
  UNDER_REVIEW?: number
  INCOMPLETE?: number
  HIGH_RISK?: number
}

type Dossier = {
  id?: string
  name?: string
  document?: string
  type?: string
  risk?: string
  status?: string
}

export default function AlertasPage() {
  const [summary, setSummary] = useState<Required<SummaryResponse>>({
    TOTAL: 0,
    UNDER_REVIEW: 0,
    INCOMPLETE: 0,
    HIGH_RISK: 0,
  })
  const [rows, setRows] = useState<Dossier[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const counters = useMemo(
    () => [
      { title: "Total Expedientes", value: summary.TOTAL },
      { title: "En Revisión", value: summary.UNDER_REVIEW },
      { title: "Incompletos", value: summary.INCOMPLETE },
      { title: "Alto Riesgo", value: summary.HIGH_RISK },
    ],
    [summary]
  )

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setErrorMsg(null)

      try {
        // 1) Summary
        try {
          const s = await apiClient.get<SummaryResponse>("/api/dossiers/summary")
          setSummary({
            TOTAL: s?.TOTAL ?? 0,
            UNDER_REVIEW: s?.UNDER_REVIEW ?? 0,
            INCOMPLETE: s?.INCOMPLETE ?? 0,
            HIGH_RISK: s?.HIGH_RISK ?? 0,
          })
        } catch (e) {
          console.warn("[v0] Summary no disponible (backend caído o 404).", e)
          setSummary({ TOTAL: 0, UNDER_REVIEW: 0, INCOMPLETE: 0, HIGH_RISK: 0 })
        }

        // 2) Listado
        try {
          const list = await apiClient.get<{ items?: Dossier[] } | Dossier[]>(
            "/api/dossiers"
          )
          // soporta ambos formatos: {items: []} o []
          const items = Array.isArray(list) ? list : list?.items ?? []
          setRows(items)
        } catch (e) {
          console.warn("[v0] Listado no disponible (backend caído o 404).", e)
          setRows([])
        }
      } catch (e: any) {
        // fallback ultra defensivo: no reventar
        setErrorMsg(e?.message || "No se pudo cargar la información.")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div className="space-y-6">
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {counters.map((c) => (
          <div key={c.title} className="rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">{c.title}</p>
            <p className="text-2xl font-bold">{c.value ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Tabla */}
      <div className="rounded-lg border">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold">Listado de Expedientes</h2>
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-green-600 px-4 py-2 text-white text-sm font-medium hover:bg-green-700"
            onClick={() => alert("Pendiente: crear expediente")}
          >
            + Nuevo Expediente
          </button>
        </div>

        {errorMsg ? (
          <div className="p-6 text-sm text-red-600">{errorMsg}</div>
        ) : loading ? (
          <div className="p-6 text-sm text-muted-foreground">Cargando…</div>
        ) : rows.length === 0 ? (
          <div className="p-6 text-sm text-muted-foreground">
            No se encontraron expedientes.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left">
                <tr className="border-b">
                  <th className="p-3">Nombre</th>
                  <th className="p-3">Documento</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3">Riesgo</th>
                  <th className="p-3">Estatus</th>
                  <th className="p-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, idx) => (
                  <tr key={r.id ?? idx} className="border-b">
                    <td className="p-3">{r.name ?? "—"}</td>
                    <td className="p-3">{r.document ?? "—"}</td>
                    <td className="p-3">{r.type ?? "—"}</td>
                    <td className="p-3">{r.risk ?? "—"}</td>
                    <td className="p-3">{r.status ?? "—"}</td>
                    <td className="p-3">
                      <button
                        className="text-blue-600 hover:underline"
                        type="button"
                        onClick={() => alert("Pendiente: ver expediente")}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
