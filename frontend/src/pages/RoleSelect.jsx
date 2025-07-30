"use client"

import { useNavigate } from "react-router-dom"
import styles from "./Auth.module.css"

const RoleSelect = () => {
  const navigate = useNavigate()

  const handleRoleSelect = (role, action) => {
    if (action === "login") {
      navigate(`/login?role=${role}`)
    } else if (action === "signup") {
      navigate(`/signup?role=${role}`)
    }
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <h2>Select Your Role</h2>
          <p>Choose your role to continue</p>
        </div>
        <div className={styles.roleSelection}>
          <div className={styles.roleCard}>
            <h3>Student</h3>
            <p>Join clubs and participate in events</p>
            <div className={styles.roleActions}>
              <button onClick={() => handleRoleSelect("student", "login")} className={styles.roleBtn}>
                Login
              </button>
              <button onClick={() => handleRoleSelect("student", "signup")} className={styles.roleBtn}>
                Sign Up
              </button>
            </div>
          </div>
          <div className={styles.roleCard}>
            <h3>Coordinator</h3>
            <p>Manage your club and organize events</p>
            <div className={styles.roleActions}>
              <button onClick={() => handleRoleSelect("coordinator", "login")} className={styles.roleBtn}>
                Login
              </button>
              <button onClick={() => handleRoleSelect("coordinator", "signup")} className={styles.roleBtn}>
                Sign Up
              </button>
            </div>
          </div>
          <div className={styles.roleCard}>
            <h3>Admin</h3>
            <p>Manage the platform and all clubs</p>
            <div className={styles.roleActions}>
              <button onClick={() => handleRoleSelect("admin", "login")} className={styles.roleBtn}>
                Login
              </button>
              <button onClick={() => handleRoleSelect("admin", "signup")} className={styles.roleBtn}>
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RoleSelect 