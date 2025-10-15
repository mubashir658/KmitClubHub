
import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import { useToast } from "../context/ToastContext"
import axios from "axios"
import styles from "./Calendar.module.css"

const Calendar = () => {
  const { user } = useAuth()
  const { showSuccess, showError } = useToast()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [viewType, setViewType] = useState('my') // 'all' | 'my' - default to 'my' for students
  const [lastEventCheck, setLastEventCheck] = useState(() => {
    const stored = localStorage.getItem('lastEventCheck')
    return stored || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Default to 24 hours ago
  })

  useEffect(() => {
    fetchEvents()
  }, [])

  // Mark events as seen after a delay when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      markEventsAsSeen()
    }, 5000) // Mark as seen after 5 seconds of viewing

    return () => clearTimeout(timer)
  }, [])

  const fetchEvents = async () => {
    try {
      const response = await axios.get("/api/events")
      setEvents(response.data)
    } catch (error) {
      console.error("Error fetching events:", error)
    } finally {
      setLoading(false)
    }
  }

  // Function to mark all events as seen (call this when user clicks on calendar or events)
  const markEventsAsSeen = () => {
    const now = new Date().toISOString()
    setLastEventCheck(now)
    localStorage.setItem('lastEventCheck', now)
  }

  // Debug function to reset notification system (for testing)
  const resetNotifications = () => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    setLastEventCheck(yesterday)
    localStorage.setItem('lastEventCheck', yesterday)
  }

  // Check if an event is new (created after last check)
  const isNewEvent = (event) => {
    if (!event.createdAt) return false
    const eventCreatedAt = new Date(event.createdAt)
    const lastCheck = new Date(lastEventCheck)
    return eventCreatedAt > lastCheck
  }

  const handleEventRegister = async (eventId) => {
    try {
      await axios.post(`/api/events/${eventId}/register`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      showSuccess("Successfully registered for event!")
      fetchEvents() // Refresh to show updated registration count
    } catch (error) {
      showError(error.response?.data?.message || "Failed to register for event")
    }
  }

  const handleEventUnregister = async (eventId) => {
    try {
      await axios.delete(`/api/events/${eventId}/register`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      showSuccess("Successfully unregistered from event!")
      fetchEvents() // Refresh to show updated registration count
    } catch (error) {
      showError(error.response?.data?.message || "Failed to unregister from event")
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
      return
    }

    try {
      const endpoint = user?.role === 'admin' ? `/api/events/admin/${eventId}` : `/api/events/${eventId}`
      await axios.delete(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      showSuccess("Event deleted successfully!")
      closeEventModal()
      fetchEvents() // Refresh to show updated events list
    } catch (error) {
      showError(error.response?.data?.message || "Failed to delete event")
    }
  }

  const isRegisteredForEvent = (event) => {
    return user && event.registeredStudents?.some(student => student._id === user.id)
  }

  // Check if student can register for this event
  const canRegisterForEvent = (event) => {
    if (user?.role !== 'student') return false
    if (event.isForAllClubs) {
      // For admin events, student must be a member of at least one club
      return user.joinedClubs && user.joinedClubs.length > 0
    }
    const userClubIds = user.joinedClubs?.map(club => club._id) || []
    return userClubIds.includes(event.club?._id)
  }

  const openEventModal = async (event) => {
    try {
      const response = await axios.get(`/api/events/${event._id}`)
      console.log('Event details from API:', response.data);
      console.log('Event imageUrl from API:', response.data.imageUrl);
      setSelectedEvent(response.data)
      setShowEventModal(true)
    } catch (error) {
      console.error('Error loading event details:', error)
      // Fallback to basic event if detailed fetch fails
      console.log('Using fallback event data:', event);
      console.log('Fallback event imageUrl:', event.imageUrl);
      setSelectedEvent(event)
      setShowEventModal(true)
    }
  }

  const closeEventModal = () => {
    setShowEventModal(false)
    setSelectedEvent(null)
  }

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay()
    
    return { daysInMonth, startingDay }
  }

  const getFilteredEvents = () => {
    if (viewType === 'my') {
      if (user?.role === 'student') {
        if (user?.joinedClubs?.length) {
          const myClubIds = user.joinedClubs.map(c => c._id)
          return events.filter(e => myClubIds.includes(e.club?._id || e.club) || e.isForAllClubs)
        } else {
          // If student hasn't joined any clubs, show only admin events for all clubs
          return events.filter(e => e.isForAllClubs)
        }
      }
      if (user?.role === 'coordinator' && user?.coordinatingClub) {
        return events.filter(e => String(e.club?._id || e.club) === String(user.coordinatingClub) || e.isForAllClubs)
      }
    }
    // For 'all' view, show ALL events (but registration will be restricted)
    return events
  }

  const getEventsForDay = (day) => {
    const source = getFilteredEvents()
    return source.filter(event => {
      const eventDate = new Date(event.date)
      return eventDate.getDate() === day && 
             eventDate.getMonth() === currentMonth.getMonth() &&
             eventDate.getFullYear() === currentMonth.getFullYear()
    })
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeString) => {
    return timeString
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  if (loading) {
    return <div className={styles.loading}>Loading calendar...</div>
  }

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth)
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className={styles.calendarPage}>
      <div className="container">
        <div className={styles.header}>
          <h1>Event Calendar</h1>
          <p>Stay updated with all upcoming events and activities</p>
          <div className={styles.headerActions}>
            <div className={styles.viewToggle}>
              <button 
                className={`${styles.toggleBtn} ${viewType === 'all' ? styles.active : ''}`}
                onClick={() => setViewType('all')}
              >
                All Clubs Calendar
              </button>
              <button 
                className={`${styles.toggleBtn} ${viewType === 'my' ? styles.active : ''}`}
                onClick={() => setViewType('my')}
                disabled={(user?.role === 'student' && !user?.joinedClubs?.length) || (user?.role === 'coordinator' && !user?.coordinatingClub)}
              >
                My Clubs Calendar
              </button>
            </div>
          </div>
        </div>

        <div className={styles.calendarContainer}>
          <div className={styles.calendarHeader}>
            <button onClick={prevMonth} className={styles.navButton}>
              ← Previous
            </button>
            <h2>{monthName}</h2>
            <button onClick={nextMonth} className={styles.navButton}>
              Next →
            </button>
          </div>

          <div className={styles.calendar}>
            <div className={styles.weekdays}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className={styles.weekday}>{day}</div>
              ))}
            </div>

            <div className={styles.days}>
              {Array.from({ length: startingDay }, (_, i) => (
                <div key={`empty-${i}`} className={styles.emptyDay}></div>
              ))}
              
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const dayEvents = getEventsForDay(day)
                const hasNewEvents = dayEvents.some(event => isNewEvent(event))
                
                return (
                  <div key={day} className={styles.day}>
                    <div className={`${styles.dayNumber} ${hasNewEvents ? styles.newEventDay : ''}`}>
                      {day}
                      {hasNewEvents && <span className={styles.newEventIndicator}>●</span>}
                    </div>
                    {dayEvents.map((event, index) => (
                      <div 
                        key={event._id} 
                        className={`${styles.eventDot} ${isNewEvent(event) ? styles.newEvent : ''}`}
                        title={event.title}
                        onClick={() => openEventModal(event)}
                      >
                        <span className={styles.eventTitle}>{event.title}</span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>

          <div className={styles.upcomingEvents}>
            <h3>Upcoming Events</h3>
            <div className={styles.eventsList}>
              {(() => {
                const filteredEvents = getFilteredEvents()
                const today = new Date()
                today.setHours(0, 0, 0, 0) // Reset time to start of day
                const upcomingEvents = filteredEvents
                  .filter(event => {
                    const eventDate = new Date(event.date)
                    eventDate.setHours(0, 0, 0, 0) // Reset time to start of day
                    // Show events from the current month onwards, or all admin events
                    const currentMonth = today.getMonth()
                    const currentYear = today.getFullYear()
                    const eventMonth = eventDate.getMonth()
                    const eventYear = eventDate.getFullYear()
                    
                    // Show if it's in the current month or future, OR if it's an admin event
                    return (eventYear > currentYear || (eventYear === currentYear && eventMonth >= currentMonth)) || event.isForAllClubs
                  })
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .slice(0, 8)
                return upcomingEvents.map(event => (
                  <div key={event._id} className={`${styles.eventItem} ${isNewEvent(event) ? styles.newEventItem : ''}`}>
                    <div className={styles.eventDate}>
                      {formatDate(event.date)}
                      {isNewEvent(event) && <span className={styles.newEventBadge}>NEW</span>}
                    </div>
                    {event.imageUrl && event.imageUrl.trim() !== '' && (
                      <div className={styles.eventThumb} onClick={() => openEventModal(event)}>
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          onError={(e) => { e.target.style.display = 'none' }}
                        />
                      </div>
                    )}
                    <div className={styles.eventDetails}>
                      <h4 onClick={() => openEventModal(event)} className={styles.eventTitle}>
                        {event.title}
                      </h4>
                      <p className={styles.clubName}>
                        {event.isForAllClubs ? '🏢 All Clubs Event' : event.club?.name}
                      </p>
                      <p className={styles.eventTime}>🕒 {event.time} | 📍 {event.venue}</p>
                      <div className={styles.eventActions}>
                        {user && user.role === "student" && canRegisterForEvent(event) && (
                          isRegisteredForEvent(event) ? (
                            <button
                              onClick={() => handleEventUnregister(event._id)}
                              className={styles.unregisterBtn}
                            >
                              Unregister
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEventRegister(event._id)}
                              className={styles.registerBtn}
                            >
                              Register
                            </button>
                          )
                        )}
                        <span className={styles.registrationCount}>
                          👥 {event.registeredStudents?.length || 0} registered
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>
        </div>

        {/* Event Modal */}
        {showEventModal && selectedEvent && (
          <div className={styles.modalOverlay} onClick={closeEventModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>{selectedEvent.title}</h3>
                <div className={styles.modalHeaderActions}>
                  {(user?.role === 'admin' || (user?.role === 'coordinator' && selectedEvent.status === 'pending' && selectedEvent.createdBy?._id === user.id)) && (
                    <button 
                      onClick={() => handleDeleteEvent(selectedEvent._id)}
                      className={styles.deleteBtn}
                      title="Delete Event"
                    >
                      🗑️
                    </button>
                  )}
                  <button onClick={closeEventModal} className={styles.closeBtn}>×</button>
                </div>
              </div>
              
              <div className={styles.modalContent}>
                <div className={styles.eventImage}>
                  {selectedEvent.imageUrl && selectedEvent.imageUrl.trim() !== '' ? (
                    <img 
                      src={selectedEvent.imageUrl} 
                      alt={selectedEvent.title}
                      onLoad={() => {
                        console.log('Image loaded successfully:', selectedEvent.imageUrl);
                      }}
                      onError={(e) => {
                        console.error('Image failed to load:', selectedEvent.imageUrl);
                        console.error('Image error details:', e);
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className={styles.placeholderImage}
                    style={{ display: (selectedEvent.imageUrl && selectedEvent.imageUrl.trim() !== '') ? 'none' : 'flex' }}
                  >
                    📅
                  </div>
                </div>
                
                <div className={styles.eventInfo}>
                  <p className={styles.eventDescription}>{selectedEvent.description}</p>
                  
                  <div className={styles.eventMeta}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>📅</span>
                      <span>{formatDate(selectedEvent.date)}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>🕒</span>
                      <span>{formatTime(selectedEvent.time)}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>📍</span>
                      <span>{selectedEvent.venue}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>🏢</span>
                      <span>{selectedEvent.club?.name}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaIcon}>👤</span>
                      <span>Created by {selectedEvent.createdBy?.name}</span>
                    </div>
                  </div>

                  {user && user.role === "student" && canRegisterForEvent(selectedEvent) && (
                    <div className={styles.registrationSection}>
                      <h4>Registration</h4>
                      {isRegisteredForEvent(selectedEvent) ? (
                        <div className={styles.registeredStatus}>
                          <span className={styles.registeredIcon}>✅</span>
                          <span>You are registered for this event</span>
                          <button
                            onClick={() => handleEventUnregister(selectedEvent._id)}
                            className={styles.unregisterBtn}
                          >
                            Unregister
                          </button>
                        </div>
                      ) : (
                        <div className={styles.notRegisteredStatus}>
                          <span className={styles.notRegisteredIcon}>📝</span>
                          <span>You are not registered for this event</span>
                          <button
                            onClick={() => handleEventRegister(selectedEvent._id)}
                            className={styles.registerBtn}
                          >
                            Register Now
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className={styles.registrationCount}>
                    <h4>Total Registrations: {selectedEvent.registeredStudents?.length || 0}</h4>
                  </div>

                  {selectedEvent.registeredStudents && selectedEvent.registeredStudents.length > 0 && (
                    <div className={styles.registeredStudentsList}>
                      <h4>Registered Students</h4>
                      <ul>
                        {selectedEvent.registeredStudents.map(s => (
                          <li key={s._id}>
                            {s.name} {s.rollNo ? `(${s.rollNo})` : ''}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Calendar 
