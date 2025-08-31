"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./Dashboard.module.css"

const AdminFeedback = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [allFeedback, setAllFeedback] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchAllFeedback()
  }, [])

  const fetchAllFeedback = async () => {
    try {
      const response = await axios.get("/api/feedback/admin", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      setAllFeedback(response.data)
    } catch (error) {
      console.error("Error fetching feedback:", error)
      setAllFeedback([])
    } finally {
      setLoading(false)
    }
  }

  const handleFeedbackAction = async (feedbackId, action) => {
    try {
      await axios.put(`/api/feedback/${feedbackId}/admin-action`, { action }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      alert(`Feedback ${action}d successfully!`)
      fetchAllFeedback()
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${action} feedback`)
    }
  }

  const filteredFeedback = allFeedback.filter(feedback => {
    if (filter === "all") return true
    if (filter === "pending") return feedback.status === "pending"
    if (filter === "escalated") return feedback.status === "escalated"
    if (filter === "resolved") return feedback.status === "resolved"
    return true
  })

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className={styles.dashboardHome}>
      <div className={styles.welcomeSection}>
        <h1>Feedback Management</h1>
        <p>Oversee all feedback from coordinators and escalated student feedback</p>
      </div>

      <div className={styles.section}>
        <div className={styles.filterControls}>
          <h2>All Feedback</h2>
          <div className={styles.filterButtons}>
            <button
              className={filter === "all" ? styles.activeFilter : ""}
              onClick={() => setFilter("all")}
            >
              All ({allFeedback.length})
            </button>
            <button
              className={filter === "pending" ? styles.activeFilter : ""}
              onClick={() => setFilter("pending")}
            >
              Pending ({allFeedback.filter(f => f.status === "pending").length})
            </button>
            <button
              className={filter === "escalated" ? styles.activeFilter : ""}
              onClick={() => setFilter("escalated")}
            >
              Escalated ({allFeedback.filter(f => f.status === "escalated").length})
            </button>
            <button
              className={filter === "resolved" ? styles.activeFilter : ""}
              onClick={() => setFilter("resolved")}
            >
              Resolved ({allFeedback.filter(f => f.status === "resolved").length})
            </button>
          </div>
        </div>

        {filteredFeedback.length > 0 ? (
          <div className={styles.feedbackList}>
            {filteredFeedback.map((feedback) => (
              <div key={feedback._id} className={styles.feedbackItem}>
                <div className={styles.feedbackHeader}>
                  <h4>{feedback.subject}</h4>
                  <span className={`${styles.status} ${styles[feedback.status]}`}>
                    {feedback.status}
                  </span>
                </div>
                <p className={styles.feedbackMessage}>{feedback.message}</p>
                <div className={styles.feedbackMeta}>
                  <span>
                    From: {feedback.coordinator?.name || feedback.student?.name}
                    {feedback.coordinator ? " (Coordinator)" : " (Student)"}
                  </span>
                  <span>Type: {feedback.type}</span>
                  <span>Date: {new Date(feedback.createdAt).toLocaleDateString()}</span>
                  {feedback.club && <span>Club: {feedback.club.name}</span>}
                </div>
                {feedback.status !== "resolved" && (
                  <div className={styles.feedbackActions}>
                    <button
                      onClick={() => handleFeedbackAction(feedback._id, "resolve")}
                      className={styles.resolveBtn}
                    >
                      Mark Resolved
                    </button>
                    {feedback.status === "pending" && (
                      <button
                        onClick={() => handleFeedbackAction(feedback._id, "escalate")}
                        className={styles.escalateBtn}
                      >
                        Escalate
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>No feedback found for the selected filter.</p>
        )}
      </div>

      <div className={styles.section}>
        <h2>Feedback Statistics</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>{allFeedback.length}</h3>
            <p>Total Feedback</p>
          </div>
          <div className={styles.statCard}>
            <h3>{allFeedback.filter(f => f.status === "pending").length}</h3>
            <p>Pending</p>
          </div>
          <div className={styles.statCard}>
            <h3>{allFeedback.filter(f => f.status === "escalated").length}</h3>
            <p>Escalated</p>
          </div>
          <div className={styles.statCard}>
            <h3>{allFeedback.filter(f => f.status === "resolved").length}</h3>
            <p>Resolved</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminFeedback
