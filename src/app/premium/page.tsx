const CHECKOUT_URL = "https://simplef1.lemonsqueezy.com/checkout/buy/a17d801a-9e92-4da7-9e2b-e314c6d30906"

const freeItems = [
  "Ves números sin contexto",
  "No sabés quién está mejor realmente",
  "Comparación incompleta",
]

const premiumItems = [
  "Conclusiones automáticas",
  "Sabés quién está mejor en segundos",
  "Comparación con contexto real",
  "Evolución clara",
]

const benefits = [
  {
    title: "Sabés quién está mejor, sin pensar.",
    desc: "Te decimos directamente quién rinde mejor y por qué.",
  },
  {
    title: "Comparás pilotos en contexto real",
    desc: "No solo números — el contexto que hace que los números tengan sentido.",
  },
  {
    title: "Seguís la evolución, no solo el resultado",
    desc: "Ves cómo viene cada piloto, no solo cómo terminó la última carrera.",
  },
]

function MockCompareBlock() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4 pointer-events-none select-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-600 text-sm">VER</div>
          <div>
            <p className="font-bold text-gray-900 text-sm">Max Verstappen</p>
            <p className="text-xs text-gray-400">Red Bull Racing</p>
          </div>
        </div>
        <div className="text-center">
          <p className="text-xs text-gray-400 uppercase tracking-wide">vs</p>
        </div>
        <div className="flex items-center gap-3 flex-row-reverse">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center font-black text-red-600 text-sm">NOR</div>
          <div className="text-right">
            <p className="font-bold text-gray-900 text-sm">Lando Norris</p>
            <p className="text-xs text-gray-400">McLaren</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="font-black text-gray-900">2</p>
          <p className="text-xs text-gray-400">Podios</p>
        </div>
        <div className="bg-indigo-50 rounded-xl p-3">
          <p className="font-black text-indigo-700 text-xs">Tendencia</p>
          <p className="text-xs text-gray-500 mt-0.5">↑ En mejora</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="font-black text-gray-900">3</p>
          <p className="text-xs text-gray-400">Podios</p>
        </div>
      </div>

      <div className="bg-indigo-50 rounded-xl p-3 space-y-1">
        <p className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Conclusión automática</p>
        <p className="text-sm text-gray-700">
          Norris muestra una evolución más consistente en las últimas 5 carreras, con mejor ritmo en clasificación.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Evolución últimas 5 carreras</p>
        <div className="flex items-end gap-1 h-12">
          {[3, 1, 2, 4, 1].map((pos, i) => (
            <div key={i} className="flex-1 bg-indigo-200 rounded-sm" style={{ height: `${(6 - pos) * 18}%` }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PremiumPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16 space-y-20">

      {/* 1. HERO */}
      <section className="text-center space-y-6">
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
          Dejá de mirar tablas.{" "}
          <span className="text-indigo-600">Entendé quién está mejor en segundos.</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Simple F1 te dice quién rinde mejor, por qué y cómo viene evolucionando.
        </p>
        <p className="text-3xl font-black text-gray-900">
          $2.99 <span className="text-base font-normal text-gray-400">USD/mes</span>
        </p>
        <div className="space-y-2">
          <a
            href={CHECKOUT_URL}
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-10 py-4 rounded-2xl text-lg transition-colors shadow-lg shadow-indigo-200"
          >
            Desbloquear Premium →
          </a>
          <p className="text-sm text-gray-500 font-medium">
            Si hoy no lo ves claro, es porque te faltan estas vistas.
          </p>
          <p className="text-xs text-gray-400">Acceso inmediato. Cancelás cuando quieras.</p>
        </div>
      </section>

      {/* 2. BLOQUE BLOQUEADO */}
      <section className="relative">
        <div className="blur-sm opacity-60">
          <MockCompareBlock />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 rounded-2xl backdrop-blur-[2px] gap-4">
          <p className="text-base font-bold text-gray-800 text-center px-4">
            Desbloqueá la comparación completa con Premium
          </p>
          <a
            href={CHECKOUT_URL}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 py-3 rounded-xl text-sm transition-colors shadow-md shadow-indigo-200"
          >
            Desbloquear Premium →
          </a>
        </div>
      </section>

      {/* 3. FREE vs PREMIUM */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 text-center">Free vs Premium</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wide">Free</p>
            <ul className="space-y-3">
              {freeItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-gray-500 text-sm">
                  <span className="mt-0.5 text-gray-300">—</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 space-y-4">
            <p className="text-sm font-bold text-indigo-600 uppercase tracking-wide">Premium</p>
            <ul className="space-y-3">
              {premiumItems.map((item) => (
                <li key={item} className="flex items-start gap-2 text-gray-800 text-sm font-medium">
                  <span className="mt-0.5 text-indigo-500">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* 4. BENEFICIOS */}
      <section className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {benefits.map((b) => (
            <div key={b.title} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-2 shadow-sm">
              <p className="font-bold text-gray-900 leading-snug">{b.title}</p>
              <p className="text-sm text-gray-500">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. CTA FINAL */}
      <section className="text-center space-y-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-10 text-white">
        <h2 className="text-2xl font-black">Probalo y entendé todo en segundos</h2>
        <a
          href={CHECKOUT_URL}
          className="inline-block bg-white text-indigo-700 font-bold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
        >
          Desbloquear Premium →
        </a>
      </section>

    </div>
  )
}
