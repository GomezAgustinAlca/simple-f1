import { getPerformanceLevel, getTrend, getRecentPerformance } from "@/lib/performance"
import type { DriverPerformanceSummary, RaceResult } from "@/types/f1"

interface CompareTableProps {
  nameA: string
  nameB: string
  summaryA: DriverPerformanceSummary
  summaryB: DriverPerformanceSummary
  resultsA: RaceResult[]
  resultsB: RaceResult[]
  isPremium: boolean
}

function Cell({ value, better }: { value: string; better: boolean }) {
  return (
    <td
      className={`py-4 px-4 text-center font-semibold text-sm ${
        better ? "text-indigo-700 bg-indigo-50" : "text-gray-700"
      }`}
    >
      {value}
    </td>
  )
}

export function CompareTable({ nameA, nameB, summaryA, summaryB, resultsA, resultsB, isPremium }: CompareTableProps) {
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

  const aWins = rows.filter((r) => r.betterA).length
  const bWins = rows.length - aWins
  const advantageName = aWins > bWins ? nameA : bWins > aWins ? nameB : null
  const winnerSummary = aWins > bWins ? summaryA : bWins > aWins ? summaryB : null

  const conclusionTitle = advantageName ? `${advantageName} está mejor` : "Están equilibrados"
  const conclusionMotivo = winnerSummary ? winnerSummary.summaryText : `${nameA} y ${nameB} muestran un nivel similar esta temporada.`

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-4 px-4 text-left text-xs text-gray-400 uppercase tracking-wide font-medium">
                Estadística
              </th>
              <th className="py-4 px-4 text-center text-sm font-bold text-gray-900 bg-gray-50">
                {nameA}
              </th>
              <th className="py-4 px-4 text-center text-sm font-bold text-gray-900">
                {nameB}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="py-4 px-4 text-sm text-gray-600">{row.label}</td>
                <Cell value={row.a} better={row.betterA} />
                <Cell value={row.b} better={!row.betterA} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Premium conclusion */}
      {isPremium ? (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
          <p className="text-sm font-semibold text-indigo-700 mb-1">{conclusionTitle}</p>
          <p className="text-gray-600 text-sm">Motivo: {conclusionMotivo}</p>
        </div>
      ) : (
        <a
          href="https://simplef1.lemonsqueezy.com/checkout/buy/a17d801a-9e92-4da7-9e2b-e314c6d30906"
          target="_blank"
          rel="noopener noreferrer"
          className="relative block cursor-pointer group"
        >
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 select-none pointer-events-none">
            <p className="text-sm font-semibold text-indigo-700 mb-1 blur-sm">{conclusionTitle}</p>
            <p className="text-gray-600 text-sm blur-sm">Motivo: {conclusionMotivo}</p>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl">
            <span className="text-indigo-700 text-xs font-semibold text-center px-4">
              Desbloqueá para ver quién está mejor y por qué
            </span>
            <span className="bg-indigo-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-sm group-hover:bg-indigo-700 transition-colors">
              Ver análisis completo →
            </span>
          </div>
        </a>
      )}
    </div>
  )
}
