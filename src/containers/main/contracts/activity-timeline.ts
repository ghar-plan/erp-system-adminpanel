export type ActivityTimelineKind = "progress" | "overdue" | "upcoming" | "none";

export type ActivityTimelineStatus = {
  label: string;
  kind: ActivityTimelineKind;
};

const startOfDay = (date: Date) => {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
};

export const parseDateOnly = (value?: string | Date | null) => {
  if (!value) return null;
  if (typeof value === "string") {
    const dateOnly = value.slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
      const [year, month, day] = dateOnly.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : startOfDay(parsed);
};

export const toDateInputValue = (value?: string | Date | null) => {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  const parsed = parseDateOnly(value);
  if (!parsed) return "";
  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const durationDays = (
  startDate?: string | Date | null,
  endDate?: string | Date | null,
) => {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (!start || !end || end < start) return null;
  return Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
};

export const activityTimelineStatus = (
  startDate?: string | Date | null,
  endDate?: string | Date | null,
): ActivityTimelineStatus => {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);
  if (!start || !end) {
    return { label: "—", kind: "none" };
  }

  const today = startOfDay(new Date());
  if (today < start) {
    return { label: "Not Started", kind: "upcoming" };
  }
  if (today > end) {
    return { label: "Deadline Met", kind: "overdue" };
  }
  return { label: "Activity in Progress", kind: "progress" };
};

export const formatDurationLabel = (days: number | null) => {
  if (days === null) return "—";
  return `${days} day${days === 1 ? "" : "s"}`;
};
