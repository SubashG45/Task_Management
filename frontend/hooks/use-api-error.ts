"use client"

import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/auth-provider"

export function useApiError() {
  const { toast } = useToast()
  const { logout } = useAuth()

  const handleError = (error: any, customMessage?: string) => {
    console.error("API Error:", error)

    if (error.status === 401) {
      toast({
        title: "Session expired",
        description: "Please log in again.",
        variant: "destructive",
      })
      logout()
      return
    }

    toast({
      title: "Error",
      description: customMessage || error.message || "Something went wrong. Please try again.",
      variant: "destructive",
    })
  }

  return { handleError }
}
