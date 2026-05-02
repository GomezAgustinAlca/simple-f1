import Parser from "rss-parser"
import type { NewsItem } from "@/types/news"

const FEEDS = [
  { url: "https://www.f1latam.com/rss/rss.php", source: "F1 Latam" },
  { url: "https://espanol.motorsport.com/f1/rss/news/", source: "Motorsport ES" },
  { url: "https://soymotor.com/feed", source: "SoyMotor" },
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
  max_verstappen: ["verstappen", "max"],
  lawson: ["lawson", "liam"],
  lindblad: ["lindblad", "arvid"],
  hadjar: ["hadjar", "isack"],
  bortoleto: ["bortoleto", "gabriel"],
  sainz: ["sainz", "carlos"],
  ocon: ["ocon", "esteban"],
  colapinto: ["colapinto", "franco"],
  hulkenberg: ["hulkenberg", "hülkenberg", "nico"],
  albon: ["albon", "alexander", "alex"],
  bottas: ["bottas", "valtteri"],
  perez: ["pérez", "perez", "checo", "sergio"],
  alonso: ["alonso", "fernando"],
  stroll: ["stroll", "lance"],
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

async function fetchFeed(url: string, parser: Parser) {
  const response = await fetch(url, { signal: AbortSignal.timeout(5000) })
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

  await Promise.allSettled(
    FEEDS.map(async ({ url, source }) => {
      try {
        const feed = await fetchFeed(url, parser)
        for (const item of feed.items.slice(0, 20)) {
          const combined = `${item.title ?? ""} ${item.contentSnippet ?? item.content ?? ""}`
          const driverIds = detectDrivers(combined)
          if (!driverIds.includes(driverId)) continue
          items.push({
            title: item.title ?? "",
            summary: truncate(item.contentSnippet ?? item.content ?? ""),
            source,
            url: item.link ?? "",
            date: item.pubDate ?? item.isoDate ?? "",
            driverIds,
          })
        }
      } catch {
        // feed unavailable — skip silently
      }
    })
  )

  return items
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10)
}
