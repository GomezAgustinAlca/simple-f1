"use client"

import { useEffect, useState } from "react"
import { getDriverImage } from "@/utils/getDriverImage"

interface DriverAvatarProps {
  givenName: string
  familyName: string
  driverId?: string
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

export function DriverAvatar({ givenName, familyName, driverId, size = "md", className = "" }: DriverAvatarProps) {
  const mappedSrc = driverId ? getDriverImage(driverId) : null
  const lastName = (familyName ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
  const [attempt, setAttempt] = useState(0)
  const [mappedError, setMappedError] = useState(false)
  const { wrapper, text } = sizeClasses[size]
  const initials = `${givenName[0] ?? ""}${familyName[0] ?? ""}`.toUpperCase()

  useEffect(() => { setAttempt(0); setMappedError(false) }, [familyName, driverId])

  const showInitials = mappedSrc ? mappedError : attempt >= FORMATS.length

  if (showInitials) {
    return (
      <div
        className={`${wrapper} rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 ring-2 ring-white ${className}`}
      >
        <span className={`${text} font-bold text-indigo-600`}>{initials}</span>
      </div>
    )
  }

  if (mappedSrc) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={mappedSrc}
        alt={`${givenName} ${familyName}`}
        className={`${wrapper} rounded-full object-cover object-top flex-shrink-0 ring-2 ring-white bg-gray-100 ${className}`}
        onError={() => setMappedError(true)}
      />
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
