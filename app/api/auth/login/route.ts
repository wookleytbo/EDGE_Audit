import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { verifyPassword, createSession } from "@/lib/auth"
import { getPasswordStore } from "../register/route"

// Simple password store (in production, use database)
const passwordStore = getPasswordStore()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = db.getUserByEmail(email)
    if (!user) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Check password (in production, get from database)
    const storedPassword = passwordStore.get(user.id)
    if (!storedPassword) {
      return NextResponse.json({ error: "Please register first" }, { status: 401 })
    }

    // Extract password from hash format: hashed_${password}_${timestamp}
    const isValid = storedPassword.includes(`hashed_${password}_`)
    if (!isValid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

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
    console.error("Error logging in:", error)
    return NextResponse.json({ error: "Failed to login" }, { status: 500 })
  }
}

// Helper to store password during registration
export function storePassword(userId: string, hashedPassword: string) {
  passwordStore.set(userId, hashedPassword)
}

