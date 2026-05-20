import type { AuthGate } from "@/types/cart";

// sessionStorage key used to carry a pending auth-gated action across
// the redirect to /auth/login or /auth/register. AuthProvider reads it
// on the next sign-in and replays the action against the now-
// authenticated session, so the user lands back where they intended
// without losing the item they wanted to save.
export const PENDING_AUTH_GATE_KEY = "soo.pendingAuthGate";

export function readPendingAuthGate(): AuthGate | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(PENDING_AUTH_GATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthGate;
    if (parsed.kind === "cart" || parsed.kind === "wishlist") return parsed;
    return null;
  } catch {
    return null;
  }
}

export function writePendingAuthGate(gate: AuthGate) {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(PENDING_AUTH_GATE_KEY, JSON.stringify(gate));
  } catch {
    // Storage quota / private mode — silently drop. The user can still
    // re-trigger the action after sign-in; we just lose the auto-replay.
  }
}

export function clearPendingAuthGate() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(PENDING_AUTH_GATE_KEY);
  } catch {
    // ignore
  }
}
