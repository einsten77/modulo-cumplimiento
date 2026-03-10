import { NextResponse } from "next/server"

export async function GET() {
  // Dev mock - IMPORTANTE: incluye byStatus para que el front no reviente
  return NextResponse.json({
    data: {
      total: 0,
      inReview: 0,
      incomplete: 0,
      highRisk: 0,
      byStatus: {
        UNDER_REVIEW: 0,
        INCOMPLETE: 0,
        HIGH_RISK: 0,
        APPROVED: 0,
        REJECTED: 0,
      },
    },
  })
}
