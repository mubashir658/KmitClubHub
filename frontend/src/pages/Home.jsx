"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import ClubCard from "../components/ClubCard"
import styles from "./Home.module.css"

const Home = () => {
  const [clubs, setClubs] = useState([])
  const [recentEvents, setRecentEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [clubsResponse, eventsResponse] = await Promise.all([axios.get("/api/clubs"), axios.get("/api/events")])

      setClubs(clubsResponse.data)
      setRecentEvents(eventsResponse.data.slice(0, 6)) // Get recent 6 events
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <h1>Welcome to KMIT Club Hub</h1>
            <p>
              Discover, join, and participate in various clubs and events at Keshav Memorial Institute of Technology.
              Connect with like-minded students and enhance your college experience.
            </p>
            <div className={styles.heroButtons}>
              <Link to="/login" className={styles.ctaButton}>
                Get Started
              </Link>
              <Link to="/images" className={styles.secondaryButton}>
                View Gallery
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <img src="/assets/logos/kmit-logo.png" alt="KMIT College" />
          </div>
        </div>
      </section>

      {/* Recent Events Scroll */}
      <section className={styles.recentEvents}>
        <div className="container">
          <h2>Recent Events</h2>
          <div className={styles.eventsScroll}>
            {recentEvents.map((event) => (
              <div key={event._id} className={styles.eventImage}>
                <img
                  src={event.imageUrl || "/placeholder.svg?height=200&width=300&query=college event"}
                  alt={event.title}
                />
                <div className={styles.eventOverlay}>
                  <h4>{event.title}</h4>
                  <p>{event.club?.name}</p>
                </div>
              </div>
            ))}
          </div>
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
                <h3>{clubs.length}</h3>
                <p>Active Clubs</p>
              </div>
              <div className={styles.stat}>
                <h3>500+</h3>
                <p>Active Members</p>
              </div>
              <div className={styles.stat}>
                <h3>50+</h3>
                <p>Events This Year</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Clubs Section */}
      <section className={styles.clubsSection}>
        <div className="container">
          <h2>Our Clubs</h2>
          <div className={styles.clubsGrid}>
            {clubs.map((club) => (
              <ClubCard key={club._id} club={club} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
