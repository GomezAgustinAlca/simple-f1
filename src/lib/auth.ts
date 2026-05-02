// MVP: premium status is simulated via localStorage on the client side.
// The server always defaults to free. Replace with real auth when ready.

export const DEFAULT_PREMIUM = false

export function isPremiumFromCookie(cookieValue: string | undefined): boolean {
  return cookieValue === "true"
}
