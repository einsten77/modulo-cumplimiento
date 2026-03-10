"use client"

import { useAuth } from "@/lib/auth/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ROLE_LABELS } from "@/lib/constants/roles"

export default function DashboardPage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido al Sistema Integral de Administración de Riesgos</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Usuario</CardTitle>
          <CardDescription>Detalles de su sesión actual</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <span className="font-medium">Nombre:</span> {user.fullName}
          </div>
          <div>
            <span className="font-medium">Usuario:</span> {user.username}
          </div>
          <div>
            <span className="font-medium">Email:</span> {user.email}
          </div>
          <div>
            <span className="font-medium">Rol:</span> {ROLE_LABELS[user.role]}
          </div>
          {user.department && (
            <div>
              <span className="font-medium">Departamento:</span> {user.department}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
