"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { AlertCircle } from "lucide-react"
import type { RiskFactor } from "@/types/risk-evaluation"

interface RiskFactorCardProps {
  factor: RiskFactor
  onChange: (factorId: string, weight: number, observation: string) => void
  readonly?: boolean
}

const getRiskLabel = (weight: number): string => {
  if (weight === 0) return "Sin evaluar"
  if (weight === 1) return "Muy bajo"
  if (weight === 2) return "Bajo"
  if (weight === 3) return "Medio"
  if (weight === 4) return "Alto"
  return "Crítico"
}

const getRiskColor = (weight: number): string => {
  if (weight <= 1) return "text-success"
  if (weight <= 2) return "text-info"
  if (weight === 3) return "text-warning"
  return "text-destructive"
}

export function RiskFactorCard({ factor, onChange, readonly = false }: RiskFactorCardProps) {
  const handleWeightChange = (value: number[]) => {
    if (readonly) return
    onChange(factor.factorId, value[0], factor.observation)
  }

  const handleObservationChange = (observation: string) => {
    if (readonly) return
    onChange(factor.factorId, factor.weight, observation)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-base">{factor.factorName}</CardTitle>
            <CardDescription>{factor.description}</CardDescription>
          </div>
          <Badge
            variant={factor.weight >= 4 ? "destructive" : factor.weight >= 3 ? "secondary" : "default"}
            className="ml-2"
          >
            {factor.weight}/5
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Ponderación</Label>
            <span className={`text-sm font-medium ${getRiskColor(factor.weight)}`}>{getRiskLabel(factor.weight)}</span>
          </div>
          <Slider
            value={[factor.weight]}
            onValueChange={handleWeightChange}
            min={0}
            max={5}
            step={1}
            disabled={readonly}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground px-1">
            <span>0</span>
            <span>1</span>
            <span>2</span>
            <span>3</span>
            <span>4</span>
            <span>5</span>
          </div>
        </div>

        {/* Observation */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor={`obs-${factor.factorId}`}>
              Observaciones
              {factor.weight >= 4 && <span className="text-destructive ml-1">*</span>}
            </Label>
            {factor.weight >= 4 && (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <AlertCircle className="h-3 w-3" />
                Obligatorio
              </div>
            )}
          </div>
          <Textarea
            id={`obs-${factor.factorId}`}
            placeholder={
              factor.weight >= 4
                ? "Debe justificar la ponderación alta con observaciones detalladas..."
                : "Observaciones opcionales sobre este factor..."
            }
            value={factor.observation}
            onChange={(e) => handleObservationChange(e.target.value)}
            rows={3}
            disabled={readonly}
            className={factor.weight >= 4 && !factor.observation ? "border-destructive" : ""}
          />
        </div>
      </CardContent>
    </Card>
  )
}
