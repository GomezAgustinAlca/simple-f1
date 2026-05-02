"use client"

import { useEffect } from "react"

interface PremiumModalProps {
  onClose: () => void
}

const benefits = [
  "Sin publicidad",
  "Histórico completo de temporadas",
  "Comparador avanzado entre pilotos",
  "Sección Off-Season con noticias",
  "Rankings detallados con filtros",
]

export function PremiumModal({ onClose }: PremiumModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    document.addEventListener("keydown", handleKey)
    return () => document.removeEventListener("keydown", handleKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-black text-gray-900">
            Accedé a Simple F1 Premium
          </h2>
        </div>

        <ul className="space-y-3 mb-6">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex items-center gap-3 text-sm text-gray-700">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs font-bold">
                ✓
              </span>
              {benefit}
            </li>
          ))}
        </ul>

        <div className="text-center mb-6">
          <span className="text-3xl font-black text-gray-900">$2.99</span>
          <span className="text-gray-500 text-sm"> USD/mes</span>
        </div>

        <div className="space-y-3">
          <button className="w-full py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold transition-colors">
            Suscribirme ahora
          </button>
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-medium transition-colors"
          >
            Continuar gratis
          </button>
        </div>
      </div>
    </div>
  )
}
