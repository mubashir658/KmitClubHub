import { useEffect, useState } from "react"
import styles from "./Images.module.css"

const sampleEvents = [
  {
    url: "https://drive.google.com/drive/folders/1GfBkywWVIzd-9Qyvyy9FS6Lq26-qJDXc",
    eventName: "Navras 2025",
    date: "2025-09-27",
    image: "/eventpics/nav1.jpg"
  },
  {
    url: "https://drive.google.com/drive/folders/1QrqsGpRQQVsxhQNG5Yvoy7AqhJodnv5u",
    eventName: "Saanjh 2025",
    date: "2025-04-11",
    image: "/eventpics/10.jpg"
  },
  {
    url: "https://drive.google.com/drive/folders/1xHgSxi02FYV7LgRxzU4Q8m43pC9pRUgW",
    eventName: "Patang Utsav 2025",
    date: "2025-01-22",
    image: "/eventpics/pat1.jpg"
  },
  {
    url: "https://drive.google.com/drive/folders/1t0AFF1suM-SYTFVx7dnJ-DpHMMBzVtLR",
    eventName: "Navras 2024",
    date: "2024-10-13",
    image: "/eventpics/nav2.jpg"
  },
  {
    url: "https://drive.google.com/drive/folders/1yzhP7K1DO4v-Kz5J62iwg9P_X4n4mYg0",
    eventName: "Nexus 2024",
    date: "2024-04-10",
    image: "/eventpics/9.jpg"
  },
  {
    url: "https://drive.google.com/drive/folders/1ejAl45ycpUECPsgJXYBYBo198XE9liv_",
    eventName: "Patang Utsav 2024",
    date: "2024-01-13",
    image: "/eventpics/pat2.jpg"
  },
  {
    url: "https://drive.google.com/drive/folders/1yvT54JRKg26ndQ27hkgBXbbYPpRzVPh0",
    eventName: "Navras 2023",
    date: "2023-10-29",
    image: "/eventpics/nav3.jpg"
  },
  {
    url: "https://drive.google.com/drive/folders/1RZMP1VoKl23LdfZ1z0RfTNbL9OZ7c2B8",
    eventName: "Patang Utsav 2023",
    date: "2023-01-17",
    image: "/eventpics/pat3.jpg"
  }
]

const sampleImages = [
  "/eventpics/2.jpg",
  "/eventpics/12.jpg",
  "/eventpics/7.jpg",
  "/eventpics/13.jpg",
  "/eventpics/1.jpg",
  "/eventpics/14.jpg",
  "/eventpics/11.jpg",
  "/eventpics/6.jpg",
  "/eventpics/5.jpg"
]

const Images = () => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setEvents(sampleEvents)
    setLoading(false)
  }, [])

  if (loading) {
    return <div className={styles.loading}>Loading images...</div>
  }

  return (
    <div className={styles.imagesPage}>
      <div className="container">

        <div className={styles.header}>
          <h1>Gallery</h1>
        </div>

        {/* Display sample images above the cards */}
        <section className={styles.sampleImagesSection}>
          <div className={styles.sampleImagesGrid}>
            {sampleImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Sample ${idx + 1}`}
                className={styles.sampleImage}
              />
            ))}
          </div>
        </section>

        <div className={styles.header}>
          <p>Explore event folders by clicking below</p>
        </div>

        {/* Event Cards Grid */}
        <section className={styles.imageGrid}>
          {events.map((event, idx) => (
            <div
              key={event.url + idx}
              className={styles.imageCard}
              style={{ cursor: "pointer" }}
              onClick={() => window.open(event.url, "_blank")}
            >
              {/* Display event image above the card info */}
              <img
                src={event.image || "/placeholder_event.jpg"}
                alt={event.eventName}
                className={styles.eventImage}
              />
              <div className={styles.imageInfo}>
                <h3>{event.eventName}</h3>
                <p>{new Date(event.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}

export default Images