import { getPerformanceLevel, getTrend, getRecentPerformance } from "@/lib/performance"
import type { DriverPerformanceSummary, RaceResult } from "@/types/f1"

interface CompareTableProps {
  nameA: string
  nameB: string
  summaryA: DriverPerformanceSummary
  summaryB: DriverPerformanceSummary
  resultsA: RaceResult[]
  resultsB: RaceResult[]
}

function Cell({ value, better }: { value: string; better: boolean }) {
  return (
    <td
      className={`py-2.5 px-3 text-center font-semibold text-sm ${
        better ? "text-indigo-700 bg-indigo-50" : "text-gray-700"
      }`}
    >
      {value}
    </td>
  )
}

export function CompareTable({ nameA, nameB, summaryA, summaryB, resultsA, resultsB }: CompareTableProps) {
  const levelA = getPerformanceLevel(summaryA.seasonAveragePosition)
  const levelB = getPerformanceLevel(summaryB.seasonAveragePosition)
  const trendA = getTrend(resultsA)
  const trendB = getTrend(resultsB)
  const recentA = getRecentPerformance(summaryA.lastFiveAveragePosition, summaryA.racesCount)
  const recentB = getRecentPerformance(summaryB.lastFiveAveragePosition, summaryB.racesCount)

  const rows = [
    {
      label: "Puntos temporada",
      a: String(summaryA.totalPoints),
      b: String(summaryB.totalPoints),
      betterA: summaryA.totalPoints >= summaryB.totalPoints,
    },
    {
      label: "Nivel",
      a: levelA,
      b: levelB,
      betterA: (summaryA.seasonAveragePosition ?? 99) <= (summaryB.seasonAveragePosition ?? 99),
    },
    {
      label: "Tendencia",
      a: trendA,
      b: trendB,
      betterA: trendA === trendB ? true : trendA === "Mejora",
    },
    {
      label: "Rendimiento reciente",
      a: recentA,
      b: recentB,
      betterA: (summaryA.lastFiveAveragePosition ?? 99) <= (summaryB.lastFiveAveragePosition ?? 99),
    },
    {
      label: "Mejor resultado",
      a: summaryA.bestFinish != null ? `P${summaryA.bestFinish}` : "—",
      b: summaryB.bestFinish != null ? `P${summaryB.bestFinish}` : "—",
      betterA: (summaryA.bestFinish ?? 99) <= (summaryB.bestFinish ?? 99),
    },
    {
      label: "Carreras terminadas",
      a: String(summaryA.racesCount - summaryA.dnfs),
      b: String(summaryB.racesCount - summaryB.dnfs),
      betterA: summaryA.racesCount - summaryA.dnfs >= summaryB.racesCount - summaryB.dnfs,
    },
    {
      label: "DNFs",
      a: String(summaryA.dnfs),
      b: String(summaryB.dnfs),
      betterA: summaryA.dnfs <= summaryB.dnfs,
    },
  ]

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-3 px-3 text-left text-xs text-gray-400 uppercase tracking-wide font-medium">
                Estadística
              </th>
              <th className="py-3 px-3 text-center text-sm font-bold text-gray-900 bg-gray-50">
                {nameA}
              </th>
              <th className="py-3 px-3 text-center text-sm font-bold text-gray-900">
                {nameB}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="py-2.5 px-3 text-sm text-gray-600">{row.label}</td>
                <Cell value={row.a} better={row.betterA} />
                <Cell value={row.b} better={!row.betterA} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  )
}
