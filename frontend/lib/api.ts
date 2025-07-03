// API utility functions
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"


export async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token")

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid, redirect to login
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      window.location.href = "/auth/login"
    }

    // Try to get error message from response
    let errorMessage = `API call failed: ${response.statusText}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch (e) {
      // If response is not JSON, use the default message
    }

    throw new Error(errorMessage)
  }

  return response.json()
}

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      let errorMessage = "Login failed"
      try {
        const errorData = await response.json()
        errorMessage = errorData.message || errorData.error || errorMessage
      } catch (e) {
        // If response is not JSON, use the default message
      }
      throw new Error(errorMessage)
    }

    return response.json()
  },

  register: async (username: string, email: string, password: string) => {

    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password }),
    })

    // Check if the response is successful (200-299 range)
    if (response.ok) {
      const data = await response.json()
      return data
    }

    // Handle error responses
    let errorMessage = "Registration failed"
    try {
      const errorData = await response.json()
      errorMessage = errorData.message || errorData.error || errorMessage
    } catch (e) {
      console.log("Could not parse error response as JSON") 
    }
    throw new Error(errorMessage)
  },

  verifyToken: async () => {
    const token = localStorage.getItem("token")
    if (!token) return null

    try {
      const response = await fetch(`${API_BASE_URL}/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        return response.json()
      }
    } catch (error) {
      console.error("Token verification failed:", error)
    }

    return null
  },
}
