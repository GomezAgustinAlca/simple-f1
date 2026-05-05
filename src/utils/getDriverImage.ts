const DRIVER_IMAGES: Record<string, string> = {
  albon: "/driver-images/albon.webp",
  alonso: "/driver-images/alonso.jpg",
  antonelli: "/driver-images/antonelli.jpg",
  bearman: "/driver-images/bearman.jpg",
  bortoleto: "/driver-images/bortoleto.png",
  bottas: "/driver-images/bottas.png",
  colapinto: "/driver-images/colapinto.jpg",
  doohan: "/driver-images/doohan.jpg",
  gasly: "/driver-images/gasly.png",
  hadjar: "/driver-images/hadjar.jpg",
  hamilton: "/driver-images/hamilton.jpg",
  hulkenberg: "/driver-images/hulkenberg.jpg",
  lawson: "/driver-images/lawson.jpg",
  leclerc: "/driver-images/leclerc.jpg",
  lindblad: "/driver-images/lindblad.jpg",
  norris: "/driver-images/norris.jpg",
  ocon: "/driver-images/ocon.jpg",
  perez: "/driver-images/perez.jpg",
  piastri: "/driver-images/piastri.jpg",
  russell: "/driver-images/russell.jpg",
  sainz: "/driver-images/sainz.jpg",
  stroll: "/driver-images/stroll.jpg",
  tsunoda: "/driver-images/tsunoda.jpg",
  verstappen: "/driver-images/verstappen.jpg",
}

export function getDriverImage(driverId: string): string | null {
  return DRIVER_IMAGES[driverId.toLowerCase()] ?? null
}
