@AGENTS.md

# Race Pulse — Estado actual del proyecto

## Stack
- **Framework:** Next.js (App Router), TypeScript, Tailwind CSS v4
- **Gráficos:** Recharts
- **RSS:** rss-parser
- **Deploy target:** Vercel (pendiente)

## Fuente de datos
Jolpica-F1 API — `https://api.jolpi.ca/ergast/f1`
- Paths correctos: `/{season}/...` — nunca `/f1/{season}/...` (doble prefijo, bug ya corregido)
- Caché: 1h datos actuales, 24h datos históricos (`src/lib/jolpica.ts`)

## Páginas existentes

| Ruta | Descripción |
|---|---|
| `/` | Home con grid de pilotos y buscador con autocomplete |
| `/drivers/[driverId]` | Perfil de piloto: tabla de carreras recientes, evolución, comparativa con compañero, noticias, duelo en pista |
| `/compare` | Comparador head-to-head de dos pilotos |
| `/rankings` | Clasificaciones: por temporada e histórico |
| `/premium` | Página de venta del plan premium ($2.99 USD/mes) |

## Features construidos

- **Duelo en pista** (`/api/circuit-duel`, `TrackDuel`, `DuelSummary`, `CircuitSVG`): visualización SVG por circuito de quién ganó cada vuelta
- **Histórico de resultados** completo por piloto
- **Clasificaciones por temporada e histórico** (`/api/rankings/season`, `/api/rankings/historical`)
- **Autocomplete** en búsqueda de pilotos (home)
- **Skeletons de carga** (`Skeleton.tsx`, `loading.tsx`)
- **Conclusiones automáticas** en texto (`src/lib/summaries.ts`) — nunca usan "malo", "fracaso" ni "desastre"
- **Fotos de pilotos** en `public/drivers/` (24 pilotos de la grilla 2026)
- **TrendArrow** con estados: UP / DOWN / STABLE / UNSTABLE / INSUFFICIENT_DATA
- **AdSlot** placeholder para publicidad (plan free)
- **PremiumBanner / PremiumModal** para upgrade
- **NewsCard** con RSS de F1Latam, Motorsport ES, SoyMotor

## Modelo free vs premium

- Distinción **solo client-side** vía `localStorage` key `racepulse_premium`
- `AuthProvider` en `src/contexts/AuthContext.tsx`; hook `useAuth()` expone `isPremium` y `togglePremium`
- Pagos **no integrados** — el botón activa el toggle de dev
- Free: últimas 5 carreras, con ads
- Premium ($2.99/mes): historial completo, sin ads, noticias off-season

## Archivos clave

```
src/lib/jolpica.ts       — cliente API + caché
src/lib/performance.ts   — cálculo de tendencias
src/lib/summaries.ts     — textos automáticos de conclusión
src/lib/rss.ts           — RSS noticias en español
src/lib/format.ts        — helpers de formato
src/lib/flags.ts         — banderas por nacionalidad
src/lib/auth.ts          — helpers de autenticación
src/contexts/AuthContext.tsx — premium flag
```

## API Routes internas

```
/api/drivers                     — lista de pilotos
/api/drivers/[driverId]/results  — resultados de un piloto
/api/compare                     — comparativa H2H
/api/rankings                    — clasificación general
/api/rankings/season             — clasificación por temporada
/api/rankings/historical         — clasificación histórica
/api/circuit-duel                — datos de duelo en pista
/api/news/[driverId]             — noticias RSS por piloto
```

## Temporada actual
2026 — 3 carreras completadas a mayo 2026.

## Tono y estilo
Neutral, nunca negativo. No usar "malo", "fracaso", "desastre". Público objetivo: aficionados casuales hispanohablantes, especialmente latinoamericanos.
