import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json()

    if (username === "admin" && password === "admin") {
      const exp = Math.floor(Date.now() / 1000) + 60 * 60 // 1 hora
      const payload = Buffer.from(JSON.stringify({ exp })).toString("base64url")
      const token = `devheader.${payload}.devsig`

      return NextResponse.json({
        data: {
          token,
          user: {
            id: "1",
            username: "admin",
            fullName: "Administrador",
            email: "admin@local",
            role: "OFICIAL_CUMPLIMIENTO",
            permissions: ["*"],
            status: "ACTIVO",
          },
        },
      })
    }

    return NextResponse.json({ message: "Credenciales inválidas" }, { status: 401 })
  } catch {
    return NextResponse.json({ message: "Error procesando login" }, { status: 500 })
  }
}
