"use client"

import { useState } from "react"
import type { CircuitAdvantage } from "@/lib/performance"

function lastName(fullName: string) {
  return fullName.split(" ").pop() ?? fullName
}

function CircuitCard({
  adv,
  nameA,
  nameB,
}: {
  adv: CircuitAdvantage
  nameA: string
  nameB: string
}) {
  const [open, setOpen] = useState(false)
  const winsA = adv.races.filter((r) => r.posA < r.posB).length
  const winsB = adv.races.filter((r) => r.posB < r.posA).length
  const total = adv.races.length || 1
  const pctA = Math.round((winsA / total) * 100)
  const pctB = Math.round((winsB / total) * 100)
  const dominant = winsA > winsB ? lastName(nameA) : winsB > winsA ? lastName(nameB) : null
  const domText = dominant
    ? `Dominio: ${dominant} (${winsA}–${winsB})`
    : `Equilibrio (${winsA}–${winsB})`

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
      <p className="font-semibold text-gray-900 text-sm">{adv.circuit}</p>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-14 shrink-0 truncate">{lastName(nameA)}</span>
          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pctA}%` }} />
          </div>
          <span className="text-xs font-bold text-indigo-600 w-3 text-right shrink-0">{winsA}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 w-14 shrink-0 truncate">{lastName(nameB)}</span>
          <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-orange-400 rounded-full" style={{ width: `${pctB}%` }} />
          </div>
          <span className="text-xs font-bold text-orange-600 w-3 text-right shrink-0">{winsB}</span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-gray-500">{domText}</p>
        <button
          onClick={() => setOpen((v) => !v)}
          className="text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors flex items-center gap-0.5 shrink-0"
        >
          {open ? "Ocultar" : "Ver detalle"}
          <span className="text-gray-400 ml-0.5">{open ? "▲" : "▼"}</span>
        </button>
      </div>

      {open && (
        <div className="border-t border-gray-100 pt-3">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-400">
                <th className="text-left font-medium pb-1.5">Año</th>
                <th className="text-center font-medium pb-1.5">{lastName(nameA)}</th>
                <th className="text-center font-medium pb-1.5">{lastName(nameB)}</th>
              </tr>
            </thead>
            <tbody>
              {adv.races.map((race) => {
                const aBetter = race.posA < race.posB
                const bBetter = race.posB < race.posA
                return (
                  <tr key={race.year} className="text-gray-500">
                    <td className="py-0.5 text-gray-400">{race.year}</td>
                    <td className={`py-0.5 text-center ${aBetter ? "font-bold text-gray-900" : ""}`}>
                      P{race.posA}
                    </td>
                    <td className={`py-0.5 text-center ${bBetter ? "font-bold text-gray-900" : ""}`}>
                      P{race.posB}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

interface Props {
  advantages: CircuitAdvantage[]
  nameA: string
  nameB: string
  usedHistorical: boolean
}

export function CircuitAdvantageSection({ advantages, nameA, nameB, usedHistorical }: Props) {
  if (advantages.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <p className="text-sm text-gray-400">Sin datos suficientes para comparar por circuito.</p>
      </div>
    )
  }

  const counts = advantages.map((adv) => ({
    winsA: adv.races.filter((r) => r.posA < r.posB).length,
    winsB: adv.races.filter((r) => r.posB < r.posA).length,
  }))
  const domA = counts.filter((c) => c.winsA > c.winsB).length
  const domB = counts.filter((c) => c.winsB > c.winsA).length
  const eq = counts.filter((c) => c.winsA === c.winsB).length

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {domA > 0 && (
          <span className="bg-indigo-50 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            {lastName(nameA)} domina: {domA} {domA === 1 ? "circuito" : "circuitos"}
          </span>
        )}
        {domB > 0 && (
          <span className="bg-orange-50 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full">
            {lastName(nameB)} domina: {domB} {domB === 1 ? "circuito" : "circuitos"}
          </span>
        )}
        {eq > 0 && (
          <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-full">
            Equilibrio: {eq} {eq === 1 ? "circuito" : "circuitos"}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {advantages.map((adv) => (
          <CircuitCard key={adv.circuit} adv={adv} nameA={nameA} nameB={nameB} />
        ))}
      </div>

      {usedHistorical && (
        <p className="text-xs text-gray-400">Basado en histórico disponible</p>
      )}
    </div>
  )
}
