"use client"

import { useEffect, useRef } from "react"
import { useAuth } from "@/contexts/AuthContext"

declare global {
  interface Window {
    adsbygoogle: Record<string, unknown>[]
  }
}

interface Props {
  slot: string
  className?: string
}

export function AdBanner({ slot, className = "" }: Props) {
  const { isPremium } = useAuth()
  const pushed = useRef(false)

  useEffect(() => {
    if (isPremium || pushed.current) return
    pushed.current = true
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {
      // AdSense not loaded yet — no-op
    }
  }, [isPremium])

  if (isPremium) return null

  return (
    <div className={`w-full overflow-hidden ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-3566646588692281"
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  )
}
