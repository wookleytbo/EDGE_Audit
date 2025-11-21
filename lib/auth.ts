// Simple session-based authentication
// In production, use NextAuth.js or similar

import { db } from "./db"

// Simple bcrypt replacement for demo (use bcryptjs in production)
export async function hashPassword(password: string): Promise<string> {
  // In production, use: return bcrypt.hash(password, 10)
  // For demo, return a simple hash
  return Promise.resolve(`hashed_${password}_${Date.now()}`)
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  // In production, use: return bcrypt.compare(password, hashed)
  // For demo, simple check
  return Promise.resolve(hashed.startsWith(`hashed_${password.split("_")[1]}_`))
}

export interface Session {
  userId: string
  email: string
  name: string
}

// In-memory session store (use Redis or database in production)
const sessions = new Map<string, Session>()

export function createSession(userId: string, email: string, name: string): string {
  const sessionId = `session-${Date.now()}-${Math.random().toString(36).substring(7)}`
  sessions.set(sessionId, { userId, email, name })
  return sessionId
}

export function getSession(sessionId: string): Session | null {
  return sessions.get(sessionId) || null
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId)
}

export function getSessionFromRequest(request: Request): Session | null {
  const cookieHeader = request.headers.get("cookie")
  if (!cookieHeader) return null

  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((c) => {
      const [key, ...values] = c.split("=")
      return [key, values.join("=")]
    })
  )

  const sessionId = cookies["fieldform-session"]
  if (!sessionId) return null

  return getSession(sessionId)
}
