import { NextResponse } from "next/server"

export async function GET() {
  // Dev mock (vacío)
  return NextResponse.json({
    data: [],
  })
}
