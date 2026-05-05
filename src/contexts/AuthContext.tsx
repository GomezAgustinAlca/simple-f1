"use client"

import { createContext, useContext } from "react"

interface AuthContextValue {
  isPremium: boolean
}

const AuthContext = createContext<AuthContextValue>({
  isPremium: true,
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <AuthContext.Provider value={{ isPremium: true }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
