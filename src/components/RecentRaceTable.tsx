import { formatDate, formatPosition, translateStatus } from "@/lib/format"
import { isDNF } from "@/lib/performance"
import { getRaceRowLabel } from "@/lib/summaries"
import type { RaceResult } from "@/types/f1"

interface RecentRaceTableProps {
  results: RaceResult[]
}

export function RecentRaceTable({ results }: RecentRaceTableProps) {
  const slice = results

  if (slice.length === 0) {
    return <p className="text-gray-400 text-sm">Sin carreras disponibles.</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
            <th className="pb-3 pr-4 font-medium">GP</th>
            <th className="pb-3 pr-4 font-medium">Fecha</th>
            <th className="pb-3 pr-4 font-medium">Salida</th>
            <th className="pb-3 pr-4 font-medium">Llegada</th>
            <th className="pb-3 pr-4 font-medium">Pts</th>
            <th className="pb-3 pr-4 font-medium">Estado</th>
            <th className="pb-3 font-medium">Vs anterior</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {slice.map((r, i) => {
            const dnf = isDNF(r.status)
            const prev = slice[i - 1]
            const label = getRaceRowLabel(r.position, prev?.position)
            return (
              <tr key={`${r.round}-${r.raceName}`} className="hover:bg-gray-50 transition-colors">
                <td className="py-3 pr-4 font-medium text-gray-900 whitespace-nowrap">
                  {r.raceName.replace(" Grand Prix", "").replace(" Grande Prêmio", "").replace(" Gran Premio", "")}
                </td>
                <td className="py-3 pr-4 text-gray-500 whitespace-nowrap">
                  {formatDate(r.date)}
                </td>
                <td className="py-3 pr-4 text-gray-700">
                  {r.grid != null ? formatPosition(r.grid) : "—"}
                </td>
                <td className="py-3 pr-4 font-semibold text-gray-900">
                  {dnf ? (
                    <span className="text-red-500">DNF</span>
                  ) : (
                    formatPosition(r.position)
                  )}
                </td>
                <td className="py-3 pr-4 text-gray-700">{r.points}</td>
                <td className="py-3 pr-4">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      dnf
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {translateStatus(r.status)}
                  </span>
                </td>
                <td className="py-3 text-xs text-gray-500">
                  {i === 0 ? "—" : label}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
