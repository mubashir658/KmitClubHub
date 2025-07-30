"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import styles from "./Auth.module.css"

function getRoleFromQuery(search) {
  const params = new URLSearchParams(search)
  return params.get("role")
}

const roleLabels = {
  student: "Student",
  coordinator: "Coordinator",
  admin: "Admin"
}

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const role = getRoleFromQuery(location.search)

  useEffect(() => {
    if (!role) {
      navigate("/role-select", { replace: true })
    }
  }, [role, navigate])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const result = await login(formData.email, formData.password, role)

    if (result.success) {
      // Redirect based on user role or intended destination
      const intendedPath = location.state?.from || getDashboardPath(result.user.role)
      navigate(intendedPath)
    } else {
      setError(result.message)
    }

    setLoading(false)
  }

  const getDashboardPath = (role) => {
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

  if (!role) return null

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h2>Login as {roleLabels[role] || "User"}</h2>
          <p>Sign in to your KMIT Club Hub account</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className={styles.formControl}
              placeholder="Enter your email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className={styles.formControl}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p>
            Don't have an account?
            <Link to="/signup" className={styles.authLink}>
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
