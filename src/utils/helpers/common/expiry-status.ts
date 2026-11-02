/**
 * Colour-coded shelf-life status from an expiry date.
 *
 * - expired: past expiry (dead)
 * - near: within NEAR_DAYS of expiry
 * - fresh: more than NEAR_DAYS remaining ("has much time")
 * - none: no expiry set
 */

export type ExpiryStatus = "expired" | "near" | "fresh" | "none";

/** Days remaining at or below this count as "near to expire". */
export const EXPIRY_NEAR_DAYS = 30;

export interface ExpiryStatusInfo {
  status: ExpiryStatus;
  label: string;
  /** Calendar days until expiry (negative = already expired). Null if no date. */
  daysRemaining: number | null;
  badgeClass: string;
  /** Soft row background hint */
  toneClass: string;
}

const startOfToday = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const parseExpiryDate = (value?: string | Date | null): Date | null => {
  if (value === null || value === undefined || value === "") return null;
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    const d = new Date(value);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  const raw = String(value).trim();
  if (!raw) return null;
  const dateOnly = raw.slice(0, 10);
  const d = /^\d{4}-\d{2}-\d{2}$/.test(dateOnly)
    ? new Date(`${dateOnly}T00:00:00`)
    : new Date(raw);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(0, 0, 0, 0);
  return d;
};

export const daysUntilExpiry = (
  expiryDate?: string | Date | null,
  asOf: Date = startOfToday(),
): number | null => {
  const expiry = parseExpiryDate(expiryDate);
  if (!expiry) return null;
  const ref = new Date(asOf);
  ref.setHours(0, 0, 0, 0);
  return Math.round((expiry.getTime() - ref.getTime()) / 86_400_000);
};

export const getExpiryStatus = (
  expiryDate?: string | Date | null,
  nearDays: number = EXPIRY_NEAR_DAYS,
): ExpiryStatusInfo => {
  const days = daysUntilExpiry(expiryDate);

  if (days === null) {
    return {
      status: "none",
      label: "No expiry",
      daysRemaining: null,
      badgeClass:
        "bg-panel-bg text-muted-foreground border border-panel-border",
      toneClass: "",
    };
  }

  if (days < 0) {
    const ago = Math.abs(days);
    return {
      status: "expired",
      label: `Expired · ${ago}d ago`,
      daysRemaining: days,
      badgeClass: "bg-danger-bg text-danger-text border border-panel-border",
      toneClass: "bg-danger-bg/30",
    };
  }

  if (days <= nearDays) {
    return {
      status: "near",
      label: days === 0 ? "Expires today" : `Near expiry · ${days}d left`,
      daysRemaining: days,
      badgeClass: "bg-warning-bg text-warning-text border border-panel-border",
      toneClass: "bg-warning-bg/30",
    };
  }

  return {
    status: "fresh",
    label: `Fresh · ${days}d left`,
    daysRemaining: days,
    badgeClass: "bg-success-bg text-success-text border border-panel-border",
    toneClass: "bg-success-bg/20",
  };
};

const STATUS_RANK: Record<ExpiryStatus, number> = {
  expired: 3,
  near: 2,
  fresh: 1,
  none: 0,
};

/** Worst status among several dates (expired > near > fresh > none). */
export const getWorstExpiryStatus = (
  expiryDates: Array<string | Date | null | undefined>,
  nearDays: number = EXPIRY_NEAR_DAYS,
): ExpiryStatusInfo => {
  const infos = expiryDates.map((d) => getExpiryStatus(d, nearDays));
  if (!infos.length) return getExpiryStatus(null, nearDays);

  return infos.reduce((worst, current) =>
    STATUS_RANK[current.status] > STATUS_RANK[worst.status] ? current : worst,
  );
};

/** Earliest (most urgent) expiry date among a list, or null. */
export const getEarliestExpiryDate = (
  expiryDates: Array<string | Date | null | undefined>,
): string | null => {
  const parsed = expiryDates
    .map((d) => parseExpiryDate(d))
    .filter((d): d is Date => !!d)
    .sort((a, b) => a.getTime() - b.getTime());
  if (!parsed.length) return null;
  const d = parsed[0];
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
};
