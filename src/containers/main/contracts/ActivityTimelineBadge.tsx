import {
  activityTimelineStatus,
  type ActivityTimelineKind,
} from "./activity-timeline";

const BADGE_CLASS: Record<ActivityTimelineKind, string> = {
  progress:
    "bg-emerald-500/25 text-emerald-800 dark:text-emerald-200 shadow-[0_0_16px_rgba(16,185,129,0.85)] animate-pulse",
  overdue:
    "bg-red-500/25 text-red-800 dark:text-red-200 shadow-[0_0_16px_rgba(239,68,68,0.85)] animate-pulse",
  upcoming: "bg-muted-foreground/10 text-muted-foreground",
  none: "bg-muted-foreground/10 text-muted-foreground",
};

export default function ActivityTimelineBadge({
  startDate,
  endDate,
}: {
  startDate?: string | Date | null;
  endDate?: string | Date | null;
}) {
  const status = activityTimelineStatus(startDate, endDate);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${BADGE_CLASS[status.kind]}`}
    >
      {status.label}
    </span>
  );
}
