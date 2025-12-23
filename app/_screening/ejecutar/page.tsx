"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Search, FileSearch, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function EjecutarScreeningPage() {
  const [selectedLists, setSelectedLists] = useState<string[]>(["onu", "ofac", "ue", "unif", "gafi"])

  const listas = [
    { id: "onu", name: "Lista Consolidada ONU", description: "Consejo de Seguridad de la ONU" },
    { id: "ofac", name: "Lista OFAC", description: "Office of Foreign Assets Control - EEUU" },
    { id: "ue", name: "Listas Unión Europea", description: "Sanciones restrictivas UE" },
    { id: "unif", name: "Listas UNIF", description: "Unidad Nacional de Inteligencia Financiera" },
    { id: "gafi", name: "Listas GAFI", description: "Grupo de Acción Financiera Internacional" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src="/images/seguros-20la-20occidental-20-20241004-120655-0000-20-281-29.jpg"
                alt="La Occidental"
                className="h-12 w-auto"
              />
              <div>
                <h1 className="text-xl font-semibold text-foreground">Ejecutar Screening</h1>
                <p className="text-sm text-muted-foreground">Consulta contra listas restrictivas</p>
              </div>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Panel
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert className="mb-6 border-info/50 bg-info/10">
          <AlertCircle className="h-4 w-4 text-info" />
          <AlertTitle className="text-info-foreground">Screening Automatizado</AlertTitle>
          <AlertDescription className="text-muted-foreground">
            El sistema utiliza el algoritmo Jaro-Winkler para calcular el porcentaje de similitud. Todas las consultas
            quedan registradas para auditoría de SUDEASEG.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5 text-primary" />
              Datos del Sujeto a Evaluar
            </CardTitle>
            <CardDescription>
              Ingrese los datos de la persona natural o jurídica para realizar el screening
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expediente">Expediente Asociado</Label>
                  <Input id="expediente" placeholder="EXP-2024-001234" className="font-mono" />
                  <p className="text-xs text-muted-foreground">Número del expediente en SIAR</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tipo-persona">Tipo de Persona</Label>
                  <select
                    id="tipo-persona"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="natural">Persona Natural</option>
                    <option value="juridica">Persona Jurídica</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre-completo">Nombre Completo / Razón Social</Label>
                <Input id="nombre-completo" placeholder="Ingrese el nombre completo o razón social" />
                <p className="text-xs text-muted-foreground">
                  Ingrese el nombre exacto como aparece en los documentos de identidad
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="tipo-documento">Tipo de Documento</Label>
                  <select
                    id="tipo-documento"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="v">V - Cédula de Identidad</option>
                    <option value="e">E - Cédula de Extranjero</option>
                    <option value="j">J - Registro Mercantil</option>
                    <option value="g">G - Gobierno</option>
                    <option value="p">P - Pasaporte</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="numero-documento">Número de Documento</Label>
                  <Input id="numero-documento" placeholder="12345678" className="font-mono" />
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-semibold mb-4 text-foreground">Seleccionar Listas a Consultar</h3>
              <div className="space-y-3">
                {listas.map((lista) => (
                  <div
                    key={lista.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={lista.id}
                      checked={selectedLists.includes(lista.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedLists([...selectedLists, lista.id])
                        } else {
                          setSelectedLists(selectedLists.filter((id) => id !== lista.id))
                        }
                      }}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <Label htmlFor={lista.id} className="cursor-pointer font-medium">
                        {lista.name}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">{lista.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-6 border-t">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium text-foreground mb-1">Listas seleccionadas: {selectedLists.length}/5</p>
                <p>El screening puede tardar entre 10 y 30 segundos</p>
              </div>
              <Link href="/screening/resultados">
                <Button size="lg" className="bg-primary hover:bg-primary/90">
                  <Search className="h-4 w-4 mr-2" />
                  Ejecutar Screening
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-warning/50 bg-warning/5">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2 text-warning-foreground">
              <AlertCircle className="h-4 w-4 text-warning" />
              Importante - Consideraciones de Cumplimiento
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>• Todas las consultas quedan registradas con fecha, hora y usuario.</p>
            <p>• El resultado del screening no implica aprobación o rechazo automático.</p>
            <p>• Las coincidencias deben ser analizadas por el Oficial de Cumplimiento.</p>
            <p>• El sistema genera alertas automáticas para coincidencias de nivel Alto.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
