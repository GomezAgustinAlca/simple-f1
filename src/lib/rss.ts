import Parser from "rss-parser"
import type { NewsItem } from "@/types/news"

// Static feeds — filtered by driver name after fetching
const STATIC_FEEDS = [
  { url: "https://www.racefans.net/feed/", source: "RaceFans" },
  { url: "https://www.autosport.com/rss/f1/news/", source: "Autosport" },
]

const DRIVER_ALIASES: Record<string, string[]> = {
  antonelli: ["antonelli", "andrea", "kimi"],
  russell: ["russell", "george"],
  leclerc: ["leclerc", "charles"],
  hamilton: ["hamilton", "lewis"],
  norris: ["norris", "lando"],
  piastri: ["piastri", "oscar"],
  bearman: ["bearman", "oliver"],
  gasly: ["gasly", "pierre"],
  max_verstappen: ["verstappen", "max verstappen"],
  lawson: ["lawson", "liam"],
  lindblad: ["lindblad", "arvid"],
  hadjar: ["hadjar", "isack"],
  bortoleto: ["bortoleto", "gabriel"],
  sainz: ["sainz", "carlos sainz"],
  ocon: ["ocon", "esteban"],
  colapinto: ["colapinto", "franco"],
  hulkenberg: ["hulkenberg", "hülkenberg", "nico hulk"],
  albon: ["albon", "alexander albon"],
  bottas: ["bottas", "valtteri"],
  perez: ["pérez", "perez", "checo", "sergio perez"],
  alonso: ["alonso", "fernando"],
  stroll: ["stroll", "lance"],
}

// Full name for Google News query
const DRIVER_NAMES: Record<string, string> = {
  antonelli: "Andrea Kimi Antonelli",
  russell: "George Russell",
  leclerc: "Charles Leclerc",
  hamilton: "Lewis Hamilton",
  norris: "Lando Norris",
  piastri: "Oscar Piastri",
  bearman: "Oliver Bearman",
  gasly: "Pierre Gasly",
  max_verstappen: "Max Verstappen",
  lawson: "Liam Lawson",
  lindblad: "Arvid Lindblad",
  hadjar: "Isack Hadjar",
  bortoleto: "Gabriel Bortoleto",
  sainz: "Carlos Sainz",
  ocon: "Esteban Ocon",
  colapinto: "Franco Colapinto",
  hulkenberg: "Nico Hulkenberg",
  albon: "Alexander Albon",
  bottas: "Valtteri Bottas",
  perez: "Sergio Perez",
  alonso: "Fernando Alonso",
  stroll: "Lance Stroll",
}

function detectDrivers(text: string): string[] {
  const lower = text.toLowerCase()
  return Object.entries(DRIVER_ALIASES)
    .filter(([, aliases]) => aliases.some((a) => lower.includes(a)))
    .map(([id]) => id)
}

function truncate(text: string, maxChars = 200): string {
  if (!text || text.length <= maxChars) return text ?? ""
  return text.slice(0, maxChars).trimEnd() + "…"
}

const FETCH_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/rss+xml, application/xml, text/xml, */*",
}

async function fetchFeed(url: string, parser: Parser) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: FETCH_HEADERS,
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const buffer = await response.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  const sniff = new TextDecoder("ascii").decode(bytes.slice(0, 200))
  const charsetMatch = sniff.match(/encoding=["']([^"']+)["']/i)
  const charset = charsetMatch?.[1] ?? "utf-8"
  const text = new TextDecoder(charset).decode(bytes)
  return parser.parseString(text)
}

export async function fetchNewsForDriver(driverId: string): Promise<NewsItem[]> {
  const parser = new Parser()
  const items: NewsItem[] = []

  // 1. Google News RSS — Spanish, driver-specific query (primary source)
  const driverName = DRIVER_NAMES[driverId]
  if (driverName) {
    const query = encodeURIComponent(`${driverName} Formula 1`)
    const gnewsUrl = `https://news.google.com/rss/search?q=${query}&hl=es&gl=AR&ceid=AR:es`
    try {
      const feed = await fetchFeed(gnewsUrl, parser)
      console.log(`[news] Google News para ${driverId}: ${feed.items.length} artículos`)
      for (const item of feed.items.slice(0, 15)) {
        const rawTitle = item.title ?? ""
        // Google News titles: "Article headline - Source Name"
        const dashIdx = rawTitle.lastIndexOf(" - ")
        const title = dashIdx !== -1 ? rawTitle.slice(0, dashIdx).trim() : rawTitle
        const source = dashIdx !== -1 ? rawTitle.slice(dashIdx + 3).trim() : "Google News"
        items.push({
          title,
          summary: truncate(item.contentSnippet ?? item.content ?? ""),
          source,
          url: item.link ?? "",
          date: item.pubDate ?? item.isoDate ?? "",
          driverIds: [driverId],
        })
      }
    } catch (err) {
      console.warn(`[news] Google News falló para ${driverId}:`, err)
    }
  } else {
    console.warn(`[news] driverId desconocido: ${driverId}`)
  }

  // 2. Static feeds — filtered by driver aliases (English F1 news)
  await Promise.allSettled(
    STATIC_FEEDS.map(async ({ url, source }) => {
      try {
        const feed = await fetchFeed(url, parser)
        let matched = 0
        for (const item of feed.items.slice(0, 50)) {
          const combined = `${item.title ?? ""} ${item.contentSnippet ?? item.content ?? ""}`
          const driverIds = detectDrivers(combined)
          if (!driverIds.includes(driverId)) continue
          matched++
          items.push({
            title: item.title ?? "",
            summary: truncate(item.contentSnippet ?? item.content ?? ""),
            source,
            url: item.link ?? "",
            date: item.pubDate ?? item.isoDate ?? "",
            driverIds,
          })
        }
        console.log(`[news] ${source}: ${matched} artículos para ${driverId}`)
      } catch (err) {
        console.warn(`[news] Feed ${source} falló:`, err)
      }
    })
  )

  console.log(`[news] Total antes de deduplicar: ${items.length}`)

  // Deduplicate by title
  const seen = new Set<string>()
  const unique = items.filter((item) => {
    const key = item.title.trim().toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })

  const sorted = unique
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)

  console.log(`[news] Devolviendo ${sorted.length} artículos para ${driverId}`)
  return sorted
}
