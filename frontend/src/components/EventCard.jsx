
import { useAuth } from "../context/AuthContext"
import styles from "./EventCard.module.css"

const EventCard = ({ event, onRegister }) => {
  const { user } = useAuth()
  
  
  // Check if this is a new event
  const isNewEvent = () => {
    if (!event.createdAt) return false
    const lastCheck = localStorage.getItem('lastEventCheck')
    if (!lastCheck) {
      // If no last check, consider events from last 24 hours as new
      const eventCreatedAt = new Date(event.createdAt)
      const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
      return eventCreatedAt > dayAgo
    }
    const eventCreatedAt = new Date(event.createdAt)
    const lastCheckDate = new Date(lastCheck)
    return eventCreatedAt > lastCheckDate
  }

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
  
  // Check if student can register for this event
  const canRegister = () => {
    if (user?.role !== 'student') return false
    const userClubIds = user.joinedClubs?.map(club => club._id) || []
    
    // If user hasn't joined any clubs, they can't register for any events
    if (userClubIds.length === 0) return false
    
    if (event.isForAllClubs) return true // Admin events for all clubs
    return userClubIds.includes(event.club?._id)
  }

  return (
    <div className={`${styles.eventCard} ${isNewEvent() ? styles.newEventCard : ''}`}>
      <div className={styles.eventImage}>
        {event.imageUrl && event.imageUrl.trim() !== '' ? (
          <img 
            src={event.imageUrl} 
            alt={event.title}
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
        ) : null}
        <div 
          className={styles.placeholderImage}
          style={{ display: (event.imageUrl && event.imageUrl.trim() !== '') ? 'none' : 'flex' }}
        >
          📅
        </div>
      </div>

      <div className={styles.eventInfo}>
        <div className={styles.eventHeader}>
          <h3 className={styles.eventTitle}>
            {event.title}
            {isNewEvent() && <span className={styles.newEventBadge}>NEW</span>}
          </h3>
          <div className={styles.clubInfo}>
            {event.isForAllClubs ? (
              <div className={styles.allClubsInfo}>
                <span>🏢 All Clubs Event</span>
              </div>
            ) : (
              <>
                <img src={event.club?.logoUrl || "/placeholder.svg"} alt={event.club?.name} />
                <span>{event.club?.name}</span>
              </>
            )}
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

        {user?.role === "student" && canRegister() && (
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
