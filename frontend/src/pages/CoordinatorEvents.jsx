"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./Dashboard.module.css"

const CoordinatorEvents = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    venue: "",
    imageUrl: ""
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await axios.get("/api/events/coordinator/my-events", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      setEvents(response.data)
    } catch (error) {
      console.error("Error fetching events:", error)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await axios.post("/api/events", formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      alert("Event created successfully! Waiting for admin approval.")
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        venue: "",
        imageUrl: ""
      })
      setShowForm(false)
      fetchEvents()
    } catch (error) {
      alert(error.response?.data?.message || "Failed to create event")
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return

    try {
      await axios.delete(`/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      alert("Event deleted successfully!")
      fetchEvents()
    } catch (error) {
      alert(error.response?.data?.message || "Failed to delete event")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#ffc107'
      case 'approved': return '#28a745'
      case 'rejected': return '#dc3545'
      default: return '#6c757d'
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className={styles.dashboardHome}>
      <div className={styles.welcomeSection}>
        <h1>Event Management</h1>
        <p>Create and manage events for your club</p>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>My Club Events</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            className={styles.createBtn}
          >
            {showForm ? "Cancel" : "Create New Event"}
          </button>
        </div>

        {showForm && (
          <div className={styles.formContainer}>
            <h3>Create New Event</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="title">Event Title *</label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    className={styles.formControl}
                    placeholder="Enter event title"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="venue">Venue *</label>
                  <input
                    type="text"
                    id="venue"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    required
                    className={styles.formControl}
                    placeholder="Enter venue"
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="date">Date *</label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className={styles.formControl}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="time">Time *</label>
                  <input
                    type="time"
                    id="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    required
                    className={styles.formControl}
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="description">Description *</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className={styles.formControl}
                  rows="4"
                  placeholder="Describe your event..."
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="imageUrl">Event Image URL (Optional)</label>
                <input
                  type="url"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className={styles.formControl}
                  placeholder="Enter image URL"
                />
              </div>

              <div className={styles.formActions}>
                <button
                  type="submit"
                  disabled={submitting}
                  className={styles.submitBtn}
                >
                  {submitting ? "Creating..." : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        )}

        {events.length > 0 ? (
          <div className={styles.eventsList}>
            {events.map((event) => (
              <div key={event._id} className={styles.eventItem}>
                <div className={styles.eventInfo}>
                  <div className={styles.eventHeader}>
                    <h4>{event.title}</h4>
                    <span
                      className={styles.status}
                      style={{ backgroundColor: getStatusColor(event.status) }}
                    >
                      {event.status.charAt(0).toUpperCase() + event.status.slice(1)}
                    </span>
                  </div>
                  <p>{event.description}</p>
                  <div className={styles.eventMeta}>
                    <span>📅 {new Date(event.date).toLocaleDateString()}</span>
                    <span>🕒 {event.time}</span>
                    <span>📍 {event.venue}</span>
                    <span>👥 {event.registeredStudents?.length || 0} registered</span>
                  </div>
                </div>
                <div className={styles.eventActions}>
                  {event.status === "pending" && (
                    <>
                      <button
                        onClick={() => navigate(`/coordinator/events/edit/${event._id}`)}
                        className={styles.editBtn}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(event._id)}
                        className={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {event.status === "approved" && (
                    <span className={styles.approvedNote}>✅ Event approved and live!</span>
                  )}
                  {event.status === "rejected" && (
                    <span className={styles.rejectedNote}>❌ Event was rejected</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No events created yet. Create your first event above!</p>
        )}
      </div>
    </div>
  )
}

export default CoordinatorEvents

