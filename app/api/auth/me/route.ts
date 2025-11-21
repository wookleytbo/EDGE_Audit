import { NextRequest, NextResponse } from "next/server"
import { getSessionFromRequest } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const session = getSessionFromRequest(request)

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
  }

  return NextResponse.json({ user: session })
}

