import type { TrendType, DriverPerformanceSummary } from "@/types/f1"

export function getDriverSnapshot(summary: DriverPerformanceSummary): {
  headline: string
  headlineColor: "green" | "red" | "amber" | "gray"
  bullets: string[]
  weakness?: string
} {
  const { trend, lastFiveAveragePosition, seasonAveragePosition, bestFinish, dnfs, racesCount } = summary

  const headlineMap: Record<TrendType, { text: string; color: "green" | "red" | "amber" | "gray" }> = {
    UP: { text: "Mejorando", color: "green" },
    DOWN: { text: "En caída", color: "red" },
    STABLE: { text: "Estable", color: "gray" },
    UNSTABLE: { text: "Irregular", color: "amber" },
    INSUFFICIENT_DATA: { text: "Pocos datos aún", color: "gray" },
  }
  const { text: headline, color: headlineColor } = headlineMap[trend]

  const bullets: string[] = []

  if (lastFiveAveragePosition != null) {
    const avg = lastFiveAveragePosition.toFixed(1)
    const suffix = trend === "UP" ? " — viene al alza" : trend === "DOWN" ? " — viene bajando" : ""
    bullets.push(`Promedio últimas carreras: P${avg}${suffix}`)
  }

  if (bestFinish != null) {
    const qualifier = bestFinish <= 3 ? " (podio)" : bestFinish <= 10 ? " (top 10)" : ""
    bullets.push(`Mejor resultado de la temporada: P${bestFinish}${qualifier}`)
  }

  if (racesCount > 0) {
    if (dnfs === 0) {
      bullets.push(`Terminó las ${racesCount} carrera${racesCount !== 1 ? "s" : ""} sin abandonos`)
    } else {
      bullets.push(`${dnfs} abandono${dnfs !== 1 ? "s" : ""} en ${racesCount} carrera${racesCount !== 1 ? "s" : ""}`)
    }
  }

  let weakness: string | undefined
  if (dnfs >= 2) {
    weakness = `Fiabilidad: ${dnfs} abandonos — un punto a resolver`
  } else if (trend === "DOWN" && seasonAveragePosition != null && seasonAveragePosition > 12) {
    weakness = "Aún lejos de los puntos en la mayoría de carreras"
  }

  return { headline, headlineColor, bullets: bullets.slice(0, 3), weakness }
}

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

export function getPremiumSummaryText(trend: TrendType, avgPosition?: number | null): string {
  if (trend === "INSUFFICIENT_DATA") return "Temporada muy corta para sacar conclusiones sólidas."
  if (trend === "UNSTABLE") return "Alternancia sin dirección clara. Imposible predecir su próximo resultado. Sin base competitiva estable."
  if (trend === "UP") {
    if (avgPosition != null && avgPosition <= 5) return "Mejora sostenida hacia los puestos de honor. Está en la tendencia correcta."
    return "Mejora en curso, pero aún fuera del top. Progresa sin haber llegado a donde importa."
  }
  if (trend === "DOWN") {
    if (avgPosition != null && avgPosition <= 5) return "Pierde terreno desde posiciones altas. Señal de alerta en un piloto que debería rendir más."
    return "Caída sostenida: no es solo un resultado aislado. Pierde posiciones que antes conseguía."
  }
  // STABLE
  if (avgPosition != null) {
    if (avgPosition <= 5) return "Consistente en la zona alta — la regularidad es su activo competitivo."
    if (avgPosition <= 10) return "Estable pero por debajo del top. La constancia no alcanza para subir posiciones."
  }
  return "Regular en posiciones bajas. La estabilidad aquí no es una ventaja competitiva."
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

export function getCompareMotivo(
  summaryA: DriverPerformanceSummary,
  summaryB: DriverPerformanceSummary,
  nameA: string,
  nameB: string,
  winnerName: string | null
): string {
  if (!winnerName) {
    return `${nameA} y ${nameB} muestran indicadores similares esta temporada.`
  }

  const isAWinner = winnerName === nameA
  const w = isAWinner ? summaryA : summaryB
  const l = isAWinner ? summaryB : summaryA

  const reasons: string[] = []

  const avgW = w.seasonAveragePosition
  const avgL = l.seasonAveragePosition
  if (avgW != null && avgL != null && avgL - avgW >= 0.5) {
    reasons.push(`mejor promedio de posiciones (${avgW.toFixed(1)} vs ${avgL.toFixed(1)})`)
  }

  const recentW = w.lastFiveAveragePosition
  const recentL = l.lastFiveAveragePosition
  if (recentW != null && recentL != null && recentL - recentW >= 1) {
    reasons.push(`mejor rendimiento reciente`)
  }

  if (w.dnfs < l.dnfs) {
    reasons.push(`menor número de abandonos (${w.dnfs} vs ${l.dnfs})`)
  }

  if (w.trend === "UP" && l.trend !== "UP") {
    reasons.push(`tendencia positiva`)
  }

  if (reasons.length === 0) {
    return `${winnerName} tiene ventaja en el conjunto de métricas de la temporada.`
  }

  return `${winnerName} destaca por ${reasons.join(", ")}.`
}
