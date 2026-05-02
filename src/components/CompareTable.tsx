import { SummaryBadge } from "@/components/SummaryBadge"
import { TrendArrow } from "@/components/TrendArrow"
import type { DriverPerformanceSummary } from "@/types/f1"

interface CompareTableProps {
  nameA: string
  nameB: string
  summaryA: DriverPerformanceSummary
  summaryB: DriverPerformanceSummary
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

export function CompareTable({ nameA, nameB, summaryA, summaryB }: CompareTableProps) {
  const rows = [
    {
      label: "Puntos temporada",
      a: String(summaryA.totalPoints),
      b: String(summaryB.totalPoints),
      betterA: summaryA.totalPoints >= summaryB.totalPoints,
    },
    {
      label: "Promedio últ. 5",
      a: summaryA.lastFiveAveragePosition?.toFixed(1) ?? "—",
      b: summaryB.lastFiveAveragePosition?.toFixed(1) ?? "—",
      betterA:
        (summaryA.lastFiveAveragePosition ?? 99) <=
        (summaryB.lastFiveAveragePosition ?? 99),
    },
    {
      label: "Promedio temporada",
      a: summaryA.seasonAveragePosition?.toFixed(1) ?? "—",
      b: summaryB.seasonAveragePosition?.toFixed(1) ?? "—",
      betterA:
        (summaryA.seasonAveragePosition ?? 99) <=
        (summaryB.seasonAveragePosition ?? 99),
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
      betterA:
        summaryA.racesCount - summaryA.dnfs >= summaryB.racesCount - summaryB.dnfs,
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
          <tr className="border-t border-gray-100">
            <td className="py-4 px-4 text-sm text-gray-600">Tendencia</td>
            <td className="py-4 px-4 text-center">
              <TrendArrow trend={summaryA.trend} size="sm" />
            </td>
            <td className="py-4 px-4 text-center">
              <TrendArrow trend={summaryB.trend} size="sm" />
            </td>
          </tr>
          <tr>
            <td className="py-4 px-4 text-sm text-gray-600">Estado</td>
            <td className="py-4 px-4 text-center">
              <SummaryBadge label={summaryA.statusLabel} />
            </td>
            <td className="py-4 px-4 text-center">
              <SummaryBadge label={summaryB.statusLabel} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
