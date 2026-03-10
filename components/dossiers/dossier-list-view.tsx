"use client"

import { useEffect, useMemo, useState } from "react"

type Summary = {
  total: number
  byStatus: Record<string, number>
  byRisk: Record<string, number>
}

const DEFAULT_SUMMARY: Summary = {
  total: 0,
  byStatus: {},
  byRisk: {},
}

function safeNumber(v: unknown, fallback = 0) {
  return typeof v === "number" && Number.isFinite(v) ? v : fallback
}

/**
 * Normaliza cualquier forma razonable de respuesta:
 * - { data: { ... } }
 * - { ... }
 * y diferentes nombres:
 * - byStatus | statusCounts | status | countsByStatus
 * - byRisk   | riskCounts   | risk   | countsByRisk
 */
function normalizeSummary(raw: any): Summary {
  const root = raw?.data ?? raw ?? {}

  const total =
    safeNumber(root.total) ??
    safeNumber(root.totalDossiers) ??
    safeNumber(root.totalExpedientes) ??
    0

  const byStatus =
    root.byStatus ??
    root.statusCounts ??
    root.status ??
    root.countsByStatus ??
    {}

  const byRisk =
    root.byRisk ??
    root.riskCounts ??
    root.risk ??
    root.countsByRisk ??
    {}

  return {
    total: safeNumber(total, 0),
    byStatus: typeof byStatus === "object" && byStatus ? byStatus : {},
    byRisk: typeof byRisk === "object" && byRisk ? byRisk : {},
  }
}

export default function DossierListView() {
  const [summary, setSummary] = useState<Summary>(DEFAULT_SUMMARY)
  const [loadingSummary, setLoadingSummary] = useState(true)

  useEffect(() => {
    const loadSummary = async () => {
      setLoadingSummary(true)
      try {
        const res = await fetch("/api/dossiers/summary", { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)

        const json = await res.json()
        const normalized = normalizeSummary(json)
        setSummary(normalized)
      } catch (err) {
        console.error("[v0] Error loading summary:", err)
        setSummary(DEFAULT_SUMMARY) // <- evita que reviente la UI
      } finally {
        setLoadingSummary(false)
      }
    }

    loadSummary()
  }, [])

  // ✅ NUNCA leer propiedades sin fallback
  const total = summary.total

  // Estados esperados por UI (ajusta si tus keys reales difieren)
  const underReview =
    summary.byStatus?.UNDER_REVIEW ??
    summary.byStatus?.EN_REVISION ??
    summary.byStatus?.UNDERREVIEW ??
    0

  const incomplete =
    summary.byStatus?.INCOMPLETE ??
    summary.byStatus?.INCOMPLETO ??
    summary.byStatus?.INCOMPLETOS ??
    0

  const highRisk =
    summary.byRisk?.HIGH ??
    summary.byRisk?.ALTO ??
    summary.byRisk?.HIGH_RISK ??
    0

  // Aquí tu UI real (cards / tabla). Yo no cambio tu layout,
  // solo muestro valores ya seguros.
  return (
    <div className="space-y-6">
      {/* Cards summary */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border p-4">
          <div className="text-sm text-muted-foreground">Total Expedientes</div>
          <div className="mt-2 text-3xl font-semibold">{loadingSummary ? "…" : total}</div>
          <div className="text-xs text-muted-foreground">Registrados en el sistema</div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-sm text-muted-foreground">En Revisión</div>
          <div className="mt-2 text-3xl font-semibold">{loadingSummary ? "…" : underReview}</div>
          <div className="text-xs text-muted-foreground">Pendientes de aprobación</div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-sm text-muted-foreground">Incompletos</div>
          <div className="mt-2 text-3xl font-semibold">{loadingSummary ? "…" : incomplete}</div>
          <div className="text-xs text-muted-foreground">Requieren completar datos</div>
        </div>

        <div className="rounded-xl border p-4">
          <div className="text-sm text-muted-foreground">Alto Riesgo</div>
          <div className="mt-2 text-3xl font-semibold">{loadingSummary ? "…" : highRisk}</div>
          <div className="text-xs text-muted-foreground">Requieren atención prioritaria</div>
        </div>
      </div>

      {/* TODO: deja tu tabla/lista original aquí */}
      {/* Si tu archivo ya tenía tabla, pégala debajo y reemplaza los contadores por los de arriba */}
    </div>
  )
}
