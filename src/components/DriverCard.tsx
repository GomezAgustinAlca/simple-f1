import Link from "next/link"
import { SummaryBadge } from "@/components/SummaryBadge"
import { TrendArrow } from "@/components/TrendArrow"
import { DriverAvatar } from "@/components/DriverAvatar"
import { nationalityFlag } from "@/lib/flags"
import type { StatusLabel, TrendType } from "@/types/f1"

interface DriverCardProps {
  driverId: string
  givenName: string
  familyName: string
  nationality?: string
  team: string
  statusLabel: StatusLabel
  trend: TrendType
  points?: number
  position?: number
}

export function DriverCard({
  driverId,
  givenName,
  familyName,
  nationality,
  team,
  statusLabel,
  trend,
  points,
  position,
}: DriverCardProps) {
  const flag = nationalityFlag(nationality)
  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5">
      <Link
        href={`/drivers/${driverId}`}
        className="absolute inset-0 rounded-2xl"
        aria-label={`${givenName} ${familyName}`}
      />
      <div className="flex items-center gap-3">
        <DriverAvatar givenName={givenName} familyName={familyName} size="md" />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              {position != null && (
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  P{position}
                </span>
              )}
              <h3 className="font-bold text-gray-900 text-base leading-tight mt-0.5 truncate">
                {givenName} {familyName}
              </h3>
              <p className="text-sm text-gray-500 mt-0.5 truncate">
                {flag && <span className="mr-1">{flag}</span>}{team}
              </p>
            </div>
            <TrendArrow trend={trend} showLabel={false} size="lg" />
          </div>
        </div>
      </div>
      <div className="mt-4 space-y-3">
        <SummaryBadge label={statusLabel} />
        <div className="flex items-center justify-between">
          {points != null ? (
            <span className="text-sm text-gray-500">
              <span className="font-semibold text-gray-800">{points}</span> pts
            </span>
          ) : (
            <span />
          )}
          <Link
            href={`/compare?driverA=${driverId}`}
            className="relative z-10 text-xs font-medium text-gray-600 border border-gray-300 rounded-lg px-3 py-1.5 hover:bg-gray-50 hover:border-gray-400 transition-colors"
          >
            Comparar →
          </Link>
        </div>
      </div>
    </div>
  )
}
