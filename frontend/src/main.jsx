import React from "react"
import ReactDOM from "react-dom/client"
import axios from "axios"
import App from "./App.jsx"
import "./index.css"

// Configure axios base URL for production deployments (e.g., Vercel)
// Uses Vite env var: VITE_API_BASE_URL (set in Vercel Project Settings)
if (import.meta.env) {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL
  if (configuredBaseUrl) {
    axios.defaults.baseURL = configuredBaseUrl
  } else if (import.meta.env.PROD) {
    // Fallback to Render backend URL in production if env var is missing
    axios.defaults.baseURL = "https://kmitclubhub.onrender.com"
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
