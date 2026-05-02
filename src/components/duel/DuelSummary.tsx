"use client"

interface DuelSummaryProps {
  nameA: string
  nameB: string
  colorA: string
  colorB: string
  avgA: number | null
  avgB: number | null
  bestA: number | null
  bestB: number | null
  lastA: number | null
  lastB: number | null
  validRacesA: number
  validRacesB: number
  onReset: () => void
}

export function DuelSummary({
  nameA,
  nameB,
  colorA,
  colorB,
  avgA,
  avgB,
  bestA,
  bestB,
  lastA,
  lastB,
  validRacesA,
  validRacesB,
  onReset,
}: DuelSummaryProps) {
  const noData = avgA === null && avgB === null
  const limitedA = validRacesA < 2
  const limitedB = validRacesB < 2
  const bothLimited = limitedA && limitedB
  const oneLimited = (limitedA || limitedB) && !bothLimited

  let winner: "A" | "B" | "tie" | "nodata" = "nodata"
  let conclusionText = ""

  if (noData || bothLimited) {
    conclusionText = "Sin datos históricos suficientes para declarar un ganador."
  } else if (avgA === null || avgB === null) {
    winner = avgA !== null ? "A" : "B"
    const winName = winner === "A" ? nameA : nameB
    conclusionText = `${winName} tiene datos históricos en este circuito. Sin datos del rival para comparar.`
  } else {
    const diff = Math.abs(avgA - avgB)

    if (diff === 0 && bestA !== null && bestB !== null && bestA !== bestB) {
      winner = bestA < bestB ? "A" : "B"
      const winName = winner === "A" ? nameA : nameB
      conclusionText = `Promedios iguales en este circuito. ${winName} se destaca por mejor resultado histórico.`
    } else if (diff <= 0.5) {
      winner = "tie"
      conclusionText = `Rendimiento similar en este circuito. Promedio de ${nameA}: P${avgA} — ${nameB}: P${avgB}.`
    } else if (diff <= 3) {
      winner = avgA < avgB ? "A" : "B"
      const winName = winner === "A" ? nameA : nameB
      conclusionText = `Ventaja leve para ${winName} en este circuito.`
    } else {
      winner = avgA < avgB ? "A" : "B"
      const winName = winner === "A" ? nameA : nameB
      const losName = winner === "A" ? nameB : nameA
      conclusionText = `${winName} rinde mejor que ${losName} en este circuito.`
    }
  }

  const winnerName = winner === "A" ? nameA : winner === "B" ? nameB : null
  const winnerColor = winner === "A" ? colorA : winner === "B" ? colorB : "#6B7280"

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      {/* Winner banner */}
      <div className="text-center space-y-1">
        {winnerName && winner !== "tie" ? (
          <>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Ganador histórico</p>
            <p className="text-2xl font-black" style={{ color: winnerColor }}>
              {winnerName}
            </p>
          </>
        ) : winner === "tie" ? (
          <p className="text-xl font-bold text-gray-700">Rendimiento similar</p>
        ) : (
          <p className="text-base font-semibold text-gray-500">Sin datos suficientes</p>
        )}
        <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">{conclusionText}</p>
      </div>

      {/* Limited sample warning */}
      {oneLimited && !noData && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-2.5">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-xs font-semibold text-amber-700">
            Muestra limitada — {limitedA ? nameA : nameB} tiene menos de 2 carreras válidas en este circuito
          </p>
        </div>
      )}

      {/* Stats table */}
      {!noData && !bothLimited && (
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div />
          <div
            className="text-center font-bold text-xs py-1 px-2 rounded-lg"
            style={{ backgroundColor: colorA + "22", color: colorA }}
          >
            {nameA.split(" ").pop()}
          </div>
          <div
            className="text-center font-bold text-xs py-1 px-2 rounded-lg"
            style={{ backgroundColor: colorB + "22", color: colorB }}
          >
            {nameB.split(" ").pop()}
          </div>

          <div className="text-gray-500 text-xs self-center">Promedio</div>
          <div className="text-center font-semibold text-gray-900">{avgA !== null ? `P${avgA}` : "—"}</div>
          <div className="text-center font-semibold text-gray-900">{avgB !== null ? `P${avgB}` : "—"}</div>

          <div className="text-gray-500 text-xs self-center">Mejor resultado</div>
          <div className="text-center font-semibold text-gray-900">{bestA !== null ? `P${bestA}` : "—"}</div>
          <div className="text-center font-semibold text-gray-900">{bestB !== null ? `P${bestB}` : "—"}</div>

          <div className="text-gray-500 text-xs self-center">Última posición</div>
          <div className="text-center font-semibold text-gray-900">{lastA !== null ? `P${lastA}` : "—"}</div>
          <div className="text-center font-semibold text-gray-900">{lastB !== null ? `P${lastB}` : "—"}</div>
        </div>
      )}

      <button
        onClick={onReset}
        className="w-full py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm transition-colors"
      >
        Nuevo duelo
      </button>
    </div>
  )
}
