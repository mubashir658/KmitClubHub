"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import styles from "./Images.module.css"

const Images = () => {
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchImages()
  }, [])

  const fetchImages = async () => {
    try {
      // Fetch events with images
      const response = await axios.get("/api/events")
      const eventsWithImages = response.data.filter(event => event.imageUrl)
      setImages(eventsWithImages)
    } catch (error) {
      console.error("Error fetching images:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className={styles.loading}>Loading images...</div>
  }

  return (
    <div className={styles.imagesPage}>
      <div className="container">
        <div className={styles.header}>
          <h1>Gallery</h1>
          <p>Explore photos from our events and activities</p>
        </div>

        {images.length === 0 ? (
          <div className={styles.noImages}>
            <h3>No images available</h3>
            <p>Check back later for event photos!</p>
          </div>
        ) : (
          <div className={styles.imageGrid}>
            {images.map((event) => (
              <div key={event._id} className={styles.imageCard}>
                <img 
                  src={event.imageUrl || "/placeholder.svg"} 
                  alt={event.title}
                  className={styles.eventImage}
                />
                <div className={styles.imageInfo}>
                  <h3>{event.title}</h3>
                  <p>{event.club?.name}</p>
                  <span className={styles.date}>
                    {new Date(event.date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Images 