import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  HardHat,
  Store,
  Compass,
  Layers,
  ShoppingBag,
  CalendarRange,
} from "lucide-react";
import useDashboard, { ModuleAnalytics } from "./useHooks";
import { Can } from "@/components/auth/Can";
import Button from "@/components/ui/Button";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";

type DatePreset =
  | "current_month"
  | "ytd"
  | "previous_month"
  | "last_one_year"
  | "custom"
  | "all";

const toInputDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const getPresetRange = (
  preset: DatePreset,
): { startDate: string; endDate: string } | null => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (preset === "all") return null;

  if (preset === "current_month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { startDate: toInputDate(start), endDate: toInputDate(today) };
  }

  if (preset === "ytd") {
    const start = new Date(today.getFullYear(), 0, 1);
    return { startDate: toInputDate(start), endDate: toInputDate(today) };
  }

  if (preset === "previous_month") {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    return { startDate: toInputDate(start), endDate: toInputDate(end) };
  }

  if (preset === "last_one_year") {
    const start = new Date(today);
    start.setFullYear(start.getFullYear() - 1);
    return { startDate: toInputDate(start), endDate: toInputDate(today) };
  }

  return null;
};

const PRESET_OPTIONS: { id: DatePreset; label: string }[] = [
  { id: "current_month", label: "Current Month" },
  { id: "ytd", label: "Year to Date" },
  { id: "previous_month", label: "Previous Month" },
  { id: "last_one_year", label: "Last One Year" },
  { id: "custom", label: "Custom Range" },
  { id: "all", label: "All Time" },
];

const formatCurrency = (value: number) =>
  `PKR ${Math.round(Number(value) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

type MetricCardProps = {
  label: string;
  value: number;
  hint?: string;
  icon: React.ElementType;
  iconClass: string;
  valueClass?: string;
};

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  iconClass,
  valueClass = "text-foreground",
}: MetricCardProps) {
  return (
    <div className="bg-card rounded-xl border border-border-main p-5 flex flex-col justify-between shadow-2xs relative overflow-hidden transition-all duration-300 hover:shadow-xs hover:border-primary/20">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconClass}`}>
        <Icon size={18} className="stroke-[2]" />
      </div>
      <div className="mt-4">
        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">
          {label}
        </span>
        <h3 className={`text-xl font-semibold mt-1.5 tracking-tight ${valueClass}`}>
          {formatCurrency(value)}
        </h3>
        {hint ? (
          <p className="text-[11px] text-muted-foreground mt-1.5">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}

type AnalyticsSectionProps = {
  title: string;
  description: string;
  icon: React.ElementType;
  accentClass: string;
  data: ModuleAnalytics;
  showSale?: boolean;
  loading?: boolean;
};

function AnalyticsSection({
  title,
  description,
  icon: Icon,
  accentClass,
  data,
  showSale = false,
  loading,
}: AnalyticsSectionProps) {
  return (
    <section
      className={`space-y-4 transition-opacity ${loading ? "opacity-60" : ""}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${accentClass}`}
        >
          <Icon size={18} className="stroke-[2]" />
        </div>
        <div>
          <h2 className="text-base font-bold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        </div>
      </div>

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          showSale ? "xl:grid-cols-3 2xl:grid-cols-6" : "xl:grid-cols-5"
        } gap-4`}
      >
        <MetricCard
          label="Total Cash In"
          value={data.totalCashIn}
          icon={ArrowDownCircle}
          iconClass="bg-primary/10 text-primary"
        />
        <MetricCard
          label="Total Cash Out"
          value={data.totalCashOut}
          icon={ArrowUpCircle}
          iconClass="bg-amber-500/10 text-amber-600"
        />
        <MetricCard
          label="Total Cost"
          value={data.totalCost}
          icon={DollarSign}
          iconClass="bg-orange-500/10 text-orange-600"
        />
        <MetricCard
          label="Net Profit"
          value={data.netProfit}
          icon={TrendingUp}
          iconClass="bg-emerald-500/10 text-emerald-600"
          valueClass={data.netProfit > 0 ? "text-emerald-600" : "text-foreground"}
        />
        <MetricCard
          label="Net Loss"
          value={data.netLoss}
          icon={TrendingDown}
          iconClass="bg-red-500/10 text-red-600"
          valueClass={data.netLoss > 0 ? "text-red-600" : "text-foreground"}
        />
        {showSale ? (
          <MetricCard
            label="Total Sale"
            value={data.totalSale ?? 0}
            icon={ShoppingBag}
            iconClass="bg-violet-500/10 text-violet-600"
          />
        ) : null}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const { stats, analytics, getStats, getAnalytics } = useDashboard();

  const [preset, setPreset] = useState<DatePreset>("all");
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    getStats();
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAnalytics = async (startDate?: string, endDate?: string) => {
    setAnalyticsLoading(true);
    try {
      await getAnalytics({
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const applyRange = (startDate: string, endDate: string) => {
    setDraftStartDate(startDate);
    setDraftEndDate(endDate);
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
    loadAnalytics(startDate, endDate);
  };

  const handlePresetClick = (next: DatePreset) => {
    setPreset(next);
    if (next === "custom") return;

    if (next === "all") {
      setDraftStartDate("");
      setDraftEndDate("");
      setAppliedStartDate("");
      setAppliedEndDate("");
      loadAnalytics();
      return;
    }

    const range = getPresetRange(next);
    if (range) {
      applyRange(range.startDate, range.endDate);
    }
  };

  const handleApplyCustom = () => {
    setPreset("custom");
    setAppliedStartDate(draftStartDate);
    setAppliedEndDate(draftEndDate);
    loadAnalytics(draftStartDate || undefined, draftEndDate || undefined);
  };

  const handleResetFilters = () => {
    setPreset("all");
    setDraftStartDate("");
    setDraftEndDate("");
    setAppliedStartDate("");
    setAppliedEndDate("");
    loadAnalytics();
  };

  const empty: ModuleAnalytics = {
    totalCashIn: 0,
    totalCashOut: 0,
    totalCost: 0,
    netProfit: 0,
    netLoss: 0,
    totalSale: 0,
  };

  const construction = analytics?.construction ?? empty;
  const shop = analytics?.shop ?? empty;
  const design = analytics?.design ?? empty;
  const consolidation = analytics?.consolidation ?? empty;

  const hasDateFilter = !!(appliedStartDate || appliedEndDate);
  const rangeLabel = hasDateFilter
    ? `${appliedStartDate || "…"} → ${appliedEndDate || "…"}`
    : "All time";

  return (
    <div className="space-y-10 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-[32px] text-foreground font-semibold tracking-tight mb-1">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Financial overview across Construction, Shop, and Design.
          </p>
        </div>
      </div>

      {/* Shared filters — single line */}
      <div className="bg-card border border-border-main rounded-xl px-3 py-2.5 shadow-2xs animate-fade-in">
        <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-1.5 shrink-0 pr-2 border-r border-border-main mr-1">
            <CalendarRange size={14} className="text-primary shrink-0" />
            <span className="text-xs font-bold text-foreground">Date Filters</span>
            <span className="text-[10px] text-muted-foreground">({rangeLabel})</span>
          </div>

          {PRESET_OPTIONS.map((option) => {
            const active = preset === option.id;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => handlePresetClick(option.id)}
                disabled={analyticsLoading}
                className={`h-8 px-2.5 rounded-md text-[11px] font-semibold border transition-all cursor-pointer disabled:opacity-50 shrink-0 ${
                  active
                    ? "bg-primary text-white border-primary shadow-sm"
                    : "bg-muted-foreground/5 text-foreground border-border-main hover:border-primary/40"
                }`}
              >
                {option.label}
              </button>
            );
          })}

          <div className="h-5 w-px bg-border-main shrink-0 mx-0.5" />

          <label
            htmlFor="analytics-start-date"
            className="text-[11px] text-foreground font-medium shrink-0"
          >
            Start
          </label>
          <input
            id="analytics-start-date"
            type="date"
            value={draftStartDate}
            max={draftEndDate || undefined}
            onChange={(e) => {
              setDraftStartDate(e.target.value);
              setPreset("custom");
            }}
            className="common-input text-xs h-8 w-[132px] shrink-0 py-0"
          />

          <label
            htmlFor="analytics-end-date"
            className="text-[11px] text-foreground font-medium shrink-0"
          >
            End
          </label>
          <input
            id="analytics-end-date"
            type="date"
            value={draftEndDate}
            min={draftStartDate || undefined}
            onChange={(e) => {
              setDraftEndDate(e.target.value);
              setPreset("custom");
            }}
            className="common-input text-xs h-8 w-[132px] shrink-0 py-0"
          />

          <Button
            variant="primary"
            onClick={handleApplyCustom}
            disabled={analyticsLoading}
            className="h-8 text-[11px] px-3 font-semibold shrink-0 !py-0"
          >
            Apply
          </Button>
          <Button
            variant="secondary"
            onClick={handleResetFilters}
            disabled={analyticsLoading}
            className="h-8 text-[11px] px-3 font-semibold shrink-0 !py-0"
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="space-y-10 animate-fade-in">
        <AnalyticsSection
          title="Construction Analytics"
          description={`Cashflow metrics for the selected date range (${rangeLabel}).`}
          icon={HardHat}
          accentClass="bg-primary/10 text-primary"
          data={construction}
          loading={analyticsLoading}
        />

        <AnalyticsSection
          title="Shop Analytics"
          description={`Sales, purchases, and fixed costs for the selected date range (${rangeLabel}).`}
          icon={Store}
          accentClass="bg-amber-500/10 text-amber-600"
          data={shop}
          showSale
          loading={analyticsLoading}
        />

        <AnalyticsSection
          title="Design Analytics"
          description={`Design cashflow and client contracts for the selected date range (${rangeLabel}).`}
          icon={Compass}
          accentClass="bg-sky-500/10 text-sky-600"
          data={design}
          showSale
          loading={analyticsLoading}
        />

        <div className="rounded-2xl border border-primary/20 bg-primary/[0.03] p-4 sm:p-6 space-y-4">
          <AnalyticsSection
            title="Consolidation"
            description="Combined totals of Construction, Shop, and Design analytics."
            icon={Layers}
            accentClass="bg-primary text-white"
            data={consolidation}
            loading={analyticsLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in">
        {[
          {
            label: "Total Projects",
            value: stats?.totalProjects,
            icon: Building2,
            color: "text-primary",
            bg: "bg-primary/10",
            link: "/projects",
            permission: PERMISSIONS.CONSTRUCTION_SITE_READ,
          },
          {
            label: "Total Vendors",
            value: stats?.totalVendors,
            icon: Users,
            color: "text-amber-600",
            bg: "bg-amber-500/10",
            link: "/vendors",
            permission: PERMISSIONS.VENDORS_READ,
          },
        ].map(({ label, value, icon: Icon, color, bg, link, permission }) => (
          <Can key={label} permission={permission}>
            <Link
              to={link}
              className="bg-card rounded-xl border border-border-main p-5 shadow-2xs hover:shadow-xs hover:border-primary/20 transition-all duration-300 flex items-center gap-4 group"
            >
              <div
                className={`w-11 h-11 ${bg} rounded-lg flex items-center justify-center ${color} shrink-0`}
              >
                <Icon size={20} className="stroke-[2]" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  {label}
                </p>
                <p className="text-xl font-bold text-foreground mt-0.5">
                  {value ?? 0}
                </p>
              </div>
            </Link>
          </Can>
        ))}
      </div>
    </div>
  );
}
