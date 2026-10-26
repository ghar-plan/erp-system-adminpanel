/** Display name for the currently authenticated admin user. */
export function getLoggedInUserDisplayName(user: any): string {
  if (!user) return "";

  const fullName = String(user.fullName || user.name || "").trim();
  if (fullName) return fullName;

  const first = String(user.firstName || "").trim();
  const last = String(user.lastName || "").trim();
  const combined = `${first} ${last}`.trim();
  if (combined) return combined;

  return String(user.email || "").trim();
}
