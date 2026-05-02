const NATIONALITY_FLAGS: Record<string, string> = {
  Argentine: "🇦🇷",
  Australian: "🇦🇺",
  Austrian: "🇦🇹",
  Belgian: "🇧🇪",
  Brazilian: "🇧🇷",
  British: "🇬🇧",
  Canadian: "🇨🇦",
  Chinese: "🇨🇳",
  Danish: "🇩🇰",
  Dutch: "🇳🇱",
  Finnish: "🇫🇮",
  French: "🇫🇷",
  German: "🇩🇪",
  Hungarian: "🇭🇺",
  Italian: "🇮🇹",
  Japanese: "🇯🇵",
  Mexican: "🇲🇽",
  Monegasque: "🇲🇨",
  "New Zealander": "🇳🇿",
  Polish: "🇵🇱",
  Russian: "🇷🇺",
  Spanish: "🇪🇸",
  Swedish: "🇸🇪",
  Swiss: "🇨🇭",
  Thai: "🇹🇭",
  American: "🇺🇸",
}

export function nationalityFlag(nationality: string | undefined): string {
  if (!nationality) return ""
  return NATIONALITY_FLAGS[nationality] ?? ""
}
