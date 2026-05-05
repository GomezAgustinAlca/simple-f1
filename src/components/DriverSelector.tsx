"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { DriverStanding } from "@/types/f1"

interface DriverSelectorProps {
  drivers: DriverStanding[]
  placeholder?: string
  onSelect?: (driverId: string) => void
  navigateTo?: "driver" | "compare" | "none"
  selectedId?: string
}

export function DriverSelector({
  drivers,
  placeholder = "Buscar piloto...",
  onSelect,
  navigateTo = "driver",
  selectedId,
}: DriverSelectorProps) {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const displayDriver = selectedId
    ? (drivers.find((d) => d.driverId === selectedId) ?? null)
    : null

  const filtered =
    !displayDriver && query.length > 1
      ? drivers.filter((d) =>
          `${d.givenName} ${d.familyName} ${d.constructorName}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
      : []

  function handleSelect(driver: DriverStanding) {
    setQuery("")
    if (onSelect) onSelect(driver.driverId)
    if (navigateTo === "driver") router.push(`/drivers/${driver.driverId}`)
    if (navigateTo === "compare") router.push(`/compare?driverA=${driver.driverId}`)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (displayDriver && onSelect) onSelect("")
    setQuery(e.target.value)
  }

  function handleClear() {
    setQuery("")
    if (onSelect) onSelect("")
  }

  const inputValue = displayDriver
    ? `${displayDriver.givenName} ${displayDriver.familyName}`
    : query

  return (
    <div className="relative w-full max-w-md">
      <div className="flex items-center bg-white border border-gray-200 rounded-2xl shadow-sm px-4 py-3 gap-3">
        <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 outline-none text-gray-800 placeholder:text-gray-400 text-sm bg-transparent"
        />
        {displayDriver && (
          <button
            type="button"
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            aria-label="Limpiar selección"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {filtered.length > 0 && (
        <ul className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 overflow-hidden">
          {filtered.slice(0, 8).map((d) => (
            <li key={d.driverId}>
              <button
                type="button"
                onClick={() => handleSelect(d)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center justify-between"
              >
                <span className="font-medium text-gray-900 text-sm">
                  {d.givenName} {d.familyName}
                </span>
                <span className="text-xs text-gray-400">{d.constructorName}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
