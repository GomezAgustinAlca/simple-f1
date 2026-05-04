export type CircuitType = "lento" | "rapido" | "mixto" | "callejero"

export interface CircuitInfo {
  name: string
  type: CircuitType
}

// Mapping de circuitId (Jolpica/Ergast) → nombre corto + tipo
export const CIRCUIT_MAP: Record<string, CircuitInfo> = {
  bahrain:       { name: "Bahrain",        type: "mixto" },
  jeddah:        { name: "Arabia Saudita", type: "callejero" },
  albert_park:   { name: "Australia",      type: "mixto" },
  suzuka:        { name: "Japón",          type: "mixto" },
  shanghai:      { name: "China",          type: "mixto" },
  miami:         { name: "Miami",          type: "mixto" },
  imola:         { name: "Imola",          type: "mixto" },
  monaco:        { name: "Mónaco",         type: "callejero" },
  villeneuve:    { name: "Canadá",         type: "mixto" },
  catalunya:     { name: "España",         type: "mixto" },
  red_bull_ring: { name: "Austria",        type: "rapido" },
  silverstone:   { name: "Silverstone",    type: "rapido" },
  hungaroring:   { name: "Hungría",        type: "lento" },
  spa:           { name: "Spa",            type: "rapido" },
  zandvoort:     { name: "Zandvoort",      type: "lento" },
  monza:         { name: "Monza",          type: "rapido" },
  baku:          { name: "Bakú",           type: "callejero" },
  marina_bay:    { name: "Singapur",       type: "callejero" },
  americas:      { name: "Austin",         type: "mixto" },
  rodriguez:     { name: "México",         type: "lento" },
  interlagos:    { name: "Brasil",         type: "mixto" },
  las_vegas:     { name: "Las Vegas",      type: "callejero" },
  losail:        { name: "Qatar",          type: "rapido" },
  yas_marina:    { name: "Abu Dabi",       type: "mixto" },
}

export function getCircuitInfo(circuitId: string): CircuitInfo | null {
  return CIRCUIT_MAP[circuitId] ?? null
}

export function getCircuitDisplayName(circuitId?: string, circuitName?: string): string {
  if (circuitId) {
    const info = CIRCUIT_MAP[circuitId]
    if (info) return info.name
  }
  if (circuitName) {
    return circuitName
      .replace(" Grand Prix", "")
      .replace(" Circuit", "")
      .replace("Autodromo ", "")
      .replace("Internacional", "")
      .trim()
  }
  return circuitId ?? "Desconocido"
}
