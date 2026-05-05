"use client"

import type { DriverStanding, DriverPerformanceSummary } from "@/types/f1"
import { DriverAvatar } from "@/components/DriverAvatar"
import { TrendArrow } from "@/components/TrendArrow"

interface Props {
  standing: DriverStanding
  summary: DriverPerformanceSummary
  color: string
}

export function CompareDriverCard({ standing, summary, color }: Props) {
  const recentPos = summary.lastFiveAveragePosition

  return (
    <div
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col h-full"
      style={{ borderLeftWidth: 4, borderLeftColor: color }}
    >
      <div className="flex items-center gap-3">
        <DriverAvatar
          givenName={standing.givenName}
          familyName={standing.familyName}
          driverId={standing.driverId}
          size="lg"
        />
        <div className="min-w-0">
          <p className="font-bold text-gray-900 text-base leading-tight truncate">
            {standing.givenName} {standing.familyName}
          </p>
          <p className="text-xs font-medium mt-0.5 truncate" style={{ color }}>
            {standing.constructorName}
          </p>
        </div>
        <div className="ml-auto text-right shrink-0">
          <p className="text-xl font-black text-gray-900">#{standing.position}</p>
          <p className="text-xs text-gray-400">campeonato</p>
        </div>
      </div>

      <div className="flex items-center gap-4 border-t border-gray-50 pt-3 mt-auto text-sm">
        <div>
          <p className="text-xs text-gray-400 leading-none mb-0.5">Puntos</p>
          <p className="font-bold text-gray-900">{standing.points}</p>
        </div>
        <div className="w-px h-8 bg-gray-100" />
        <div>
          <p className="text-xs text-gray-400 leading-none mb-0.5">Últ. 5 carreras</p>
          <p className="font-bold text-gray-900">
            {recentPos != null ? `P${Math.round(recentPos)}` : "—"}
          </p>
        </div>
        {summary.trend !== "INSUFFICIENT_DATA" && (
          <div className="ml-auto">
            <TrendArrow trend={summary.trend} size="sm" showLabel />
          </div>
        )}
      </div>
    </div>
  )
}
