import { type NextRequest, NextResponse } from "next/server"

interface PasswordRecoveryRequest {
  username: string
}

interface PasswordRecoveryResponse {
  success: boolean
  message: string
  corporateEmail?: string
}

export async function POST(request: NextRequest) {
  try {
    const body: PasswordRecoveryRequest = await request.json()
    const { username } = body

    // Validaciones básicas
    if (!username || username.trim().length === 0) {
      return NextResponse.json({ success: false, message: "El usuario es requerido" }, { status: 400 })
    }

    // Limpiar username
    const cleanUsername = username.toLowerCase().trim()

    // Validar formato de usuario corporativo (solo letras, números y guiones)
    const usernameRegex = /^[a-z0-9._-]+$/
    if (!usernameRegex.test(cleanUsername)) {
      return NextResponse.json({ success: false, message: "Formato de usuario inválido" }, { status: 400 })
    }

    // Llamada al backend Java
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"
    const response = await fetch(`${backendUrl}/api/v1/auth/password-recovery`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Client-IP": request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
        "X-User-Agent": request.headers.get("user-agent") || "unknown",
      },
      body: JSON.stringify({
        username: cleanUsername,
        requestMetadata: {
          clientIp: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
          userAgent: request.headers.get("user-agent"),
          timestamp: new Date().toISOString(),
        },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      // Mapear códigos de error del backend
      if (response.status === 404) {
        return NextResponse.json({ success: false, message: "Usuario no encontrado en el sistema" }, { status: 404 })
      } else if (response.status === 403) {
        return NextResponse.json({ success: false, message: "Usuario inactivo o suspendido" }, { status: 403 })
      } else if (response.status === 429) {
        return NextResponse.json(
          { success: false, message: "Demasiadas solicitudes. Intente más tarde" },
          { status: 429 },
        )
      }

      return NextResponse.json(
        { success: false, message: data.message || "Error al procesar solicitud" },
        { status: response.status },
      )
    }

    // Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        message: "Instrucciones enviadas exitosamente",
        corporateEmail: data.corporateEmail,
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[v0] Error en password recovery:", error)
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 })
  }
}
