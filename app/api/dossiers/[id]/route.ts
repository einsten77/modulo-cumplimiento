import { NextResponse } from "next/server"

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params

  // Dev mock (estructura simple para no romper UI)
  // Si tienes una vista detalle más compleja, aquí puedes devolver el mock grande.
  return NextResponse.json({
    data: {
      id,
      dossierId: `DOSS-DEV-${id}`,
      subjectType: "CLIENT",
      name: "Expediente Demo",
      documentNumber: "V-00000000",
      riskLevel: "LOW",
      status: "UNDER_REVIEW",
      completenessPercentage: 0,
      alertCount: 0,
      lastModifiedAt: new Date().toISOString(),
    },
  })
}
