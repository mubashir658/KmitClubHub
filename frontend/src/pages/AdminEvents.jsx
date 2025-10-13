
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import axios from "axios"
import styles from "./Dashboard.module.css"

const AdminEvents = () => {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const navigate = useNavigate()
  const [pendingEvents, setPendingEvents] = useState([])
  const [allClubsEvents, setAllClubsEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState({})
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createFormData, setCreateFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    venue: '',
    imageUrl: ''
  })
  const [imageError, setImageError] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [pendingRes, allClubsRes] = await Promise.all([
        axios.get("/api/events/admin/pending", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        }),
        axios.get("/api/events/admin/all-clubs-events", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        })
      ])
      setPendingEvents(pendingRes.data)
      setAllClubsEvents(allClubsRes.data)
    } catch (error) {
      console.error("Error fetching events:", error)
      setPendingEvents([])
      setAllClubsEvents([])
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
      
      showSuccess(`Event ${action}d successfully!`)
      fetchData() // Refresh the list
    } catch (error) {
      showError(error.response?.data?.message || `Failed to ${action} event`)
    } finally {
      setProcessing(prev => ({ ...prev, [eventId]: false }))
    }
  }

  const handleCreateEventForAllClubs = async (e) => {
    e.preventDefault()
    setProcessing(prev => ({ ...prev, create: true }))

    try {
      await axios.post("/api/events/admin/create-for-all-clubs", createFormData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      
      showSuccess("Event created successfully for all clubs!")
      setShowCreateForm(false)
      setCreateFormData({
        title: '',
        description: '',
        date: '',
        time: '',
        venue: '',
        imageUrl: ''
      })
      setImageError("")
      fetchData() // Refresh the list
    } catch (error) {
      showError(error.response?.data?.message || "Failed to create event")
    } finally {
      setProcessing(prev => ({ ...prev, create: false }))
    }
  }

  const handleToggleEventStatus = async (eventId, action) => {
    setProcessing(prev => ({ ...prev, [eventId]: true }))

    try {
      await axios.put(`/api/events/admin/${eventId}/toggle-status`, { action }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      
      showSuccess(`Event ${action}d successfully!`)
      fetchData() // Refresh the list
    } catch (error) {
      showError(error.response?.data?.message || `Failed to ${action} event`)
    } finally {
      setProcessing(prev => ({ ...prev, [eventId]: false }))
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return
    }

    setProcessing(prev => ({ ...prev, [eventId]: true }))

    try {
      await axios.delete(`/api/events/admin/${eventId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      
      showSuccess("Event deleted successfully!")
      fetchData() // Refresh the list
    } catch (error) {
      showError(error.response?.data?.message || "Failed to delete event")
    } finally {
      setProcessing(prev => ({ ...prev, [eventId]: false }))
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
        setCreateFormData(prev => ({
          ...prev,
          imageUrl: base64String // This will be the base64 string
        }))
      }
      reader.readAsDataURL(file)
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
        <h1>Event Management</h1>
        <p>Review coordinator events and create events for all clubs</p>
      </div>

      {/* Create Event for All Clubs Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Create Event for All Clubs</h2>
          <button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className={styles.createBtn}
          >
            {showCreateForm ? 'Cancel' : '+ Create New Event'}
          </button>
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateEventForAllClubs} className={styles.createForm}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Event Title *</label>
                <input
                  type="text"
                  value={createFormData.title}
                  onChange={(e) => setCreateFormData({...createFormData, title: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Date *</label>
                <input
                  type="date"
                  value={createFormData.date}
                  onChange={(e) => setCreateFormData({...createFormData, date: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>Time *</label>
                <input
                  type="time"
                  value={createFormData.time}
                  onChange={(e) => setCreateFormData({...createFormData, time: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Venue *</label>
                <input
                  type="text"
                  value={createFormData.venue}
                  onChange={(e) => setCreateFormData({...createFormData, venue: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Description *</label>
              <textarea
                value={createFormData.description}
                onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                rows="4"
                required
              />
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
              {createFormData.imageUrl && (
                <div className={styles.imagePreview}>
                  <img 
                    src={createFormData.imageUrl} 
                    alt="Event preview" 
                    style={{ 
                      width: '150px', 
                      height: '150px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      marginTop: '10px'
                    }}
                  />
                  <div style={{ marginTop: '10px' }}>
                    <small>Image preview</small>
                    <button 
                      type="button" 
                      onClick={() => setCreateFormData(prev => ({ ...prev, imageUrl: '' }))}
                      className={styles.removePhotoButton}
                      style={{
                        marginLeft: '10px',
                        padding: '5px 10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.formActions}>
              <button 
                type="submit" 
                disabled={processing.create}
                className={styles.submitBtn}
              >
                {processing.create ? "Creating..." : "Create Event for All Clubs"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Admin Created Events for All Clubs */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Events for All Clubs</h2>
          <div className={styles.statsInfo}>
            <span className={styles.pendingCount}>
              {allClubsEvents.length} event{allClubsEvents.length !== 1 ? 's' : ''} created
            </span>
          </div>
        </div>

        {allClubsEvents.length > 0 ? (
          <div className={styles.eventsList}>
            {allClubsEvents.map((event) => (
              <div key={event._id} className={styles.eventItem}>
                <div className={styles.eventInfo}>
                  <div className={styles.eventHeader}>
                    <h4>{event.title}</h4>
                    <span 
                      className={styles.status} 
                      style={{ 
                        backgroundColor: event.status === 'approved' ? '#28a745' : '#dc3545' 
                      }}
                    >
                      {event.status === 'approved' ? 'Active' : 'Inactive'}
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
                      <span>🏢 <strong>Scope:</strong> All Clubs</span>
                    </div>
                    <div className={styles.metaRow}>
                      <span>👤 <strong>Created by:</strong> {event.createdBy?.name}</span>
                      <span>📅 <strong>Created:</strong> {new Date(event.createdAt).toLocaleDateString()}</span>
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
                  <div className={styles.actionButtons}>
                    {event.status === 'approved' ? (
                      <button
                        onClick={() => handleToggleEventStatus(event._id, "deactivate")}
                        disabled={processing[event._id]}
                        className={styles.deactivateBtn}
                      >
                        {processing[event._id] ? "Processing..." : "🔴 Deactivate Event"}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleToggleEventStatus(event._id, "activate")}
                        disabled={processing[event._id]}
                        className={styles.activateBtn}
                      >
                        {processing[event._id] ? "Processing..." : "🟢 Activate Event"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      disabled={processing[event._id]}
                      className={styles.deleteBtn}
                      title="Delete Event"
                    >
                      🗑️ Delete Event
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🎯</div>
            <h3>No Events Created Yet</h3>
            <p>Create your first event for all clubs using the form above.</p>
          </div>
        )}
      </div>

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Coordinator Event Approvals</h2>
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

