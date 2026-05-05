import { SummaryBadge } from "@/components/SummaryBadge"
import { TrendArrow } from "@/components/TrendArrow"
import { DriverAvatar } from "@/components/DriverAvatar"
import type { StatusLabel, TrendType } from "@/types/f1"

interface RankingCardProps {
  rank: number
  driverId: string
  givenName: string
  familyName: string
  driverName: string
  constructorName: string
  statusLabel: StatusLabel
  trend: TrendType
  totalPoints: number
  standingPosition: number
  lastFiveAvg?: number | null
  isExpanded?: boolean
  onClick?: () => void
}

export function RankingCard({
  rank,
  driverId,
  givenName,
  familyName,
  driverName,
  constructorName,
  statusLabel,
  trend,
  totalPoints,
  standingPosition,
  lastFiveAvg,
  isExpanded = false,
  onClick,
}: RankingCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3 bg-white border border-gray-100 shadow-sm transition-all p-4 text-left ${
        isExpanded
          ? "rounded-t-2xl border-b-0 cursor-pointer"
          : "rounded-2xl hover:shadow-md hover:-translate-y-0.5 cursor-pointer"
      }`}
    >
      <span className="text-lg font-black text-gray-200 w-6 shrink-0 text-center">#{rank}</span>
      <DriverAvatar givenName={givenName ?? ""} familyName={familyName ?? ""} driverId={driverId} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-gray-900 text-sm truncate">{driverName}</p>
        <p className="text-xs text-gray-400 truncate">{constructorName}</p>
      </div>
      <div className="hidden sm:flex items-center gap-3">
        {lastFiveAvg != null && (
          <span className="text-xs text-gray-500">
            Prom. <span className="font-semibold text-gray-700">{lastFiveAvg.toFixed(1)}</span>
          </span>
        )}
        <span className="text-xs text-gray-500">
          Camp. <span className="font-semibold text-gray-700">P{standingPosition}</span>
        </span>
        <span className="text-xs text-gray-500">
          <span className="font-semibold text-gray-700">{totalPoints}</span> pts
        </span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-end gap-1">
          <TrendArrow trend={trend} size="sm" simplified />
          <SummaryBadge label={statusLabel} />
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isExpanded ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>
  )
}
