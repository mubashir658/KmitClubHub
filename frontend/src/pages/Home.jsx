"use client"

import { useEffect, useRef, useState } from "react"
import styles from "./Home.module.css"

const imageList = [
  "/assets/images/img1.webp",
  "/assets/images/img2.webp",
  "/assets/images/img3.jpg",
  "/assets/images/img4.webp",
  "/assets/images/img5.jpg",
]

const clubsData = [
  { name: "Aakarshan", logo: "/assets/club logos/Aakarshan-logo.jpg" },
  { name: "Aalap", logo: "/assets/club logos/Aalap-Logo.jpg" },
  { name: "Abhinaya", logo: "/assets/club logos/AbhinayaLogo.jpg" },
  { name: "Kaivalya", logo: "/assets/club logos/Kaivalya-Logo.jpeg" },
  { name: "Kmitra", logo: "/assets/club logos/Kmitra-Logo.jpg" },
  { name: "Kreeda", logo: "/assets/club logos/Kreeda-Logo.jpg" },
  { name: "Mudra", logo: "/assets/club logos/Mudra-Logo.jpg" },
  { name: "OC", logo: "/assets/club logos/OC-Logo.jpg" },
  { name: "PR", logo: "/assets/club logos/PR-Logo.jpg" },
  { name: "Recurse", logo: "/assets/club logos/Recurse-Logo.jpg" },
  { name: "TOL", logo: "/assets/club logos/TOL-Logo.png" },
  { name: "Vachan", logo: "/assets/club logos/Vachan-Logo.jpg" },
]

const Home = () => {
  // Slideshow logic
  const [current, setCurrent] = useState(0)
  const timeoutRef = useRef(null)

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
                <h3>12</h3>
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
          <h2>Clubs</h2>
          <div className={styles.clubsGrid}>
            {clubsData.map((club, idx) => (
              <div className={styles.clubCardSmall} key={idx}>
                <img src={club.logo} alt={club.name} className={styles.clubLogoSmall} />
                <div className={styles.clubName}>{club.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
