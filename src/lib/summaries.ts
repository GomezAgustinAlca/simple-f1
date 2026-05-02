import type { TrendType, DriverPerformanceSummary } from "@/types/f1"

const texts: Record<TrendType, string> = {
  UP: "Viene mejorando en las últimas carreras. Su posición promedio reciente es mejor que la etapa anterior.",
  DOWN: "Su rendimiento reciente bajó respecto a carreras anteriores. Necesita recuperar consistencia.",
  STABLE: "Se mantiene en una zona similar de rendimiento, sin grandes mejoras ni caídas.",
  UNSTABLE: "Alterna buenos y malos resultados. Tiene velocidad, pero todavía no muestra regularidad.",
  INSUFFICIENT_DATA: "Aún no hay suficientes carreras para evaluar una tendencia confiable.",
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
