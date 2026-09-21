import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  FileText,
  MessageSquare,
} from "lucide-react";
import { getFilePathWithBackendUrl } from "@/utils/helpers/common/http-methods";
import useComments from "../../comments/useHooks";

type TimelineProps = {
  projectId: string;
  cashflowsIn?: any[];
  cashflowsOut?: any[];
};

type TimelineEvent = {
  id: string;
  type: "CASH IN" | "CASH OUT" | "COMMENT";
  occurredAt: Date;
  dateKey: string;
  data: any;
};

const formatMoney = (value?: number | string | null) => {
  const amount = Number(value);
  if (value === null || value === undefined || Number.isNaN(amount)) {
    return "PKR 0";
  }
  return `PKR ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const parseDate = (value?: string | Date | null) => {
  if (!value) return null;
  if (typeof value === "string") {
    const dateOnly = value.slice(0, 10);
    if (
      /^\d{4}-\d{2}-\d{2}$/.test(dateOnly) &&
      (value.length === 10 || /T00:00:00/.test(value))
    ) {
      const [year, month, day] = dateOnly.split("-").map(Number);
      return new Date(year, month - 1, day);
    }
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const dateKeyFrom = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatHeadingDate = (key: string) => {
  if (key === "unknown") return "Date not recorded";
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const Field = ({ label, value }: { label: string; value?: ReactNode }) => {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="text-sm font-semibold text-foreground mt-0.5 break-words">
        {value}
      </p>
    </div>
  );
};

export default function ProjectTimeline({
  projectId,
  cashflowsIn = [],
  cashflowsOut = [],
}: TimelineProps) {
  const { fetchCommentsPage } = useComments();
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    if (!projectId) return;
    fetchCommentsPage(projectId, { offset: 0, limit: 200 }).then(({ data }) => {
      setComments(Array.isArray(data) ? data : []);
    });
  }, [projectId]);

  const events = useMemo<TimelineEvent[]>(() => {
    const inEvents: TimelineEvent[] = cashflowsIn.map((item) => {
      const occurredAt =
        parseDate(item.entryDate) || parseDate(item.created_at) || new Date(0);
      return {
        id: `in-${item.id}`,
        type: "CASH IN",
        occurredAt,
        dateKey: dateKeyFrom(occurredAt),
        data: item,
      };
    });

    const outEvents: TimelineEvent[] = cashflowsOut.map((item) => {
      const occurredAt =
        parseDate(item.entryDate) || parseDate(item.created_at) || new Date(0);
      return {
        id: `out-${item.id}`,
        type: "CASH OUT",
        occurredAt,
        dateKey: dateKeyFrom(occurredAt),
        data: item,
      };
    });

    const commentEvents: TimelineEvent[] = comments
      .filter((item) => !item.isDeleted && !item.deleted_at)
      .map((item) => {
        const occurredAt = parseDate(item.created_at) || new Date(0);
        return {
          id: `comment-${item.id}`,
          type: "COMMENT",
          occurredAt,
          dateKey: dateKeyFrom(occurredAt),
          data: item,
        };
      });

    return [...inEvents, ...outEvents, ...commentEvents].sort(
      (a, b) => a.occurredAt.getTime() - b.occurredAt.getTime(),
    );
  }, [cashflowsIn, cashflowsOut, comments]);

  const grouped = useMemo(() => {
    const map = new Map<string, TimelineEvent[]>();
    for (const event of events) {
      const list = map.get(event.dateKey) || [];
      list.push(event);
      map.set(event.dateKey, list);
    }
    return Array.from(map.entries());
  }, [events]);

  const totalIn = cashflowsIn.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const totalOut = cashflowsOut.reduce(
    (sum, item) => sum + Number(item.amount || 0) * Number(item.quantity || 1),
    0,
  );
  const vendors = Array.from(
    new Set(
      cashflowsOut
        .map((item) => item.vendor?.vendorName)
        .filter(Boolean),
    ),
  );

  return (
    <div className="bg-card border border-border-main rounded-xl p-6 shadow-xs">
      <div>
        <h2 className="text-xl font-bold text-foreground">Project Timeline</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          Chronological record of cash in, cash out, vendors, activities, and project updates.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
        <div className="rounded-xl border border-border-main bg-panel-bg p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Cash In
          </p>
          <p className="text-lg font-bold text-success-text mt-1">{formatMoney(totalIn)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {cashflowsIn.length} installment{cashflowsIn.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="rounded-xl border border-border-main bg-panel-bg p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Total Cash Out
          </p>
          <p className="text-lg font-bold text-warning-text mt-1">{formatMoney(totalOut)}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {cashflowsOut.length} payment{cashflowsOut.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="rounded-xl border border-border-main bg-panel-bg p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Vendors Paid
          </p>
          <p className="text-lg font-bold text-foreground mt-1">{vendors.length}</p>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
            {vendors.length ? vendors.join(", ") : "No vendor payments yet"}
          </p>
        </div>
      </div>

      <hr className="border-border-main my-5" />

      {grouped.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No timeline activity has been recorded for this project yet.
        </p>
      ) : (
        <div className="space-y-8">
          {grouped.map(([key, dayEvents]) => {
            const dayIn = dayEvents
              .filter((event) => event.type === "CASH IN")
              .reduce((sum, event) => sum + Number(event.data.amount || 0), 0);
            const dayOut = dayEvents
              .filter((event) => event.type === "CASH OUT")
              .reduce(
                (sum, event) =>
                  sum + Number(event.data.amount || 0) * Number(event.data.quantity || 1),
                0,
              );

            return (
              <div key={key} className="relative pl-6">
                <div className="absolute left-0 top-1.5 h-3 w-3 rounded-full bg-primary" />
                <div className="absolute left-[5px] top-5 bottom-0 w-px bg-border-main" />

                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-1 mb-4">
                  <h3 className="text-sm font-bold text-foreground">
                    {formatHeadingDate(key)}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    In {formatMoney(dayIn)} · Out {formatMoney(dayOut)}
                  </p>
                </div>

                <div className="space-y-3">
                  {dayEvents.map((event) => {
                    if (event.type === "CASH IN") {
                      const receiptUrl = event.data.media?.url
                        ? getFilePathWithBackendUrl(event.data.media.url)
                        : "";
                      return (
                        <div
                          key={event.id}
                          className="rounded-xl border border-success-text/20 bg-success-bg/40 p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <ArrowDownCircle size={18} className="text-success-text" />
                              <span className="text-sm font-bold text-success-text">
                                Cash In
                              </span>
                            </div>
                            <span className="text-sm font-bold text-success-text">
                              {formatMoney(event.data.amount)}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <Field label="Installment" value={event.data.installment} />
                            <Field label="Entered By" value={event.data.enteredBy} />
                            <Field label="Source of Payment" value={event.data.paymentSource} />
                            <Field label="Cheque No" value={event.data.chequeNo} />
                            <Field label="Transaction ID" value={event.data.transactionId} />
                            {receiptUrl ? (
                              <Field
                                label="Receipt"
                                value={
                                  <a
                                    href={receiptUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                  >
                                    <FileText size={14} />
                                    View Receipt
                                  </a>
                                }
                              />
                            ) : null}
                          </div>
                        </div>
                      );
                    }

                    if (event.type === "CASH OUT") {
                      const quantity = Number(event.data.quantity || 1);
                      const unitPrice = Number(event.data.amount || 0);
                      const total = unitPrice * quantity;
                      const receiptUrl = event.data.media?.url
                        ? getFilePathWithBackendUrl(event.data.media.url)
                        : "";
                      return (
                        <div
                          key={event.id}
                          className="rounded-xl border border-warning-text/20 bg-warning-bg/40 p-4 space-y-3"
                        >
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <ArrowUpCircle size={18} className="text-warning-text" />
                              <span className="text-sm font-bold text-warning-text">
                                Cash Out
                              </span>
                            </div>
                            <span className="text-sm font-bold text-warning-text">
                              {formatMoney(total)}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            <Field label="Vendor" value={event.data.vendor?.vendorName} />
                            <Field
                              label="Activity"
                              value={
                                event.data.activity?.workStage
                                  ? `${event.data.activity?.name || "--"} (${event.data.activity.workStage})`
                                  : event.data.activity?.name
                              }
                            />
                            <Field label="Item / Description" value={event.data.items} />
                            <Field label="Category" value={event.data.category} />
                            <Field
                              label="Quantity"
                              value={
                                event.data.quantity
                                  ? `${event.data.quantity}${event.data.uom ? ` ${event.data.uom}` : ""}`
                                  : undefined
                              }
                            />
                            <Field label="Price (Per Item)" value={formatMoney(unitPrice)} />
                            <Field label="Entered By" value={event.data.enteredBy} />
                            <Field label="Source of Payment" value={event.data.paymentSource} />
                            <Field label="Cheque No" value={event.data.chequeNo} />
                            <Field label="Transaction ID" value={event.data.transactionId} />
                            {receiptUrl ? (
                              <Field
                                label="Receipt"
                                value={
                                  <a
                                    href={receiptUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                  >
                                    <FileText size={14} />
                                    View Receipt
                                  </a>
                                }
                              />
                            ) : null}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={event.id}
                        className="rounded-xl border border-border-main bg-panel-bg p-4"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare size={16} className="text-primary" />
                          <span className="text-sm font-bold text-foreground">Update</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-1">
                          {event.data.user?.fullName || event.data.user?.email || "User"}
                        </p>
                        <p className="text-sm text-foreground whitespace-pre-wrap">
                          {event.data.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
