"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import styles from "./Calendar.module.css"

const Calendar = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())

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
                      <div key={event._id} className={styles.eventDot} title={event.title}>
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
                .slice(0, 5)
                .map(event => (
                  <div key={event._id} className={styles.eventItem}>
                    <div className={styles.eventDate}>
                      {formatDate(event.date)}
                    </div>
                    <div className={styles.eventDetails}>
                      <h4>{event.title}</h4>
                      <p>{event.club?.name}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendar 