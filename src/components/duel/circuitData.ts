export interface Keypoint {
  name: string
  percent: number // 0–1 along the path
}

export interface CircuitDef {
  id: string
  name: string
  country: string
  viewBox: string
  path: string
  keypoints: Keypoint[]
}

export const CIRCUITS: CircuitDef[] = [
  {
    id: "monaco",
    name: "Mónaco",
    country: "MC",
    viewBox: "132 53 179 192",
    // Tight, winding street circuit shape
    path: "M 190 225 L 245 225 C 262 225 274 215 278 200 L 285 175 C 289 160 291 142 286 127 L 276 104 C 266 87 248 77 230 76 L 208 74 C 188 73 171 82 165 97 L 157 118 C 152 133 153 149 160 162 L 170 180 C 177 192 180 206 178 216 Z",
    keypoints: [
      { name: "Sainte Devote", percent: 0.14 },
      { name: "Túnel", percent: 0.44 },
      { name: "Chicane del Puerto", percent: 0.74 },
    ],
  },
  {
    id: "monza",
    name: "Monza",
    country: "IT",
    viewBox: "50 22 280 213",
    // Oval-like with chicanes on right
    path: "M 70 215 L 70 75 C 70 56 84 42 103 42 L 277 42 C 296 42 310 56 310 75 L 310 110 C 310 117 304 123 297 123 L 278 123 C 271 123 265 129 265 136 L 265 148 C 265 155 271 161 278 161 L 297 161 C 304 161 310 167 310 174 L 310 215 Z",
    keypoints: [
      { name: "Variante del Rettifilo", percent: 0.12 },
      { name: "Curva Grande", percent: 0.38 },
      { name: "Parabólica", percent: 0.78 },
    ],
  },
  {
    id: "silverstone",
    name: "Silverstone",
    country: "GB",
    viewBox: "14 -8 377 265",
    // Fast, flowing British circuit
    path: "M 75 195 L 75 155 C 75 137 62 118 48 108 L 40 88 C 34 74 40 57 54 50 L 75 43 C 92 37 113 41 127 52 L 158 74 C 174 85 196 89 218 86 L 248 80 C 270 75 290 60 298 43 L 308 28 C 318 14 340 12 354 23 L 364 40 C 371 53 367 70 355 80 L 330 106 C 318 117 313 133 317 149 L 325 173 C 330 190 322 210 304 218 L 268 228 C 237 237 196 238 165 232 L 122 223 C 100 218 78 210 75 195 Z",
    keypoints: [
      { name: "Copse", percent: 0.19 },
      { name: "Maggotts", percent: 0.44 },
      { name: "Chapel", percent: 0.64 },
    ],
  },
  {
    id: "interlagos",
    name: "Interlagos",
    country: "BR",
    viewBox: "79 45 236 232",
    // Anti-clockwise, flowing S-curves
    path: "M 195 220 L 248 215 C 272 210 290 193 293 169 L 294 140 C 295 118 283 97 264 87 L 240 76 C 216 65 190 66 168 78 L 147 92 C 130 106 122 127 125 148 L 130 170 C 134 184 130 200 120 210 L 108 222 C 99 231 103 248 116 252 L 148 255 C 167 257 185 253 193 242 Z",
    keypoints: [
      { name: "Senna S", percent: 0.14 },
      { name: "Curva do Sol", percent: 0.44 },
      { name: "Junção", percent: 0.71 },
    ],
  },
]

export const TEAM_COLORS: Record<string, string> = {
  alpine: "#0067FF",
  mclaren: "#FF8000",
  ferrari: "#DC0000",
  red_bull: "#1E3A5F",
  mercedes: "#C0C0C0",
  williams: "#00A3E0",
  aston_martin: "#006F62",
  haas: "#B22222",
  rb: "#1E41FF",
  racing_bulls: "#1E41FF",
  audi: "#1A1A1A",
  kick_sauber: "#1A1A1A",
  default: "#6B7280",
}

export function getTeamColor(constructorId: string): string {
  return TEAM_COLORS[constructorId.toLowerCase()] ?? TEAM_COLORS.default
}
