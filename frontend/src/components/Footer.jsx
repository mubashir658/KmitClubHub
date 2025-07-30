import styles from "./Footer.module.css"

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h3>KMIT Club Hub</h3>
            <p>Connecting students through clubs and events at KMIT College.</p>
          </div>

          <div className={styles.footerSection}>
            <h4>Quick Links</h4>
            <ul>
              <li>
                <a href="/">Home</a>
              </li>
              <li>
                <a href="/clubs">Clubs</a>
              </li>
              <li>
                <a href="/events">Events</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
            </ul>
          </div>

          <div className={styles.footerSection}>
            <h4>Contact Info</h4>
            <p>KMIT College</p>
            <p>Hyderabad, Telangana</p>
            <p>Email: info@kmit.edu</p>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>&copy; 2024 KMIT Club Hub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
