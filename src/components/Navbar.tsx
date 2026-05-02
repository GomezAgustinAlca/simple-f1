"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { useState } from "react"

const links = [
  { href: "/", label: "Inicio" },
  { href: "/compare", label: "Comparar" },
  { href: "/rankings", label: "Rankings" },
  { href: "/premium", label: "Premium" },
]

export function Navbar() {
  const pathname = usePathname()
  const { isPremium, togglePremium } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="font-black text-gray-900 text-lg tracking-tight">
          Simple <span className="text-indigo-600">F1</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === l.href
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Dev toggle */}
          <button
            onClick={togglePremium}
            className={`hidden sm:flex text-xs px-2.5 py-1 rounded-full font-medium border transition-colors ${
              isPremium
                ? "bg-indigo-600 text-white border-indigo-600"
                : "text-gray-400 border-gray-200 hover:border-gray-300"
            }`}
            title="Toggle premium (dev)"
          >
            {isPremium ? "Premium" : "Free"}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="sm:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-gray-100 bg-white px-4 pb-4 pt-2 space-y-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                pathname === l.href
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <button
            onClick={() => { togglePremium(); setMenuOpen(false) }}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              isPremium
                ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                : "text-gray-500 border-gray-200"
            }`}
          >
            {isPremium ? "Modo Premium (activo)" : "Cambiar a Premium (dev)"}
          </button>
        </div>
      )}
    </nav>
  )
}
