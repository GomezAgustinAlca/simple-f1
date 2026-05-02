"use client"

import { createContext, useContext, useEffect, useState } from "react"

interface AuthContextValue {
  isPremium: boolean
  togglePremium: () => void
}

const AuthContext = createContext<AuthContextValue>({
  isPremium: false,
  togglePremium: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isPremium, setIsPremium] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem("racepulse_premium")
    if (stored === "true") setIsPremium(true)
  }, [])

  const togglePremium = () => {
    setIsPremium((prev) => {
      const next = !prev
      localStorage.setItem("racepulse_premium", String(next))
      return next
    })
  }

  return (
    <AuthContext.Provider value={{ isPremium, togglePremium }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
