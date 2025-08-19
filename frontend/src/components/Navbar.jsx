"use client"

import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"
import styles from "./Navbar.module.css"

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  const getDashboardLink = () => {
    if (!user) return "/"

    switch (user.role) {
      case "student":
        return "/student/dashboard"
      case "coordinator":
        return "/coordinator/dashboard"
      case "admin":
        return "/admin/dashboard"
      default:
        return "/"
    }
  }

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <Link to="/" className={styles.logo}>
          <img src="/assets/logos/kmit-logo.png" alt="KMIT" className={styles.logoImg} />
          <span>KMIT CLUB HUB</span>
        </Link>

        <div className={styles.navLinks}>
          <Link to="/" className={styles.navLink}>
            Home
          </Link>
          
          <Link to="/images" className={styles.navLink}>
            Images
          </Link>
          
          <Link to="/calendar" className={styles.navLink}>
            Calendar
          </Link>

          {isAuthenticated ? (
            <>
              <Link to={getDashboardLink()} className={styles.navLink}>
                Dashboard
              </Link>
              <div className={styles.userMenu}>
                <span className={styles.userName}>Hi, {user.name}</span>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className={styles.navLink}>
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
