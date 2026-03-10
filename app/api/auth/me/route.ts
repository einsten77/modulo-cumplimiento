import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    data: {
      id: "1",
      username: "admin",
      fullName: "Administrador",
      email: "admin@local",
      role: "OFICIAL_CUMPLIMIENTO",
      permissions: ["*"],
      status: "ACTIVO",
    },
  })
}
