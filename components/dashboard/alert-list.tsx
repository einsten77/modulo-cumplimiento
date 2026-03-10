"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface Alert {
  id: string
  title: string
  description: string
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  createdAt: string
  dossierType: string
  dossierName: string
}

interface AlertListProps {
  alerts: Alert[]
  maxItems?: number
}

const severityConfig = {
  LOW: { label: "Baja", className: "bg-info/10 text-info border-info/20" },
  MEDIUM: { label: "Media", className: "bg-warning/10 text-warning border-warning/20" },
  HIGH: { label: "Alta", className: "bg-destructive/10 text-destructive border-destructive/20" },
  CRITICAL: { label: "Crítica", className: "bg-destructive text-destructive-foreground" },
}

export function AlertList({ alerts, maxItems = 5 }: AlertListProps) {
  const displayAlerts = alerts.slice(0, maxItems)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          Alertas Activas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {displayAlerts.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-4">No hay alertas activas en este momento</p>
        ) : (
          displayAlerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-3 rounded-lg border border-border bg-card p-4 hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-semibold text-foreground">{alert.title}</h4>
                  <Badge variant="outline" className={cn(severityConfig[alert.severity].className)}>
                    {severityConfig[alert.severity].label}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{alert.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="font-medium">
                    {alert.dossierType}: {alert.dossierName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {alert.createdAt}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
