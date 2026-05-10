// Canonical F1 team display names — single source of truth.
// Keys are lowercase API names (constructorId or constructorName variants).
const TEAM_NAME_MAP: Record<string, string> = {
  // Racing Bulls (formerly RB, AlphaTauri, Toro Rosso)
  "rb": "Racing Bulls",
  "rb f1 team": "Racing Bulls",
  "racing bulls": "Racing Bulls",
  "alphatauri": "Racing Bulls",
  "alpha tauri": "Racing Bulls",
  "toro rosso": "Racing Bulls",
  // Cadillac
  "cadillac f1 team": "Cadillac",
  "cadillac": "Cadillac",
  // Red Bull
  "red bull": "Red Bull",
  "red bull racing": "Red Bull",
  // McLaren
  "mclaren": "McLaren",
  // Ferrari
  "ferrari": "Ferrari",
  // Mercedes
  "mercedes": "Mercedes",
  // Alpine
  "alpine f1 team": "Alpine",
  "alpine": "Alpine",
  // Williams
  "williams": "Williams",
  "williams racing": "Williams",
  // Haas
  "haas f1 team": "Haas",
  "haas": "Haas",
  // Audi
  "audi": "Audi",
  "audi f1 team": "Audi",
  "kick sauber": "Audi",
  // Aston Martin
  "aston martin": "Aston Martin",
  "aston martin f1 team": "Aston Martin",
  "aston martin aramco": "Aston Martin",
}

export function normalizeTeamName(apiName: string): string {
  return TEAM_NAME_MAP[apiName.toLowerCase()] ?? apiName
}
