
import { useEffect, useRef, useState } from "react"
import ClubCard from "../components/ClubCard"
import { useToast } from "../context/ToastContext"
import styles from "./Home.module.css"
import axios from "axios"

const imageList = [
  "/assets/images/img1.webp",
  "/assets/images/img2.webp",
  "/assets/images/img3.jpg",
  "/assets/images/img4.webp",
  "/assets/images/img5.jpg",
]

const Home = () => {
  const { showError } = useToast()
  // Slideshow logic
  const [current, setCurrent] = useState(0)
  const timeoutRef = useRef(null)
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ clubs: 0, members: 0, events: 0 })

  // Manual slide handlers
  const goToPrev = () => {
    setCurrent((prev) => (prev - 1 + imageList.length) % imageList.length)
  }
  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % imageList.length)
  }

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % imageList.length)
    }, 3000)
    return () => clearTimeout(timeoutRef.current)
  }, [current])

  // Fetch clubs and statistics from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clubsRes, statsRes] = await Promise.all([
          axios.get('/api/clubs'),
          axios.get('/api/clubs/statistics')
        ])

        setClubs(clubsRes.data)
        setStats(statsRes.data)
      } catch (error) {
        console.error('Failed to load home data:', error)
        // Set default stats to avoid UI errors
        setStats({ clubs: 0, members: 0, events: 0 })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className={styles.home}>
      {/* Slideshow Section */}
      <section className={styles.sliderSection}>
        <div className={styles.sliderWrapper}>
          <button className={styles.sliderArrow + ' ' + styles.left} onClick={goToPrev} aria-label="Previous image">&#8592;</button>
          {imageList.map((src, idx) => (
            <img
              key={idx}
              src={src}
              alt={`College Event ${idx + 1}`}
              className={
                idx === current
                  ? styles.sliderImage + ' ' + styles.active
                  : styles.sliderImage
              }
              style={{ display: idx === current ? 'block' : 'none' }}
            />
          ))}
          <button className={styles.sliderArrow + ' ' + styles.right} onClick={goToNext} aria-label="Next image">&#8594;</button>
        </div>
      </section>

      {/* About KMIT */}
      <section className={styles.aboutSection}>
        <div className="container">
          <div className={styles.aboutContent}>
            <div className={styles.aboutText}>
              <h2>About KMIT</h2>
              <p>
                Keshav Memorial Institute of Technology (KMIT) is a premier engineering institution committed to
                excellence in technical education. Our vibrant campus hosts numerous clubs and organizations that
                provide students with opportunities to explore their interests, develop leadership skills, and build
                lasting friendships.
              </p>
              <ul>
                <li>Technical Clubs for skill development</li>
                <li>Cultural Clubs for artistic expression</li>
                <li>Sports Clubs for physical fitness</li>
                <li>Social Service Clubs for community impact</li>
              </ul>
            </div>
            <div className={styles.aboutStats}>
              <div className={styles.stat}>
                <h3>{stats.clubs}</h3>
                <p>Active Clubs</p>
              </div>
              <div className={styles.stat}>
                <h3>{stats.members}</h3>
                <p>Active Members</p>
              </div>
              <div className={styles.stat}>
                <h3>{stats.events}</h3>
                <p>Events This Year</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clubs Section */}
      <section className={styles.clubsSection}>
        <div className="container">
          <h2>Clubs</h2>
          {loading ? (
            <div className={styles.loading}>Loading clubs...</div>
          ) : (
            <div className={styles.clubsGrid}>
              {clubs.map((club) => (
                <ClubCard key={club._id} club={club} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* FAQ Section */}
      <section className={styles.faqSection}>
        <div className="container">
          <h2 className={styles.faqHeader}>Frequently Asked Questions</h2>
          <div className={styles.faqContainer}>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>Can I join multiple clubs at once?</summary>
              <div className={styles.faqAnswer}>Yes, students are welcome to join multiple clubs based on their interests and manage them from their Student Dashboard.</div>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>Are there any membership fees for clubs?</summary>
              <div className={styles.faqAnswer}>No, all clubs at KMIT are completely free to join.</div>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>How do I register for an upcoming event?</summary>
              <div className={styles.faqAnswer}>Once approved by the club coordinator, you can register for events from the Events section or Calendar page on your dashboard.</div>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>Can I leave a club if I no longer wish to participate?</summary>
              <div className={styles.faqAnswer}>Yes, you can leave a club at any time directly from your Student Dashboard.</div>
            </details>
            <details className={styles.faqItem}>
              <summary className={styles.faqQuestion}>How will I receive updates about club activities?</summary>
              <div className={styles.faqAnswer}>Notifications about event registrations, club join approvals, and new announcements will automatically appear in your dashboard.</div>
            </details>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
