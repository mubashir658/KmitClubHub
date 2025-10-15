import React from "react"
import ReactDOM from "react-dom/client"
import axios from "axios"
import App from "./App.jsx"
import "./index.css"

// Configure axios base URL for production deployments (e.g., Vercel)
// Uses Vite env var: VITE_API_BASE_URL (set in Vercel Project Settings)
if (import.meta.env && import.meta.env.VITE_API_BASE_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
