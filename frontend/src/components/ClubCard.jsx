import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import styles from "./ClubCard.module.css"

const ClubCard = ({ club }) => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleClubClick = (e) => {
    if (!isAuthenticated) {
      e.preventDefault()
      navigate("/login")
    }
  }

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

        <div className={styles.clubStats}>
          <span className={styles.memberCount}>{club.members?.length || 0} Members</span>
          <span className={styles.coordinator}>Coordinator: {club.coordinator?.name}</span>
        </div>

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
