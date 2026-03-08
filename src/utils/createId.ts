export function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  // fallback for environments without crypto.randomUUID
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}