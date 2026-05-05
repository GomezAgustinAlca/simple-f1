"use client"

import { useEffect, useState } from "react"

interface DriverAvatarProps {
  givenName: string
  familyName: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const sizeClasses = {
  sm: { wrapper: "w-8 h-8", text: "text-xs" },
  md: { wrapper: "w-12 h-12", text: "text-sm" },
  lg: { wrapper: "w-16 h-16", text: "text-base" },
  xl: { wrapper: "w-20 h-20", text: "text-xl" },
}

const FORMATS = ["jpg", "png", "webp"] as const

export function DriverAvatar({ givenName, familyName, size = "md", className = "" }: DriverAvatarProps) {
  const lastName = familyName.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  const [attempt, setAttempt] = useState(0)
  const { wrapper, text } = sizeClasses[size]
  const initials = `${givenName[0] ?? ""}${familyName[0] ?? ""}`.toUpperCase()

  useEffect(() => { setAttempt(0) }, [familyName])

  if (attempt >= FORMATS.length) {
    return (
      <div
        className={`${wrapper} rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 ring-2 ring-white ${className}`}
      >
        <span className={`${text} font-bold text-indigo-600`}>{initials}</span>
      </div>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/driver-images/${lastName}.${FORMATS[attempt]}`}
      alt={`${givenName} ${familyName}`}
      className={`${wrapper} rounded-full object-cover object-top flex-shrink-0 ring-2 ring-white bg-gray-100 ${className}`}
      onError={() => setAttempt(a => a + 1)}
    />
  )
}
