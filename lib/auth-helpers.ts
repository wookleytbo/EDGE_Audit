"use client"

import { useEffect, useState } from "react"

export interface User {
  id: string
  email: string
  name: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    if (response.ok) {
      const data = await response.json()
      setUser(data.user)
      return { success: true }
    } else {
      const error = await response.json()
      return { success: false, error: error.error }
    }
  }

  const register = async (email: string, password: string, name: string, role?: string) => {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name, role }),
    })

    if (response.ok) {
      const data = await response.json()
      setUser(data.user)
      return { success: true }
    } else {
      const error = await response.json()
      return { success: false, error: error.error }
    }
  }

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
  }

  return { user, isLoading, login, register, logout, checkAuth }
}

