"use client"

import { useEffect, useRef, useState } from "react"
import ClubCard from "../components/ClubCard"
import styles from "./Home.module.css"

const imageList = [
  "/assets/images/img1.webp",
  "/assets/images/img2.webp",
  "/assets/images/img3.jpg",
  "/assets/images/img4.webp",
  "/assets/images/img5.jpg",
]

const clubsData = [
  { 
    _id: "64a1b2c3d4e5f67890123456",
    name: "Aalap - The Music Club", 
    logoUrl: "/assets/club logos/Aalap-Logo.jpg",
    description: "The first club formed in KMIT, AALAP – The Music Club of KMIT visions in exploring the various new aspects of music, as the tagline says #EXPLORE YOURSELF."
  },
  { 
    _id: "64a1b2c3d4e5f67890123457",
    name: "Aakarshan", 
    logoUrl: "/assets/club logos/Aakarshan-logo.jpg",
    description: "Aakarshan club focuses on technical innovation and skill development."
  },
  { 
    _id: "64a1b2c3d4e5f67890123458",
    name: "Abhinaya", 
    logoUrl: "/assets/club logos/AbhinayaLogo.jpg",
    description: "Abhinaya is the cultural club that promotes arts and cultural activities."
  },
  { 
    _id: "64a1b2c3d4e5f67890123459",
    name: "Kaivalya", 
    logoUrl: "/assets/club logos/Kaivalya-Logo.jpeg",
    description: "Kaivalya club focuses on spiritual and wellness activities."
  },
  { 
    _id: "64a1b2c3d4e5f67890123460",
    name: "Kmitra", 
    logoUrl: "/assets/club logos/Kmitra-Logo.jpg",
    description: "Kmitra is the social service club dedicated to community welfare."
  },
  { 
    _id: "64a1b2c3d4e5f67890123461",
    name: "Kreeda", 
    logoUrl: "/assets/club logos/Kreeda-Logo.jpg",
    description: "Kreeda is the sports club promoting physical fitness and sportsmanship."
  },
  { 
    _id: "64a1b2c3d4e5f67890123462",
    name: "Mudra", 
    logoUrl: "/assets/club logos/Mudra-Logo.jpg",
    description: "Mudra is the dance club celebrating the art of movement."
  },
  { 
    _id: "64a1b2c3d4e5f67890123463",
    name: "OC", 
    logoUrl: "/assets/club logos/OC-Logo.jpg",
    description: "OC is the organizing committee responsible for major events."
  },
  { 
    _id: "64a1b2c3d4e5f67890123464",
    name: "PR", 
    logoUrl: "/assets/club logos/PR-Logo.jpg",
    description: "PR is the public relations club managing communications and outreach."
  },
  { 
    _id: "64a1b2c3d4e5f67890123465",
    name: "Recurse", 
    logoUrl: "/assets/club logos/Recurse-Logo.jpg",
    description: "Recurse is the programming and coding club for tech enthusiasts."
  },
  { 
    _id: "64a1b2c3d4e5f67890123466",
    name: "TOL", 
    logoUrl: "/assets/club logos/TOL-Logo.png",
    description: "TOL is the technical club focusing on engineering projects."
  },
  { 
    _id: "64a1b2c3d4e5f67890123467",
    name: "Vachan", 
    logoUrl: "/assets/club logos/Vachan-Logo.jpg",
    description: "Vachan is the literary club promoting reading and writing skills."
  },
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
            {clubsData.map((club) => (
              <ClubCard key={club._id} club={club} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
