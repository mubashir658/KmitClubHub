"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./Auth.module.css"

const CreateCoordinator = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  const [formData, setFormData] = useState({
    name: "",
    rollNo: "",
    email: "",
    password: "",
    clubId: ""
  })

  useEffect(() => {
    // Check if user is admin
    if (!user || user.role !== "admin") {
      navigate("/login")
      return
    }

    // Fetch clubs for dropdown
    fetchClubs()
  }, [user, navigate])

  const fetchClubs = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/clubs")
      setClubs(response.data)
    } catch (error) {
      console.error("Error fetching clubs:", error)
      setMessage("Failed to load clubs")
    }
  }

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
    setLoading(true)
    setMessage("")

    try {
      const response = await axios.post("http://localhost:5000/api/auth/create-coordinator", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      setMessage("Coordinator created successfully!")
      setFormData({
        name: "",
        rollNo: "",
        email: "",
        password: "",
        clubId: ""
      })
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to create coordinator")
    } finally {
      setLoading(false)
    }
  }

  if (!user || user.role !== "admin") {
    return null
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h2>Create Coordinator</h2>
          <p>Add a new coordinator to manage a club</p>
        </div>

        {message && (
          <div className={message.includes("successfully") ? styles.success : styles.error}>
            {message}
          </div>
        )}

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
              placeholder="Enter coordinator's full name"
            />
          </div>

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
              placeholder="Enter roll number"
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
              placeholder="Enter email address"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="clubId">Assign to Club</label>
            <select
              id="clubId"
              name="clubId"
              value={formData.clubId}
              onChange={handleChange}
              required
              className={styles.formControl}
            >
              <option value="">Select a club</option>
              {clubs.map((club) => (
                <option key={club._id} value={club._id}>
                  {club.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Temporary Password</label>
            <div className={styles.passwordContainer}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={styles.formControl}
                placeholder="Enter temporary password"
                minLength={6}
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
            {loading ? "Creating Coordinator..." : "Create Coordinator"}
          </button>
        </form>

        <div className={styles.authFooter}>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className={styles.backBtn}
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreateCoordinator
