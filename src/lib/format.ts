export function formatDriverName(givenName: string, familyName: string): string {
  return `${givenName} ${familyName}`
}

export function formatPosition(pos: number | undefined | null): string {
  if (pos == null) return "—"
  return `P${pos}`
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

export function formatPoints(points: number): string {
  return points === 1 ? "1 pto" : `${points} pts`
}

export function abbreviateGP(raceName: string): string {
  return raceName
    .replace(" Grand Prix", "")
    .replace(" Grande Prêmio", "")
    .replace(" Gran Premio", "")
    .trim()
}

export function positionChange(current: number, previous: number): string {
  const diff = previous - current
  if (diff > 0) return `+${diff}`
  if (diff < 0) return `${diff}`
  return "="
}

const STATUS_ES: Record<string, string> = {
  Finished: "Terminó",
  Lapped: "A una vuelta",
  Retired: "Abandonó",
  Accident: "Accidente",
  Engine: "Motor",
  Collision: "Colisión",
  Gearbox: "Caja de cambios",
  Hydraulics: "Hidráulica",
  Brakes: "Frenos",
  Electrical: "Eléctrico",
  Suspension: "Suspensión",
  Transmission: "Transmisión",
  Overheating: "Sobrecalentamiento",
  Disqualified: "Descalificado",
  "Spun off": "Salida de pista",
  "Power Unit": "Unidad de potencia",
  "Wheel": "Rueda",
}

export function translateStatus(status: string): string {
  return STATUS_ES[status] ?? status
}
