/**
 * Emails with ERP owner-only rights (customer type delete, sale delete, etc.).
 * Keep in sync with backend ERP_ADMIN_EMAILS.
 */
export const ERP_ADMIN_EMAILS: readonly string[] = [
  "erpadmin@yopmail.com",
];

export function isErpAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  return ERP_ADMIN_EMAILS.some(
    (allowed) => allowed.toLowerCase() === normalized,
  );
}
