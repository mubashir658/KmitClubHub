"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./Dashboard.module.css"

const StudentFeedback = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [clubs, setClubs] = useState([])
  const [formData, setFormData] = useState({
    clubId: "",
    subject: "",
    message: "",
    type: "general"
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUserClubs()
  }, [user])

  const fetchUserClubs = async () => {
    try {
      // Use the joinedClubs from user object directly
      if (user && user.joinedClubs) {
        setClubs(user.joinedClubs)
      } else {
        setClubs([])
      }
    } catch (error) {
      console.error("Error fetching user clubs:", error)
      setClubs([])
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post("http://localhost:5000/api/feedback", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      alert("Feedback submitted successfully!")
      navigate("/student/dashboard")
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit feedback")
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className={styles.dashboardHome}>
      <div className={styles.welcomeSection}>
        <h1>Submit Feedback</h1>
        <p>Share your thoughts and suggestions with your club coordinators</p>
      </div>

      <div className={styles.section}>
        {clubs.length === 0 ? (
          <div className={styles.formContainer}>
            <div className={styles.noClubsMessage}>
              <h3>No Clubs Joined</h3>
              <p>You need to join at least one club before you can submit feedback.</p>
              <button
                onClick={() => navigate("/student/dashboard")}
                className={styles.submitBtn}
              >
                Back to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.formContainer}>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="clubId">Select Club *</label>
                <select
                  id="clubId"
                  name="clubId"
                  value={formData.clubId}
                  onChange={handleChange}
                  required
                  className={styles.formControl}
                >
                  <option value="">Choose a club</option>
                  {clubs.map(club => (
                    <option key={club._id} value={club._id}>
                      {club.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="type">Feedback Type *</label>
                <select
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  required
                  className={styles.formControl}
                >
                  <option value="general">General Feedback</option>
                  <option value="suggestion">Suggestion</option>
                  <option value="complaint">Complaint</option>
                  <option value="appreciation">Appreciation</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="subject">Subject *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className={styles.formControl}
                  placeholder="Brief description of your feedback"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className={styles.formControl}
                  rows="6"
                  placeholder="Please provide detailed feedback..."
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="button"
                  onClick={() => navigate("/student/dashboard")}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={styles.submitBtn}
                >
                  {loading ? "Submitting..." : "Submit Feedback"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

export default StudentFeedback
