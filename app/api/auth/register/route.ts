import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { hashPassword, createSession } from "@/lib/auth"

// Simple password store (in production, use database)
const passwordStore = new Map<string, string>()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, role } = body

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = db.getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 })
    }

    // Create user
    const hashedPassword = await hashPassword(password)
    const user = db.createUser({
      email,
      name,
      role: role || "field-worker",
    })

    // Store password hash
    passwordStore.set(user.id, hashedPassword)

    // Create session
    const sessionId = createSession(user.id, user.email, user.name)

    const response = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
    response.cookies.set("fieldform-session", sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Error registering user:", error)
    return NextResponse.json({ error: "Failed to register" }, { status: 500 })
  }
}

// Export password store for login route
export function getPasswordStore() {
  return passwordStore
}

