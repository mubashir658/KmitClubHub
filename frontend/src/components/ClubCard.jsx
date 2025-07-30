import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import styles from "./ClubCard.module.css"

const ClubCard = ({ club }) => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleClubClick = (e) => {
    console.log('ClubCard clicked:', club.name, 'Authenticated:', isAuthenticated)
    if (!isAuthenticated) {
      e.preventDefault()
      console.log('Redirecting to login...')
      navigate("/login")
    } else {
      console.log('Navigating to club detail:', `/clubs/${club._id}`)
    }
  }

  console.log('Rendering ClubCard:', club.name, 'ID:', club._id)

  return (
    <div className={styles.clubCard}>
      <div className={styles.clubLogo}>
        <img src={club.logoUrl || "/placeholder.svg"} alt={club.name} />
      </div>

      <div className={styles.clubInfo}>
        <h3 className={styles.clubName}>{club.name}</h3>
        <p className={styles.clubDescription}>
          {club.description.length > 100 ? `${club.description.substring(0, 100)}...` : club.description}
        </p>

        <Link 
          to={`/clubs/${club._id}`} 
          className={styles.viewClubBtn}
          onClick={handleClubClick}
        >
          {isAuthenticated ? "View Club" : "Login to View"}
        </Link>
      </div>
    </div>
  )
}

export default ClubCard
