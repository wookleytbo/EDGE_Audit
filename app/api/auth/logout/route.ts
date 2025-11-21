import { NextRequest, NextResponse } from "next/server"
import { deleteSession, getSessionFromRequest } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const session = getSessionFromRequest(request)
  
  if (session) {
    const cookieHeader = request.headers.get("cookie")
    if (cookieHeader) {
      const cookies = Object.fromEntries(
        cookieHeader.split("; ").map((c) => {
          const [key, ...values] = c.split("=")
          return [key, values.join("=")]
        })
      )
      const sessionId = cookies["fieldform-session"]
      if (sessionId) {
        deleteSession(sessionId)
      }
    }
  }

  const response = NextResponse.json({ success: true })
  response.cookies.delete("fieldform-session")
  return response
}

