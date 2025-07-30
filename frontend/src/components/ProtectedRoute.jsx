"use client"

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (!isAuthenticated) {
    // Redirect to login with the intended destination
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to the correct dashboard based on user's role
    const getCorrectDashboard = (role) => {
      switch (role) {
        case "student":
          return "/student/dashboard"
        case "coordinator":
          return "/coordinator/dashboard"
        case "admin":
          return "/admin/dashboard"
        default:
          return "/"
      }
    }
    
    console.log('User role:', user.role, 'Allowed roles:', allowedRoles)
    console.log('Redirecting to correct dashboard:', getCorrectDashboard(user.role))
    
    return <Navigate to={getCorrectDashboard(user.role)} replace />
  }

  return children
}

export default ProtectedRoute
