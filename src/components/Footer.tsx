import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-100 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
        <div className="flex items-center">
          <span className="font-black text-gray-600 tracking-tight">Simple <span className="text-indigo-500">F1</span></span>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            Inicio
          </Link>
          <Link href="/compare" className="hover:text-gray-600 transition-colors">
            Comparar
          </Link>
          <Link href="/rankings" className="hover:text-gray-600 transition-colors">
            Rankings
          </Link>
          <Link href="/premium" className="hover:text-gray-600 transition-colors">
            Premium
          </Link>
        </nav>
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-xs text-gray-400">
            Simple F1 · Datos actualizados cada hora · Temporada {new Date().getFullYear()}
          </p>
          <p className="text-xs text-gray-300">
            Datos obtenidos desde Jolpica F1 API. Pueden existir demoras o inconsistencias temporales.
          </p>
        </div>
      </div>
    </footer>
  )
}
