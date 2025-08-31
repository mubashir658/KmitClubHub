"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./Dashboard.module.css"

const AdminEvents = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pendingEvents, setPendingEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState({})

  useEffect(() => {
    fetchPendingEvents()
  }, [])

  const fetchPendingEvents = async () => {
    try {
      const response = await axios.get("/api/events/admin/pending", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      setPendingEvents(response.data)
    } catch (error) {
      console.error("Error fetching pending events:", error)
      setPendingEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleEventAction = async (eventId, action) => {
    setProcessing(prev => ({ ...prev, [eventId]: true }))

    try {
      await axios.put(`/api/events/${eventId}/approve`, { action }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      
      alert(`Event ${action}d successfully!`)
      fetchPendingEvents() // Refresh the list
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${action} event`)
    } finally {
      setProcessing(prev => ({ ...prev, [eventId]: false }))
    }
  }

  const getEventDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return <div className="loading">Loading pending events...</div>
  }

  return (
    <div className={styles.dashboardHome}>
      <div className={styles.welcomeSection}>
        <h1>Event Approval Management</h1>
        <p>Review and approve/reject event requests from coordinators</p>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Pending Event Approvals</h2>
          <div className={styles.statsInfo}>
            <span className={styles.pendingCount}>
              {pendingEvents.length} event{pendingEvents.length !== 1 ? 's' : ''} pending
            </span>
          </div>
        </div>

        {pendingEvents.length > 0 ? (
          <div className={styles.eventsList}>
            {pendingEvents.map((event) => (
              <div key={event._id} className={styles.eventItem}>
                <div className={styles.eventInfo}>
                  <div className={styles.eventHeader}>
                    <h4>{event.title}</h4>
                    <span className={styles.status} style={{ backgroundColor: '#ffc107' }}>
                      Pending Approval
                    </span>
                  </div>
                  
                  <p className={styles.eventDescription}>{event.description}</p>
                  
                  <div className={styles.eventMeta}>
                    <div className={styles.metaRow}>
                      <span>📅 <strong>Date:</strong> {getEventDate(event.date)}</span>
                      <span>🕒 <strong>Time:</strong> {event.time}</span>
                    </div>
                    <div className={styles.metaRow}>
                      <span>📍 <strong>Venue:</strong> {event.venue}</span>
                      <span>🏢 <strong>Club:</strong> {event.club?.name}</span>
                    </div>
                    <div className={styles.metaRow}>
                      <span>👤 <strong>Created by:</strong> {event.createdBy?.name}</span>
                      <span>📅 <strong>Requested:</strong> {new Date(event.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {event.imageUrl && (
                    <div className={styles.eventImage}>
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className={styles.eventActions}>
                  <button
                    onClick={() => handleEventAction(event._id, "approve")}
                    disabled={processing[event._id]}
                    className={styles.approveBtn}
                  >
                    {processing[event._id] ? "Processing..." : "✅ Approve Event"}
                  </button>
                  
                  <button
                    onClick={() => handleEventAction(event._id, "reject")}
                    disabled={processing[event._id]}
                    className={styles.rejectBtn}
                  >
                    {processing[event._id] ? "Processing..." : "❌ Reject Event"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎉</div>
            <h3>No Pending Events</h3>
            <p>All event requests have been processed. Great job keeping up!</p>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <h2>Approval Guidelines</h2>
        <div className={styles.guidelines}>
          <div className={styles.guidelineItem}>
            <h4>✅ Approve events that:</h4>
            <ul>
              <li>Are appropriate for the club's purpose</li>
              <li>Have clear descriptions and logistics</li>
              <li>Don't conflict with existing events</li>
              <li>Follow institutional policies</li>
            </ul>
          </div>
          
          <div className={styles.guidelineItem}>
            <h4>❌ Reject events that:</h4>
            <ul>
              <li>Violate institutional policies</li>
              <li>Have incomplete information</li>
              <li>May cause conflicts or safety issues</li>
              <li>Are inappropriate for the academic environment</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminEvents

