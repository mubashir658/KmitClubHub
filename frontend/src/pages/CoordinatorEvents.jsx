
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import axios from "axios"
import styles from "./Dashboard.module.css"

const CoordinatorEvents = () => {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
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
  const [imageError, setImageError] = useState("")
  const [submitError, setSubmitError] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [editingEvent, setEditingEvent] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    // Test backend connectivity
    testBackendConnection()
    fetchEvents()
  }, [])

  const testBackendConnection = async () => {
    try {
      const response = await axios.get('/api/health')
    } catch (error) {
      showError('Backend connection failed')
    }
  }

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

  const validateForm = () => {
    const errors = {}
    
    if (!formData.title.trim()) {
      errors.title = "Event title is required"
    } else if (formData.title.trim().length < 3) {
      errors.title = "Event title must be at least 3 characters long"
    }
    
    if (!formData.description.trim()) {
      errors.description = "Event description is required"
    } else if (formData.description.trim().length < 10) {
      errors.description = "Event description must be at least 10 characters long"
    }
    
    if (!formData.date) {
      errors.date = "Event date is required"
    } else {
      const eventDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (eventDate < today) {
        errors.date = "Event date cannot be in the past"
      }
    }
    
    if (!formData.time) {
      errors.time = "Event time is required"
    }
    
    if (!formData.venue.trim()) {
      errors.venue = "Event venue is required"
    } else if (formData.venue.trim().length < 2) {
      errors.venue = "Event venue must be at least 2 characters long"
    }
    
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSubmitError("")
    setFieldErrors({})
    setImageError("")

    // Validate form
    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors)
      setSubmitting(false)
      return
    }

    try {
      if (isEditing && editingEvent) {
        // Update existing event
        const response = await axios.put(`/api/events/${editingEvent._id}`, formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        showSuccess(response.data?.message || "Event updated successfully! Waiting for admin approval.")
      } else {
        // Create new event
        await axios.post("/api/events", formData, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
        showSuccess("Event created successfully! Waiting for admin approval.")
      }
      
      // Success - reset form and show success message
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        venue: "",
        imageUrl: ""
      })
      setImageError("")
      setSubmitError("")
      setFieldErrors({})
      setEditingEvent(null)
      setIsEditing(false)
      setShowForm(false)
      fetchEvents()
      
    } catch (error) {
      console.error('Event creation error:', error)
      
      let errorMessage = "Failed to create event"
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status
        const data = error.response.data
        
        switch (status) {
          case 400:
            if (data.message) {
              errorMessage = data.message
            } else if (data.errors) {
              // Handle validation errors from server
              const serverErrors = {}
              data.errors.forEach(err => {
                serverErrors[err.field || err.path] = err.message
              })
              setFieldErrors(serverErrors)
              errorMessage = "Please fix the validation errors below"
            } else {
              errorMessage = "Invalid data provided. Please check all fields."
            }
            break
          case 401:
            errorMessage = "You are not authorized to create events. Please log in again."
            break
          case 403:
            errorMessage = "You don't have permission to create events for this club."
            break
          case 404:
            errorMessage = "Club not found. Please contact administrator."
            break
          case 413:
            errorMessage = "Image file is too large. Please use an image smaller than 2MB."
            break
          case 500:
            errorMessage = "Server error occurred. Please try again later or contact support."
            break
          default:
            errorMessage = data.message || `Server error (${status}). Please try again.`
        }
      } else if (error.request) {
        // Network error
        errorMessage = "Network error. Please check your internet connection and try again."
      } else {
        // Other error
        errorMessage = "An unexpected error occurred. Please try again."
      }
      
      setSubmitError(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
    
    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError('')
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setImageError('Please select a valid image file')
        return
      }
      
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setImageError('Image size should be less than 2MB')
        return
      }
      
      // Clear any previous errors
      setImageError('')
      
      // Convert image to base64 for storage
      const reader = new FileReader()
      reader.onload = (event) => {
        const base64String = event.target.result
        setFormData(prev => ({
          ...prev,
          imageUrl: base64String // This will be the base64 string
        }))
      }
      reader.readAsDataURL(file)
    }
  }


  const handleEdit = (event) => {
    setEditingEvent(event)
    setIsEditing(true)
    
    // Handle date formatting properly
    let formattedDate = ""
    if (event.date) {
      const eventDate = new Date(event.date)
      formattedDate = eventDate.toISOString().split('T')[0] // Convert to YYYY-MM-DD format
    }
    
    const formDataToSet = {
      title: event.title || "",
      description: event.description || "",
      date: formattedDate,
      time: event.time || "",
      venue: event.venue || "",
      imageUrl: event.imageUrl || ""
    }
    
    setFormData(formDataToSet)
    setShowForm(true)
    setSubmitError("")
    setFieldErrors({})
    setImageError("")
    
    // Scroll to form
    setTimeout(() => {
      const formElement = document.querySelector(`.${styles.formContainer}`)
      if (formElement) {
        formElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  const handleCancelEdit = () => {
    setEditingEvent(null)
    setIsEditing(false)
    setFormData({
      title: "",
      description: "",
      date: "",
      time: "",
      venue: "",
      imageUrl: ""
    })
    setShowForm(false)
    setSubmitError("")
    setFieldErrors({})
    setImageError("")
  }

  // activate functionality removed per requirements

  const handleDeactivate = async (eventId) => {
    if (!window.confirm("Deactivate this approved event?")) return
    try {
      const response = await axios.put(`/api/events/${eventId}/deactivate`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      showSuccess("Event deactivated successfully!")
      fetchEvents()
    } catch (error) {
      showError(error.response?.data?.message || "Failed to deactivate event")
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return
    }

    try {
      await axios.delete(`/api/events/${eventId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      showSuccess("Event deleted successfully!")
      fetchEvents() // Refresh the list
    } catch (error) {
      showError(error.response?.data?.message || "Failed to delete event")
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
            onClick={() => {
              if (showForm) {
                handleCancelEdit()
              } else {
                setShowForm(true)
              }
            }}
            className={styles.createBtn}
          >
            {showForm ? "Cancel" : "Create New Event"}
          </button>
        </div>

        {showForm && (
          <div className={styles.formContainer}>
            <h3>{isEditing ? "Edit Event" : "Create New Event"}</h3>
            
            {submitError && (
              <div className={styles.errorMessage} style={{ 
                backgroundColor: '#f8d7da', 
                color: '#721c24', 
                padding: '12px', 
                borderRadius: '4px', 
                marginBottom: '20px',
                border: '1px solid #f5c6cb'
              }}>
                <strong>Error:</strong> {submitError}
              </div>
            )}
            
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
                    className={`${styles.formControl} ${fieldErrors.title ? styles.errorInput : ''}`}
                    placeholder="Enter event title"
                  />
                  {fieldErrors.title && (
                    <div className={styles.fieldError}>{fieldErrors.title}</div>
                  )}
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
                    className={`${styles.formControl} ${fieldErrors.venue ? styles.errorInput : ''}`}
                    placeholder="Enter venue"
                  />
                  {fieldErrors.venue && (
                    <div className={styles.fieldError}>{fieldErrors.venue}</div>
                  )}
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
                    className={`${styles.formControl} ${fieldErrors.date ? styles.errorInput : ''}`}
                  />
                  {fieldErrors.date && (
                    <div className={styles.fieldError}>{fieldErrors.date}</div>
                  )}
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
                    className={`${styles.formControl} ${fieldErrors.time ? styles.errorInput : ''}`}
                  />
                  {fieldErrors.time && (
                    <div className={styles.fieldError}>{fieldErrors.time}</div>
                  )}
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
                  className={`${styles.formControl} ${fieldErrors.description ? styles.errorInput : ''}`}
                  rows="4"
                  placeholder="Describe your event..."
                />
                {fieldErrors.description && (
                  <div className={styles.fieldError}>{fieldErrors.description}</div>
                )}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="eventImage">Event Image (Optional)</label>
                <input
                  type="file"
                  id="eventImage"
                  name="eventImage"
                  onChange={handleFileChange}
                  accept="image/*"
                  className={styles.formControl}
                />
                <small>Select an image file (max 2MB)</small>
                {imageError && <div className={styles.errorMessage}>{imageError}</div>}
                {formData.imageUrl && (
                  <div className={styles.imagePreview}>
                    <img 
                      src={formData.imageUrl} 
                      alt="Event preview" 
                      style={{ 
                        width: '150px', 
                        height: '150px', 
                        objectFit: 'cover', 
                        borderRadius: '8px', 
                        marginTop: '10px',
                        border: '2px solid #ddd'
                      }} 
                    />
                    <div style={{ marginTop: '10px' }}>
                      <small>Image preview</small>
                      <button 
                        type="button" 
                        onClick={() => setFormData(prev => ({ ...prev, imageUrl: '' }))}
                        className={styles.removePhotoButton}
                        style={{
                          marginLeft: '10px',
                          padding: '5px 10px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove Image
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.formActions}>
                <button
                  type="submit"
                  disabled={submitting}
                  className={styles.submitBtn}
                >
                  {submitting ? (isEditing ? "Updating..." : "Creating...") : (isEditing ? "Update Event" : "Create Event")}
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
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => handleEdit(event)}
                        className={styles.editBtn}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className={styles.deleteBtn}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️ Delete
                      </button>
                      <span className={styles.pendingNote}>⏳ Waiting for admin approval</span>
                    </div>
                  )}
                  {(event.status === "approved") && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className={styles.approvedNote}>✅ Event approved and live!</span>
                      <button 
                        onClick={() => handleDeactivate(event._id)} 
                        className={styles.deactivateBtn}
                        style={{
                          backgroundColor: '#ffc107',
                          color: '#000',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Deactivate
                      </button>
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className={styles.deleteBtn}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  )}
                  {(event.status === "rejected") && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className={styles.rejectedNote}>❌ Event was rejected</span>
                      <button
                        onClick={() => handleDeleteEvent(event._id)}
                        className={styles.deleteBtn}
                        style={{
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
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

