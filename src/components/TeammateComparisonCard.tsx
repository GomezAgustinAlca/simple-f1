import type { TeammateComparison } from "@/types/f1"

export function TeammateComparisonCard({
  comparison,
}: {
  comparison: TeammateComparison
}) {
  const total = comparison.racesAhead + comparison.racesBehind
  const aheadPct = total > 0 ? Math.round((comparison.racesAhead / total) * 100) : 50

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
      <h3 className="font-semibold text-gray-900">Comparación vs compañero</h3>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Carreras adelante</span>
        <span className="font-bold text-green-600">{comparison.racesAhead}</span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all"
          style={{ width: `${aheadPct}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">Carreras detrás</span>
        <span className="font-bold text-red-400">{comparison.racesBehind}</span>
      </div>

      <div className="flex items-center justify-between text-sm border-t border-gray-100 pt-3">
        <span className="text-gray-500">Diferencia promedio</span>
        <span
          className={`font-bold ${
            comparison.avgPositionDiff > 0
              ? "text-green-600"
              : comparison.avgPositionDiff < 0
              ? "text-red-500"
              : "text-gray-600"
          }`}
        >
          {comparison.avgPositionDiff > 0 ? "+" : ""}
          {comparison.avgPositionDiff} pos.
        </span>
      </div>

      <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3">
        {comparison.summaryText}
      </p>
    </div>
  )
}
