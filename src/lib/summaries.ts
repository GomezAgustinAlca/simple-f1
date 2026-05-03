import type { TrendType, DriverPerformanceSummary } from "@/types/f1"

const texts: Record<TrendType, string> = {
  UP: "Viene mejorando en las últimas carreras.",
  DOWN: "Su rendimiento bajó en las últimas carreras.",
  STABLE: "Se mantiene en una zona similar de rendimiento.",
  UNSTABLE: "Alterna buenos y resultados irregulares.",
  INSUFFICIENT_DATA: "No hay suficientes carreras para evaluarlo.",
}

export function getSummaryText(trend: TrendType): string {
  return texts[trend]
}

export function enrichSummary(summary: DriverPerformanceSummary): DriverPerformanceSummary {
  return { ...summary, summaryText: getSummaryText(summary.trend) }
}

export function getRaceRowLabel(
  current: number | undefined | null,
  previous: number | undefined | null
): string {
  if (current == null || previous == null) return "sin comparación"
  const diff = previous - current
  if (diff > 0) return "mejoró"
  if (diff < 0) return "empeoró"
  return "igual"
}
