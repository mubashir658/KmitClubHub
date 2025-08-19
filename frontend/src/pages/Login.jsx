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
    rollNo: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    console.log('Login attempt with:', { rollNo: formData.rollNo, password: formData.password })

    const result = await login(formData.rollNo, formData.password)

    if (result.success) {
      const role = result.user.role
      const intendedPath = getDashboardPath(role)
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

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h2>Login</h2>
          <p>Sign in to your KMIT Club Hub account</p>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="rollNo">Roll Number</label>
            <input
              type="text"
              id="rollNo"
              name="rollNo"
              value={formData.rollNo}
              onChange={handleChange}
              required
              className={styles.formControl}
              placeholder="Enter your roll number"
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={styles.formControl}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={togglePasswordVisibility}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
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
