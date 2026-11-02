import React from "react";
import {
  ExpiryStatusInfo,
  getExpiryStatus,
} from "@/utils/helpers/common/expiry-status";

type Props = {
  expiryDate?: string | Date | null;
  /** Pass precomputed status (e.g. worst across multiple lines). */
  info?: ExpiryStatusInfo;
  className?: string;
  /** Show compact label only (no "· Nd left" detail) for tight cells. */
  compact?: boolean;
};

const COMPACT_LABEL: Record<string, string> = {
  expired: "Expired",
  near: "Near expiry",
  fresh: "Fresh",
  none: "No expiry",
};

export default function ExpiryStatusBadge({
  expiryDate,
  info,
  className = "",
  compact = false,
}: Props) {
  const status = info ?? getExpiryStatus(expiryDate);
  const label = compact ? COMPACT_LABEL[status.status] || status.label : status.label;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-bold tracking-wide rounded-md whitespace-nowrap ${status.badgeClass} ${className}`}
      title={status.label}
    >
      <span
        className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${
          status.status === "expired"
            ? "bg-danger-text"
            : status.status === "near"
              ? "bg-warning-text"
              : status.status === "fresh"
                ? "bg-success-text"
                : "bg-muted-foreground"
        }`}
      />
      {label}
    </span>
  );
}
