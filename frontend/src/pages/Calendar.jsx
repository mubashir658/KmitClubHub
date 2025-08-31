"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../context/AuthContext"
import axios from "axios"
import styles from "./Calendar.module.css"

const Calendar = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)

  useEffect(() => {
    fetchEvents()
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

  const handleEventRegister = async (eventId) => {
    try {
      await axios.post(`/api/events/${eventId}/register`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      alert("Successfully registered for event!")
      fetchEvents() // Refresh to show updated registration count
    } catch (error) {
      alert(error.response?.data?.message || "Failed to register for event")
    }
  }

  const handleEventUnregister = async (eventId) => {
    try {
      await axios.delete(`/api/events/${eventId}/register`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      alert("Successfully unregistered from event!")
      fetchEvents() // Refresh to show updated registration count
    } catch (error) {
      alert(error.response?.data?.message || "Failed to unregister from event")
    }
  }

  const isRegisteredForEvent = (event) => {
    return user && event.registeredStudents?.some(student => student._id === user.id)
  }

  const openEventModal = (event) => {
    setSelectedEvent(event)
    setShowEventModal(true)
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

  const getEventsForDay = (day) => {
    return events.filter(event => {
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
                
                return (
                  <div key={day} className={styles.day}>
                    <div className={styles.dayNumber}>{day}</div>
                    {dayEvents.map((event, index) => (
                      <div 
                        key={event._id} 
                        className={styles.eventDot} 
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
              {events
                .filter(event => new Date(event.date) >= new Date())
                .sort((a, b) => new Date(a.date) - new Date(b.date))
                .slice(0, 8)
                .map(event => (
                  <div key={event._id} className={styles.eventItem}>
                    <div className={styles.eventDate}>
                      {formatDate(event.date)}
                    </div>
                    <div className={styles.eventDetails}>
                      <h4 onClick={() => openEventModal(event)} className={styles.eventTitle}>
                        {event.title}
                      </h4>
                      <p className={styles.clubName}>{event.club?.name}</p>
                      <p className={styles.eventTime}>🕒 {event.time} | 📍 {event.venue}</p>
                      <div className={styles.eventActions}>
                        {user && user.role === "student" && (
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
                ))}
            </div>
          </div>
        </div>

        {/* Event Modal */}
        {showEventModal && selectedEvent && (
          <div className={styles.modalOverlay} onClick={closeEventModal}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>{selectedEvent.title}</h3>
                <button onClick={closeEventModal} className={styles.closeBtn}>×</button>
              </div>
              
              <div className={styles.modalContent}>
                <div className={styles.eventImage}>
                  {selectedEvent.imageUrl ? (
                    <img src={selectedEvent.imageUrl} alt={selectedEvent.title} />
                  ) : (
                    <div className={styles.placeholderImage}>📅</div>
                  )}
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

                  {user && user.role === "student" && (
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