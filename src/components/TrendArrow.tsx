import type { TrendType } from "@/types/f1"

const config: Record<TrendType, { arrow: string; color: string; label: string }> = {
  UP: { arrow: "↑", color: "text-green-600", label: "Mejorando" },
  DOWN: { arrow: "↓", color: "text-red-500", label: "Bajando" },
  STABLE: { arrow: "→", color: "text-yellow-600", label: "Estable" },
  UNSTABLE: { arrow: "↕", color: "text-orange-500", label: "Inestable" },
  INSUFFICIENT_DATA: { arrow: "–", color: "text-gray-400", label: "Sin datos" },
}

const simplifiedConfig: Record<TrendType, { arrow: string; color: string }> = {
  UP: { arrow: "↑", color: "text-green-600" },
  DOWN: { arrow: "↓", color: "text-red-500" },
  STABLE: { arrow: "—", color: "text-gray-400" },
  UNSTABLE: { arrow: "—", color: "text-gray-400" },
  INSUFFICIENT_DATA: { arrow: "—", color: "text-gray-400" },
}

interface TrendArrowProps {
  trend: TrendType
  showLabel?: boolean
  size?: "sm" | "md" | "lg"
  simplified?: boolean
}

export function TrendArrow({ trend, showLabel = true, size = "md", simplified = false }: TrendArrowProps) {
  const textSize = size === "sm" ? "text-lg" : size === "lg" ? "text-3xl" : "text-2xl"
  const labelSize = size === "sm" ? "text-xs" : "text-sm"

  if (simplified) {
    const { arrow, color } = simplifiedConfig[trend]
    return (
      <span className={`inline-flex items-center font-bold ${color}`}>
        <span className={textSize}>{arrow}</span>
      </span>
    )
  }

  const { arrow, color, label } = config[trend]
  return (
    <span className={`inline-flex items-center gap-1 font-bold ${color}`}>
      <span className={textSize}>{arrow}</span>
      {showLabel && <span className={labelSize}>{label}</span>}
    </span>
  )
}
