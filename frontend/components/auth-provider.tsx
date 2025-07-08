"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { authAPI } from "@/lib/api"

interface User {
  id: string
  email: string
  username: string
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const userData = localStorage.getItem("user")

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
      } catch (error) {
        localStorage.removeItem("token")
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const data = await authAPI.login(email, password)

      // Store the token and user data from your API response
      localStorage.setItem("token", data.token)
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user.id,
          username: data.user.username,
          email: email,
        }),
      )

      setUser({
        id: data.user.id,
        username: data.user.username,
        email: email,
      })

      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    try {
      const data = await authAPI.register(username, email, password)
      // Store the token and user data from your API response
      localStorage.setItem("token", data.token)
      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.user.id,
          username: data.user.username,
          email: email,
        }),
      )

      setUser({
        id: data.user.id,
        username: data.user.username,
        email: email,
      })

      return true
    } catch (error) {
      console.error("Registration error in auth provider:", error)
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    setUser(null)
    router.push("/auth/login")
  }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}
