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

const NO_DATA_VALUES = new Set(["Sin datos", "Muestra limitada", "Incierto", "—"])

function Cell({ value, winner }: { value: string; winner: boolean }) {
  return (
    <td
      className={`py-2.5 px-3 text-center font-semibold text-sm ${
        winner ? "text-blue-700 bg-blue-50" : "text-gray-700"
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

  const posA = summaryA.lastFiveAveragePosition ?? 99
  const posB = summaryB.lastFiveAveragePosition ?? 99
  const bestA = summaryA.bestFinish ?? 99
  const bestB = summaryB.bestFinish ?? 99
  const finishedA = summaryA.racesCount - summaryA.dnfs
  const finishedB = summaryB.racesCount - summaryB.dnfs

  const rows = [
    {
      label: "Puntos temporada",
      a: String(summaryA.totalPoints),
      b: String(summaryB.totalPoints),
      winnerA: summaryA.totalPoints > summaryB.totalPoints,
      winnerB: summaryB.totalPoints > summaryA.totalPoints,
    },
    {
      label: "Rendimiento reciente",
      a: recentA,
      b: recentB,
      winnerA: posA < posB,
      winnerB: posB < posA,
    },
    {
      label: "Mejor resultado",
      a: summaryA.bestFinish != null ? `P${summaryA.bestFinish}` : "—",
      b: summaryB.bestFinish != null ? `P${summaryB.bestFinish}` : "—",
      winnerA: bestA < bestB,
      winnerB: bestB < bestA,
    },
    {
      label: "Nivel",
      a: levelA,
      b: levelB,
      winnerA: (summaryA.seasonAveragePosition ?? 99) < (summaryB.seasonAveragePosition ?? 99),
      winnerB: (summaryB.seasonAveragePosition ?? 99) < (summaryA.seasonAveragePosition ?? 99),
    },
    {
      label: "Tendencia",
      a: trendA,
      b: trendB,
      winnerA: trendA !== trendB && trendA === "Mejora",
      winnerB: trendA !== trendB && trendB === "Mejora",
    },
    {
      label: "Carreras terminadas",
      a: String(finishedA),
      b: String(finishedB),
      winnerA: finishedA > finishedB,
      winnerB: finishedB > finishedA,
    },
    {
      label: "Abandonos",
      a: String(summaryA.dnfs),
      b: String(summaryB.dnfs),
      winnerA: summaryA.dnfs < summaryB.dnfs,
      winnerB: summaryB.dnfs < summaryA.dnfs,
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
          {rows.map((row) => {
            const bothNoData = NO_DATA_VALUES.has(row.a) && NO_DATA_VALUES.has(row.b)
            return (
              <tr key={row.label}>
                <td className="py-2.5 px-3 text-sm text-gray-600">{row.label}</td>
                {bothNoData ? (
                  <td colSpan={2} className="py-2.5 px-3 text-center text-sm text-gray-400 italic">
                    Datos insuficientes
                  </td>
                ) : (
                  <>
                    <Cell value={row.a} winner={row.winnerA} />
                    <Cell value={row.b} winner={row.winnerB} />
                  </>
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
