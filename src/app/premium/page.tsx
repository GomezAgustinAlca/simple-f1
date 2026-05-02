"use client"

import { useAuth } from "@/contexts/AuthContext"

const features = [
  {
    title: "Histórico completo",
    desc: "Accedé a todas las temporadas anteriores, no solo la actual.",
  },
  {
    title: "Comparador avanzado",
    desc: "Compará pilotos a lo largo de múltiples temporadas con gráficos detallados.",
  },
  {
    title: "Off-Season en vivo",
    desc: "Noticias filtradas por piloto desde F1 Latam, Motorsport ES y SoyMotor.",
  },
  {
    title: "Sin publicidad",
    desc: "Experiencia limpia, sin banners ni interrupciones.",
  },
  {
    title: "Rankings históricos",
    desc: "Filtrá rankings por temporada y analizá evoluciones año a año.",
  },
  {
    title: "Análisis extendido",
    desc: "Posición de clasificación vs carrera, evolución dentro del equipo por temporada.",
  },
]

const faq = [
  {
    q: "¿Qué pasa si no hay carreras en este momento?",
    a: "Todas las funciones premium están disponibles siempre. En off-season podés ver el histórico completo y las últimas noticias.",
  },
  {
    q: "¿Puedo cancelar cuando quiera?",
    a: "Sí, podés cancelar en cualquier momento sin penalidades.",
  },
  {
    q: "¿La versión free sigue siendo útil?",
    a: "Totalmente. La versión free te da acceso a las últimas 5 carreras, tendencia actual y comparación vs compañero de equipo.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Tarjetas de crédito y débito internacionales vía Stripe. Pronto más opciones.",
  },
]

export default function PremiumPage() {
  const { isPremium, togglePremium } = useAuth()

  return (
    <div className="max-w-4xl mx-auto px-4 py-16 space-y-16">
      {/* Hero */}
      <section className="text-center space-y-6">
        <div className="inline-block bg-indigo-100 text-indigo-700 text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
          Simple F1 Premium
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
          Todo el análisis de F1
          <br />
          <span className="text-indigo-600">sin límites ni publicidad</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Histórico completo, comparador avanzado, noticias off-season y mucho más.
          Por menos de lo que vale un café.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl px-8 py-6 text-center shadow-sm">
            <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">Mensual</p>
            <p className="text-4xl font-black text-gray-900">$2.99</p>
            <p className="text-gray-400 text-sm mt-1">USD / mes</p>
          </div>
        </div>

        {/* CTA */}
        {isPremium ? (
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-6 py-3 rounded-2xl font-semibold">
              Estás usando Simple F1 Premium
            </div>
            <p className="text-xs text-gray-400">
              (Modo dev activo — hacé click en el toggle de la barra de navegación para cambiar)
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={togglePremium}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8 py-4 rounded-2xl text-lg transition-colors shadow-lg shadow-indigo-200"
            >
              Suscribirse ahora →
            </button>
            <p className="text-xs text-gray-400">
              Integración de pagos próximamente. Por ahora activá el modo premium para probar.
            </p>
          </div>
        )}
      </section>

      {/* Features grid */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 text-center">¿Qué incluye?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm space-y-3"
            >
              <h3 className="font-bold text-gray-900">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 text-center">Free vs Premium</h2>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="py-4 px-6 text-left text-gray-400 font-medium">Función</th>
                <th className="py-4 px-4 text-center text-gray-600 font-semibold">Free</th>
                <th className="py-4 px-4 text-center text-indigo-700 font-bold bg-indigo-50">
                  Premium
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[
                ["Últimas 5 carreras", true, true],
                ["Tendencia y estado del piloto", true, true],
                ["Comparación vs compañero (temporada actual)", true, true],
                ["Campeonato de constructores", true, true],
                ["Publicidad", "Sí", "No"],
                ["Histórico de temporadas anteriores", false, true],
                ["Comparador avanzado multi-temporada", false, true],
                ["Noticias off-season filtradas por piloto", false, true],
                ["Rankings históricos con filtro por año", false, true],
                ["Análisis grid vs carrera", false, true],
              ].map(([feat, free, premium]) => (
                <tr key={String(feat)}>
                  <td className="py-3 px-6 text-gray-700">{feat}</td>
                  <td className="py-3 px-4 text-center">
                    {free === true ? (
                      <span className="text-green-500">✓</span>
                    ) : free === false ? (
                      <span className="text-gray-300">—</span>
                    ) : (
                      <span className="text-gray-500 text-xs">{free}</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center bg-indigo-50">
                    {premium === true ? (
                      <span className="text-indigo-600">✓</span>
                    ) : premium === false ? (
                      <span className="text-gray-300">—</span>
                    ) : (
                      <span className="text-indigo-600 text-xs font-medium">{premium}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-6">
        <h2 className="text-2xl font-black text-gray-900 text-center">Preguntas frecuentes</h2>
        <div className="space-y-4">
          {faq.map(({ q, a }) => (
            <div key={q} className="bg-white border border-gray-100 rounded-2xl p-6 space-y-2">
              <p className="font-semibold text-gray-900">{q}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="text-center space-y-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-10 text-white">
        <h2 className="text-2xl font-black">Listo para ver más?</h2>
        <p className="text-indigo-100">
          Probá Simple F1 Premium y entendé la Fórmula 1 como nunca antes.
        </p>
        {!isPremium && (
          <button
            onClick={togglePremium}
            className="bg-white text-indigo-700 font-bold px-8 py-3 rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Activar Premium (dev) →
          </button>
        )}
        {isPremium && (
          <p className="text-indigo-200 text-sm">Premium activo en modo dev</p>
        )}
      </section>
    </div>
  )
}
