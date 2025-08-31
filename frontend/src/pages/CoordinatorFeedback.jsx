"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./Dashboard.module.css"

const CoordinatorFeedback = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [clubFeedback, setClubFeedback] = useState([])
  const [adminFeedback, setAdminFeedback] = useState({
    subject: "",
    message: "",
    type: "general"
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [feedbackStats, setFeedbackStats] = useState({
    total: 0,
    pending: 0,
    resolved: 0,
    escalated: 0,
    solved: 0
  })

  useEffect(() => {
    fetchClubFeedback()
  }, [])

  const fetchClubFeedback = async () => {
    try {
      setLoading(true)
      const response = await axios.get("http://localhost:5000/api/feedback/club", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      console.log("Fetched club feedback:", response.data)
      setClubFeedback(response.data)
      
      // Calculate feedback statistics
      const feedback = response.data || []
      const stats = {
        total: feedback.length,
        pending: feedback.filter(f => f.status === 'pending').length,
        resolved: feedback.filter(f => f.status === 'resolved').length,
        escalated: feedback.filter(f => f.status === 'escalated').length,
        solved: feedback.filter(f => f.status === 'solved').length
      }
      setFeedbackStats(stats)
    } catch (error) {
      console.error("Error fetching feedback:", error)
      if (error.response?.status === 404) {
        alert("No club assigned to this coordinator. Please contact an administrator.")
      } else {
        alert("Failed to load feedback. Please try again.")
      }
      setClubFeedback([])
      setFeedbackStats({ total: 0, pending: 0, resolved: 0, escalated: 0, solved: 0 })
    } finally {
      setLoading(false)
    }
  }

  const handleFeedbackAction = async (feedbackId, action) => {
    try {
      await axios.put(`http://localhost:5000/api/feedback/${feedbackId}/action`, { action }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      alert(`Feedback ${action}d successfully!`)
      fetchClubFeedback()
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${action} feedback`)
    }
  }

  const handleAdminFeedbackSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await axios.post("http://localhost:5000/api/feedback/admin", adminFeedback, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      alert("Feedback sent to admin successfully!")
      setAdminFeedback({ subject: "", message: "", type: "general" })
    } catch (error) {
      alert(error.response?.data?.message || "Failed to send feedback to admin")
    } finally {
      setSubmitting(false)
    }
  }

  const handleAdminFeedbackChange = (e) => {
    setAdminFeedback({
      ...adminFeedback,
      [e.target.name]: e.target.value
    })
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className={styles.dashboardHome}>
      <div className={styles.welcomeSection}>
        <h1>Feedback Management</h1>
        <p>Manage feedback from your club members and send feedback to admin</p>
      </div>

      {/* Feedback Progress Summary */}
      <div className={styles.section}>
        <h2>Feedback Progress Overview</h2>
        <div className={styles.feedbackProgressGrid}>
          <div className={styles.progressCard}>
            <div className={styles.progressIcon} style={{ backgroundColor: '#ffc107' }}>⏳</div>
            <div className={styles.progressContent}>
              <h3>{feedbackStats.pending}</h3>
              <p>Pending</p>
            </div>
          </div>
          <div className={styles.progressCard}>
            <div className={styles.progressIcon} style={{ backgroundColor: '#17a2b8' }}>✅</div>
            <div className={styles.progressContent}>
              <h3>{feedbackStats.solved}</h3>
              <p>Solved</p>
            </div>
          </div>
          <div className={styles.progressCard}>
            <div className={styles.progressIcon} style={{ backgroundColor: '#28a745' }}>🎯</div>
            <div className={styles.progressContent}>
              <h3>{feedbackStats.resolved}</h3>
              <p>Resolved</p>
            </div>
          </div>
          <div className={styles.progressCard}>
            <div className={styles.progressIcon} style={{ backgroundColor: '#dc3545' }}>📤</div>
            <div className={styles.progressContent}>
              <h3>{feedbackStats.escalated}</h3>
              <p>Passed to Admin</p>
            </div>
          </div>
        </div>
        
        {feedbackStats.total > 0 && (
          <div className={styles.progressBar}>
            <div className={styles.progressBarContainer}>
              <div 
                className={styles.progressBarFill} 
                style={{ 
                  width: `${((feedbackStats.resolved + feedbackStats.solved) / feedbackStats.total) * 100}%` 
                }}
              ></div>
            </div>
            <p className={styles.progressText}>
              {Math.round(((feedbackStats.resolved + feedbackStats.solved) / feedbackStats.total) * 100)}% Complete
            </p>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Feedback from Club Members</h2>
          <button
            onClick={fetchClubFeedback}
            disabled={loading}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            Loading feedback...
          </div>
        ) : clubFeedback.length > 0 ? (
          <div className={styles.feedbackList}>
            {clubFeedback.map((feedback) => (
              <div key={feedback._id} className={styles.feedbackItem} style={{
                border: '2px solid #e9ecef',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '20px',
                backgroundColor: '#fff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div className={styles.feedbackHeader} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <h4 style={{ fontSize: '18px', color: '#333', margin: 0 }}>{feedback.subject}</h4>
                  <span className={`${styles.status} ${styles[feedback.status]}`} style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    backgroundColor: feedback.status === 'pending' ? '#ffc107' : 
                                   feedback.status === 'resolved' ? '#28a745' :
                                   feedback.status === 'solved' ? '#17a2b8' :
                                   feedback.status === 'escalated' ? '#dc3545' : '#6c757d',
                    color: feedback.status === 'pending' ? '#000' : '#fff'
                  }}>
                    {feedback.status}
                  </span>
                </div>
                <p className={styles.feedbackMessage} style={{
                  fontSize: '14px',
                  lineHeight: '1.6',
                  color: '#555',
                  marginBottom: '15px',
                  backgroundColor: '#f8f9fa',
                  padding: '15px',
                  borderRadius: '8px'
                }}>{feedback.message}</p>
                <div className={styles.feedbackMeta} style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '15px',
                  marginBottom: '15px',
                  fontSize: '13px',
                  color: '#666'
                }}>
                  <span><strong>From:</strong> {feedback.student?.name || 'Unknown'}</span>
                  <span><strong>Type:</strong> {feedback.type}</span>
                  <span><strong>Date:</strong> {new Date(feedback.createdAt).toLocaleDateString()}</span>
                  {feedback.student?.rollNo && <span><strong>Roll No:</strong> {feedback.student.rollNo}</span>}
                </div>
                {feedback.status === "pending" && (
                  <div className={styles.feedbackActions} style={{
                    display: 'flex',
                    gap: '10px',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => handleFeedbackAction(feedback._id, "solve")}
                      style={{
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      Solve
                    </button>
                    <button
                      onClick={() => handleFeedbackAction(feedback._id, "resolve")}
                      style={{
                        backgroundColor: '#17a2b8',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      Mark Resolved
                    </button>
                    <button
                      onClick={() => handleFeedbackAction(feedback._id, "forward")}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500'
                      }}
                    >
                      Pass to Admin
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
            <p>No feedback from club members yet.</p>
            <p style={{ fontSize: '14px', marginTop: '10px' }}>
              When students submit feedback to your club, it will appear here.
            </p>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2>Send Feedback to Admin</h2>
        <div className={styles.formContainer}>
          <form onSubmit={handleAdminFeedbackSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="type">Feedback Type *</label>
              <select
                id="type"
                name="type"
                value={adminFeedback.type}
                onChange={handleAdminFeedbackChange}
                required
                className={styles.formControl}
              >
                <option value="general">General Feedback</option>
                <option value="suggestion">Suggestion</option>
                <option value="issue">Issue Report</option>
                <option value="request">Feature Request</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="subject">Subject *</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={adminFeedback.subject}
                onChange={handleAdminFeedbackChange}
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
                value={adminFeedback.message}
                onChange={handleAdminFeedbackChange}
                required
                className={styles.formControl}
                rows="6"
                placeholder="Please provide detailed feedback..."
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="button"
                onClick={() => navigate("/coordinator/dashboard")}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className={styles.submitBtn}
              >
                {submitting ? "Sending..." : "Send to Admin"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default CoordinatorFeedback
