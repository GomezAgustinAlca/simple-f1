import { getDriverStandings, getDriverResults, getCurrentSeasonYear } from "@/lib/jolpica"
import { buildPerformanceSummary } from "@/lib/performance"
import { enrichSummary } from "@/lib/summaries"
import { nationalityFlag } from "@/lib/flags"
import { DriverCard } from "@/components/DriverCard"
import { DriverSelector } from "@/components/DriverSelector"
import { PremiumBanner } from "@/components/PremiumBanner"
import { AdSlot } from "@/components/AdSlot"

const FEATURED_IDS = [
  "colapinto",
  "max_verstappen",
  "leclerc",
  "norris",
  "hamilton",
  "antonelli",
]

export default async function HomePage() {
  const [standings, seasonYear] = await Promise.all([
    getDriverStandings("current"),
    getCurrentSeasonYear(),
  ])

  const featuredStandings = FEATURED_IDS.map(
    (id) => standings.find((s) => s.driverId === id) ?? null
  ).filter(Boolean) as Awaited<ReturnType<typeof getDriverStandings>>

  const featuredSummaries = await Promise.all(
    featuredStandings.map(async (s) => {
      const results = await getDriverResults("current", s.driverId)
      return {
        standing: s,
        summary: enrichSummary(
          buildPerformanceSummary(s.driverId, new Date().getFullYear(), results)
        ),
      }
    })
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-12">
      {/* Hero */}
      <section className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 leading-tight">
          Entendé cómo viene cada piloto
          <br />
          <span className="text-indigo-600">sin volverte ingeniero</span>
        </h1>
        <p className="text-gray-500 text-base max-w-xl mx-auto">
          Rendimiento, tendencia y comparación simple carrera por carrera.
        </p>
        <div className="flex justify-center">
          <DriverSelector
            drivers={standings}
            placeholder="Buscá un piloto..."
            navigateTo="driver"
          />
        </div>
        <p className="text-xs text-gray-400">
          Probá:{" "}
          <a
            href="/compare?driverA=colapinto&driverB=norris"
            className="hover:text-indigo-500 transition-colors"
          >
            Colapinto vs Norris en Mónaco →
          </a>
        </p>
      </section>

      <AdSlot slot="home-top" />

      {/* Featured drivers */}
      {featuredSummaries.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-xl font-bold text-gray-900">Pilotos destacados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredSummaries.map(({ standing, summary }) => (
              <DriverCard
                key={standing.driverId}
                driverId={standing.driverId}
                givenName={standing.givenName}
                familyName={standing.familyName}
                nationality={standing.nationality}
                team={standing.constructorName}
                statusLabel={summary.statusLabel}
                trend={summary.trend}
                points={standing.points}
                position={standing.position}
              />
            ))}
          </div>
        </section>
      )}

      {/* All standings */}
      {standings.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-xl font-bold text-gray-900">Campeonato {seasonYear}</h2>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-400 uppercase tracking-wide">
                  <th className="py-3 px-4 font-medium">Pos.</th>
                  <th className="py-3 px-4 font-medium">Piloto</th>
                  <th className="py-3 px-4 font-medium hidden sm:table-cell">Equipo</th>
                  <th className="py-3 px-4 font-medium text-right">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {standings.map((s) => (
                  <tr key={s.driverId} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-500">{s.position}</td>
                    <td className="py-3 px-4">
                      <a
                        href={`/drivers/${s.driverId}`}
                        className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                      >
                        {s.givenName} {s.familyName}
                      </a>
                    </td>
                    <td className="py-3 px-4 text-gray-500 hidden sm:table-cell">
                      {nationalityFlag(s.nationality) && (
                        <span className="mr-1">{nationalityFlag(s.nationality)}</span>
                      )}
                      {s.constructorName}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-gray-900">
                      {s.points}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {standings.length === 0 && (
        <div className="text-center py-16 text-gray-400 space-y-2">
          <p className="text-lg font-medium">No hay datos disponibles por el momento.</p>
          <p className="text-sm">Intentá de nuevo en unos minutos.</p>
        </div>
      )}

      <PremiumBanner />
    </div>
  )
}
