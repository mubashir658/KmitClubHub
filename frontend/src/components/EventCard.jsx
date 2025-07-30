"use client"

import { useAuth } from "../context/AuthContext"
import styles from "./EventCard.module.css"

const EventCard = ({ event, onRegister }) => {
  const { user } = useAuth()

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const isRegistered = event.registeredStudents?.includes(user?.id)

  return (
    <div className={styles.eventCard}>
      {event.imageUrl && (
        <div className={styles.eventImage}>
          <img src={event.imageUrl || "/placeholder.svg"} alt={event.title} />
        </div>
      )}

      <div className={styles.eventInfo}>
        <div className={styles.eventHeader}>
          <h3 className={styles.eventTitle}>{event.title}</h3>
          <div className={styles.clubInfo}>
            <img src={event.club?.logoUrl || "/placeholder.svg"} alt={event.club?.name} />
            <span>{event.club?.name}</span>
          </div>
        </div>

        <p className={styles.eventDescription}>{event.description}</p>

        <div className={styles.eventDetails}>
          <div className={styles.eventDate}>
            <strong>Date:</strong> {formatDate(event.date)}
          </div>
          <div className={styles.eventTime}>
            <strong>Time:</strong> {event.time}
          </div>
          <div className={styles.eventVenue}>
            <strong>Venue:</strong> {event.venue}
          </div>
        </div>

        {user?.role === "student" && (
          <div className={styles.eventActions}>
            {isRegistered ? (
              <button className={`${styles.registerBtn} ${styles.registered}`} disabled>
                Registered ✓
              </button>
            ) : (
              <button className={styles.registerBtn} onClick={() => onRegister(event._id)}>
                Register
              </button>
            )}
          </div>
        )}

        <div className={styles.registrationCount}>{event.registeredStudents?.length || 0} students registered</div>
      </div>
    </div>
  )
}

export default EventCard
