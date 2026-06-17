"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter } from "next/navigation"

interface AuthUser {
  id: string
  email: string
  name: string | null
}

interface AuthContextType {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load token + user from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem("token")
    const storedUser = localStorage.getItem("user")
    if (storedToken && storedUser) {
      try {
        setToken(storedToken)
        setUser(JSON.parse(storedUser))
      } catch {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Login failed")
      }

      const { token: newToken, user: newUser } = data.data
      localStorage.setItem("token", newToken)
      localStorage.setItem("user", JSON.stringify(newUser))
      setToken(newToken)
      setUser(newUser)
    },
    []
  )

  const register = useCallback(
    async (email: string, password: string, name: string) => {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Registration failed")
      }

      const { token: newToken, user: newUser } = data.data
      localStorage.setItem("token", newToken)
      localStorage.setItem("user", JSON.stringify(newUser))
      setToken(newToken)
      setUser(newUser)
    },
    []
  )

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setToken(null)
    setUser(null)
    router.push("/")
  }, [router])

  const value: AuthContextType = {
    token,
    user,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
