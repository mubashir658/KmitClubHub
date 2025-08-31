"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem("token"))

  // Set up axios defaults
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
      delete axios.defaults.headers.common["Authorization"]
    }
  }, [token])

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const response = await axios.get("http://localhost:5000/api/auth/profile")
          console.log('Profile response:', response.data)
          console.log('Profile role:', response.data.role)
          setUser(response.data)
        } catch (error) {
          console.error("Error fetching user:", error)
          // Clear invalid token
          localStorage.removeItem("token")
          setToken(null)
          setUser(null)
        }
      }
      setLoading(false)
    }

    checkAuth()
  }, [token])

  const login = async (rollNo, password) => {
    try {
      const response = await axios.post("http://localhost:5000/api/auth/login", { rollNo, password })
      const { token: newToken, user: userData } = response.data

      // Debug logging
      console.log('Login response:', response.data)
      console.log('User data received:', userData)
      console.log('User role:', userData.role)

      // Store token and update state
      localStorage.setItem("token", newToken)
      setToken(newToken)
      setUser(userData)
      
      // Update axios headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`

      return { success: true, user: userData }
    } catch (error) {
      console.error("Login error:", error)
      return {
        success: false,
        message: error.response?.data?.message || "Login failed. Please check your credentials.",
      }
    }
  }

  const register = async (userData) => {
    try {
      console.log('AuthContext: Starting registration with userData:', userData)
      
      const response = await axios.post("http://localhost:5000/api/auth/register", userData)
      const { token: newToken, user: userInfo } = response.data

      // Debug logging
      console.log('Registration response:', response.data)
      console.log('User info received:', userInfo)
      console.log('User role:', userInfo.role)
      console.log('Token received:', !!newToken)

      // Store token and update state
      localStorage.setItem("token", newToken)
      setToken(newToken)
      setUser(userInfo)
      
      console.log('AuthContext: User state updated with:', userInfo)
      
      // Update axios headers
      axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`

      return { success: true, user: userInfo }
    } catch (error) {
      console.error("Registration error:", error)
      console.error("Error response:", error.response?.data)
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed. Please try again.",
      }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common["Authorization"]
  }

  const updateUser = (newUserData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...newUserData
    }))
  }

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    loading,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
