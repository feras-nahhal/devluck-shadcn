import axios from "axios"
import { tokenStorage } from "./auth/token"


const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

/* ---------------- REQUEST INTERCEPTOR ---------------- */

api.interceptors.request.use(
  (config) => {
    const token = tokenStorage.get()

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

/* ---------------- RESPONSE INTERCEPTOR ---------------- */

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    if (status === 401) {
      tokenStorage.remove()

      if (typeof window !== "undefined") {
        window.location.href = "/auth"
      }
    }

    return Promise.reject(error)
  }
)