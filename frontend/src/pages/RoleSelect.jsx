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
          <h2>Select Your Role</h2>
          <p>Choose your role to continue to login</p>
        </div>
        <div className={styles.roleSelection}>
          <div className={styles.roleCard} onClick={() => handleRoleSelect("student")}> 
            <h3>Student</h3>
            <p>Login as a student to join clubs and events</p>
          </div>
          <div className={styles.roleCard} onClick={() => handleRoleSelect("coordinator")}> 
            <h3>Coordinator</h3>
            <p>Login as a club coordinator to manage your club</p>
          </div>
          <div className={styles.roleCard} onClick={() => handleRoleSelect("admin")}> 
            <h3>Admin</h3>
            <p>Login as an admin to manage the platform</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleSelect 