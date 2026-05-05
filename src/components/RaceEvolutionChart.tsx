"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Dot,
} from "recharts"
import { abbreviateGP } from "@/lib/format"
import { isDNF } from "@/lib/performance"
import type { RaceResult } from "@/types/f1"

interface ChartPoint {
  gp: string
  pos: number | null
  points: number
  status: string
  isDNF: boolean
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomDot(props: any) {
  const { cx, cy, payload } = props
  if (payload.isDNF) {
    return <circle cx={cx} cy={cy} r={6} fill="#f87171" stroke="#fff" strokeWidth={2} />
  }
  return <circle cx={cx} cy={cy} r={5} fill="#6366f1" stroke="#fff" strokeWidth={2} />
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload as ChartPoint
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-bold text-gray-900">{d.gp}</p>
      <p className="text-gray-600">
        Posición:{" "}
        <span className="font-semibold">{d.isDNF ? "DNF" : d.pos != null ? `P${d.pos}` : "—"}</span>
      </p>
      <p className="text-gray-600">
        Puntos: <span className="font-semibold">{d.points}</span>
      </p>
      <p className="text-gray-500">{d.status}</p>
    </div>
  )
}

interface RaceEvolutionChartProps {
  results: RaceResult[]
}

export function RaceEvolutionChart({ results }: RaceEvolutionChartProps) {
  const slice = results

  const data: ChartPoint[] = slice.map((r) => ({
    gp: abbreviateGP(r.raceName),
    pos: r.position ?? null,
    points: r.points,
    status: r.status,
    isDNF: isDNF(r.status),
  }))

  const validPositions = data.filter((d) => d.pos != null).map((d) => d.pos as number)
  const maxPos = validPositions.length > 0 ? Math.max(...validPositions, 5) : 20
  const domain: [number, number] = [1, Math.min(maxPos + 2, 20)]

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No hay datos suficientes para mostrar el gráfico.
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="gp"
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          domain={domain}
          reversed
          tick={{ fontSize: 11, fill: "#9ca3af" }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `P${v}`}
          width={36}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="pos"
          stroke="#6366f1"
          strokeWidth={2.5}
          dot={<CustomDot />}
          connectNulls={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
