"use client"

import { useEffect, useRef, useState } from "react"
import ClubCard from "../components/ClubCard"
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

  // Fetch clubs from backend
  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/clubs')
        setClubs(response.data)
        setStats(prev => ({ ...prev, clubs: response.data.length }))
      } catch (error) {
        console.error('Error fetching clubs:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchClubs()
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
    </div>
  )
}

export default Home
