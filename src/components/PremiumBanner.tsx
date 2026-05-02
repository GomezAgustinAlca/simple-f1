import Link from "next/link"

export function PremiumBanner() {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <p className="font-bold text-lg">Desbloqueá Simple F1 Premium</p>
        <p className="text-indigo-100 text-sm mt-1">
          Histórico completo, comparador avanzado, noticias off-season y sin publicidad. Solo $2.99 USD/mes.
        </p>
      </div>
      <Link
        href="/premium"
        className="shrink-0 bg-white text-indigo-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors text-sm"
      >
        Ver planes →
      </Link>
    </div>
  )
}
