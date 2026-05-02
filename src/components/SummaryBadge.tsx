import type { StatusLabel } from "@/types/f1"

const styles: Record<StatusLabel, string> = {
  "En mejora": "bg-green-100 text-green-800 border border-green-200",
  Estable: "bg-yellow-100 text-yellow-800 border border-yellow-200",
  Inestable: "bg-orange-100 text-orange-800 border border-orange-200",
  "En caída": "bg-red-100 text-red-700 border border-red-200",
  "Sin datos suficientes": "bg-gray-100 text-gray-600 border border-gray-200",
}

export function SummaryBadge({ label }: { label: StatusLabel }) {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[label]}`}
    >
      {label}
    </span>
  )
}
