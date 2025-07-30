"use client"

import { useNavigate } from "react-router-dom"
import styles from "./Auth.module.css"

const RoleSelect = () => {
  const navigate = useNavigate()

  const handleRoleSelect = (role) => {
    navigate(`/login?role=${role}`)
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h2>Welcome to KMIT Club Hub</h2>
          <p>Select your role to continue</p>
        </div>
        
        <div className={styles.roleSelection}>
          <div className={styles.roleCard} onClick={() => handleRoleSelect("student")}>
            <div className={styles.roleIcon}>👨‍🎓</div>
            <h3>Student</h3>
            <p>Join clubs and participate in events</p>
          </div>
          
          <div className={styles.roleCard} onClick={() => handleRoleSelect("coordinator")}>
            <div className={styles.roleIcon}>👨‍💼</div>
            <h3>Coordinator</h3>
            <p>Manage your club and organize events</p>
          </div>
          
        </div>

        <div className={styles.authFooter}>
          <p>Choose your role to proceed to login</p>
        </div>
      </div>
    </div>
  )
}

export default RoleSelect 