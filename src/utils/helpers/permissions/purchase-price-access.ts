/**
 * Emails allowed to enter and view purchase Per Item / Price.
 * Keep in sync with backend PURCHASE_PRICE_ACCESS_EMAILS.
 * Add new addresses here as needed.
 */
export const PURCHASE_PRICE_ACCESS_EMAILS: readonly string[] = [
  "erpadmin@yopmail.com",
];

export function canAccessPurchasePrice(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return PURCHASE_PRICE_ACCESS_EMAILS.some(
    (allowed) => allowed.toLowerCase() === normalized,
  );
}
