import { useState, useEffect } from 'react'
import styles from './Toast.module.css'

const Toast = ({ message, type = 'success', duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onClose(), 300) // Wait for animation to complete
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => onClose(), 300)
  }

  return (
    <div className={`${styles.toast} ${styles[type]} ${isVisible ? styles.show : styles.hide}`}>
      <div className={styles.toastContent}>
        <div className={styles.toastIcon}>
          {type === 'success' && '✅'}
          {type === 'error' && '❌'}
          {type === 'warning' && '⚠️'}
          {type === 'info' && 'ℹ️'}
        </div>
        <div className={styles.toastMessage}>{message}</div>
        <button className={styles.toastClose} onClick={handleClose}>
          ×
        </button>
      </div>
    </div>
  )
}

export default Toast
