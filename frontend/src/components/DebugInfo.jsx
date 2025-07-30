"use client"

import { useAuth } from "../context/AuthContext"
import { useLocation } from "react-router-dom"

const DebugInfo = () => {
  const { user, isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) return <div>Loading...</div>

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'rgba(0,0,0,0.8)', 
      color: 'white', 
      padding: '10px', 
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      maxWidth: '300px'
    }}>
      <h4>Debug Info</h4>
      <p><strong>Current Path:</strong> {location.pathname}</p>
      <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
      {user && (
        <>
          <p><strong>User Name:</strong> {user.name}</p>
          <p><strong>User Email:</strong> {user.email}</p>
          <p><strong>User Role:</strong> {user.role}</p>
          <p><strong>User ID:</strong> {user.id}</p>
        </>
      )}
    </div>
  )
}

export default DebugInfo 