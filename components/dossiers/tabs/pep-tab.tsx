"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Shield, AlertTriangle, CheckCircle, XCircle, Calendar, User, Building } from "lucide-react"
import type { PEPInformation, PEPHistory } from "@/types/dossier"

interface PEPTabProps {
  pepInfo?: PEPInformation
  pepHistory?: PEPHistory[]
  isReadOnly?: boolean
}

export function PEPTab({ pepInfo, pepHistory = [], isReadOnly = false }: PEPTabProps) {
  const getPEPTypeBadge = (type: string) => {
    const config = {
      DIRECT: { label: "PEP Directo", className: "bg-red-500/10 text-red-500 border-red-500/20" },
      RELATED: { label: "PEP Relacionado", className: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
      CLOSE_ASSOCIATE: {
        label: "Asociado Cercano",
        className: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      },
      FORMER: { label: "Ex-PEP", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    }
    const cfg = config[type as keyof typeof config]
    return (
      <Badge variant="outline" className={cfg.className}>
        {cfg.label}
      </Badge>
    )
  }

  const getRiskBadge = (risk: string) => {
    const config = {
      LOW: { label: "Bajo", className: "bg-success/10 text-success border-success/20" },
      MEDIUM: { label: "Medio", className: "bg-warning/10 text-warning border-warning/20" },
      HIGH: { label: "Alto", className: "bg-destructive/10 text-destructive border-destructive/20" },
    }
    const cfg = config[risk as keyof typeof config]
    return (
      <Badge variant="outline" className={cfg.className}>
        {cfg.label}
      </Badge>
    )
  }

  if (!pepInfo || !pepInfo.isPep) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Persona Expuesta Políticamente (PEP)</CardTitle>
          <CardDescription>Estado PEP actual e histórico</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <CheckCircle className="h-4 w-4 text-success" />
            <AlertTitle>No es PEP</AlertTitle>
            <AlertDescription>
              Este sujeto no está registrado como Persona Expuesta Políticamente ni tiene historial PEP asociado.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Persona Expuesta Políticamente (PEP)</CardTitle>
          <CardDescription>Información y clasificación PEP actual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* PEP Status Alert */}
          <Alert className="border-destructive/20 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertTitle className="text-destructive">Estado PEP Activo</AlertTitle>
            <AlertDescription>
              Este sujeto está clasificado como Persona Expuesta Políticamente y requiere debida diligencia reforzada.
            </AlertDescription>
          </Alert>

          {/* PEP Information */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Tipo de PEP</div>
              <div className="mt-1">{pepInfo.pepType && getPEPTypeBadge(pepInfo.pepType)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Nivel de Riesgo PEP</div>
              <div className="mt-1">{pepInfo.riskLevel && getRiskBadge(pepInfo.riskLevel)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Cargo/Posición</div>
              <div className="mt-1 flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{pepInfo.position || "No especificado"}</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Entidad/Organización</div>
              <div className="mt-1 flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{pepInfo.entity || "No especificado"}</span>
              </div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">País</div>
              <div className="mt-1 font-medium">{pepInfo.country || "No especificado"}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Período</div>
              <div className="mt-1 flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>
                  {pepInfo.startDate ? new Date(pepInfo.startDate).toLocaleDateString("es-VE") : "N/A"} -{" "}
                  {pepInfo.endDate ? new Date(pepInfo.endDate).toLocaleDateString("es-VE") : "Actual"}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Source and Verification */}
          <div className="space-y-4">
            <h4 className="font-semibold">Fuente y Verificación</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Fuente de Información</div>
                <div className="mt-1 font-medium">{pepInfo.source}</div>
              </div>
              {pepInfo.verifiedBy && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">Verificado por</div>
                  <div className="mt-1 flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{pepInfo.verifiedBy}</span>
                  </div>
                  {pepInfo.verifiedAt && (
                    <div className="text-xs text-muted-foreground">
                      {new Date(pepInfo.verifiedAt).toLocaleString("es-VE")}
                    </div>
                  )}
                </div>
              )}
            </div>
            {pepInfo.observations && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Observaciones</div>
                <div className="mt-1 rounded-lg border bg-muted/30 p-3 text-sm">{pepInfo.observations}</div>
              </div>
            )}
          </div>

          {!isReadOnly && (
            <Button variant="outline" className="w-full bg-transparent">
              <Shield className="mr-2 h-4 w-4" />
              Actualizar Información PEP
            </Button>
          )}
        </CardContent>
      </Card>

      {/* PEP History */}
      {pepHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial PEP</CardTitle>
            <CardDescription>Cambios históricos en el estado PEP</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead>Estado Anterior</TableHead>
                  <TableHead>Nuevo Estado</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pepHistory.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-sm">{new Date(entry.date).toLocaleDateString("es-VE")}</TableCell>
                    <TableCell className="font-medium">{entry.action}</TableCell>
                    <TableCell>
                      {entry.previousStatus ? (
                        <Badge variant="destructive" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          PEP
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          No PEP
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {entry.newStatus ? (
                        <Badge variant="destructive" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          PEP
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          No PEP
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">{entry.user}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{entry.details || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
