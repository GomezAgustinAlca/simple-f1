import { formatDate } from "@/lib/format"
import type { NewsItem } from "@/types/news"

export function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5 space-y-2"
    >
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <span className="font-medium text-indigo-600">{item.source}</span>
        <span>·</span>
        <span>{item.date ? formatDate(item.date) : "—"}</span>
      </div>
      <h4 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
        {item.title}
      </h4>
      {item.summary && (
        <p className="text-sm text-gray-500 line-clamp-2">{item.summary}</p>
      )}
      <span className="text-xs text-indigo-500 font-medium">Leer más →</span>
    </a>
  )
}
