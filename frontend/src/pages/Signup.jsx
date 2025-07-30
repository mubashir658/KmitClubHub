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

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNo: "",
    password: "",
    confirmPassword: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { register } = useAuth()
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      return
    }

    setLoading(true)

    const userData = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: role, // Use the role from URL parameter
      rollNo: formData.rollNo,
    }

    // Debug logging
    console.log('Sending userData to backend:', userData)
    console.log('Role from URL:', role)

    const result = await register(userData)

    if (result.success) {
      // Debug logging
      console.log('Registration successful:', result.user)
      console.log('User role:', result.user.role)
      console.log('Expected role from URL:', role)
      
      // Redirect based on user role
      const intendedPath = location.state?.from || getDashboardPath(role)
      console.log('Redirecting to:', intendedPath)
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
          <h2>Sign Up as {roleLabels[role] || "User"}</h2>
          <p>Create your KMIT Club Hub account</p>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={styles.formControl}
              placeholder="Enter your full name"
            />
          </div>

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

          {/* Only show roll number for student and coordinator */}
          {(role === "student" || role === "coordinator") && (
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
          )}

          <div className={styles.formRow}>
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
                placeholder="Enter password"
                minLength={6}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className={styles.formControl}
                placeholder="Confirm password"
                minLength={6}
              />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className={styles.authFooter}>
          <p>
            Already have an account?
            <Link to={`/login?role=${role}`} className={styles.authLink}>
              Sign in here
            </Link>
          </p>
          <button 
            onClick={() => navigate("/role-select")} 
            className={styles.backBtn}
          >
            ← Back to Role Selection
          </button>
        </div>
      </div>
    </div>
  )
}

export default Signup 