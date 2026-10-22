import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  ArrowUpRight,
  ArrowRight,
  HardHat,
  Store,
  Compass,
  Layers,
  ShoppingBag,
  CalendarRange,
  RefreshCw,
  Sparkles,
  Percent,
  Wallet,
  Activity,
  Calendar,
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

type ModuleTab = "all" | "construction" | "shop" | "design";

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
  { id: "previous_month", label: "Prev Month" },
  { id: "last_one_year", label: "Last 1 Year" },
  { id: "all", label: "All Time" },
  { id: "custom", label: "Custom Range" },
];

const formatCurrency = (value: number) =>
  Math.round(Number(value) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

type MetricCardProps = {
  label: string;
  value: number;
  hint?: string;
  icon: React.ElementType;
  iconBgClass: string;
  iconColorClass: string;
  accentBorderClass?: string;
  trendType?: "positive" | "negative" | "neutral";
  badgeText?: string;
  loading?: boolean;
};

function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  iconBgClass,
  iconColorClass,
  accentBorderClass = "hover:border-primary/40",
  trendType = "neutral",
  badgeText,
  loading = false,
}: MetricCardProps) {
  return (
    <div
      className={`group relative bg-card/80 backdrop-blur-xs rounded-xl border border-border-main p-4.5 sm:p-5 flex flex-col justify-between shadow-2xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${accentBorderClass} overflow-hidden`}
    >
      {/* Subtle top ambient highlight */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between gap-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 shadow-2xs ${iconBgClass} ${iconColorClass}`}
        >
          <Icon size={19} className="stroke-[2.2]" />
        </div>

        {badgeText ? (
          <span
            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border tracking-wide uppercase ${
              trendType === "positive"
                ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:text-emerald-400"
                : trendType === "negative"
                ? "bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400"
                : "bg-muted-foreground/10 text-muted-foreground border-border-main"
            }`}
          >
            {badgeText}
          </span>
        ) : null}
      </div>

      <div className="mt-4">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
          {label}
        </span>

        {loading ? (
          <div className="h-7 w-32 bg-muted-foreground/10 rounded-md animate-pulse mt-1.5" />
        ) : (
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xs font-semibold text-muted-foreground">PKR</span>
            <h3
              className={`text-xl sm:text-2xl font-bold tracking-tight ${
                trendType === "positive"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : trendType === "negative"
                  ? "text-red-600 dark:text-red-400"
                  : "text-foreground"
              }`}
            >
              {formatCurrency(value)}
            </h3>
          </div>
        )}

        {hint ? (
          <p className="text-[11px] text-muted-foreground/80 mt-1.5 font-medium line-clamp-1">
            {hint}
          </p>
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
  badge: string;
  quickLink?: { text: string; to: string };
  data: ModuleAnalytics;
  showSale?: boolean;
  loading?: boolean;
};

function AnalyticsSection({
  title,
  description,
  icon: Icon,
  accentClass,
  badge,
  quickLink,
  data,
  showSale = false,
  loading,
}: AnalyticsSectionProps) {
  const isProfitable = data.netProfit > 0;
  const hasLoss = data.netLoss > 0;

  return (
    <div className="bg-card rounded-2xl border border-border-main p-5 sm:p-6 shadow-2xs space-y-5 transition-all duration-300 hover:shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-border-main/60">
        <div className="flex items-center gap-3.5">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${accentClass}`}
          >
            <Icon size={20} className="stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                {title}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-muted-foreground/10 text-muted-foreground uppercase tracking-wider">
                {badge}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          </div>
        </div>

        {quickLink ? (
          <Link
            to={quickLink.to}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors group/link self-start sm:self-center"
          >
            <span>{quickLink.text}</span>
            <ArrowRight
              size={14}
              className="group-hover/link:translate-x-0.5 transition-transform"
            />
          </Link>
        ) : null}
      </div>

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          showSale ? "xl:grid-cols-3 2xl:grid-cols-6" : "xl:grid-cols-5"
        } gap-3.5 sm:gap-4`}
      >
        {showSale ? (
          <MetricCard
            label="Total Gross Sale"
            value={data.totalSale ?? 0}
            icon={ShoppingBag}
            iconBgClass="bg-violet-500/10"
            iconColorClass="text-violet-600 dark:text-violet-400"
            accentBorderClass="hover:border-violet-500/40"
            hint="Gross billing & contract volume"
            badgeText="Revenue"
            loading={loading}
          />
        ) : null}

        <MetricCard
          label="Total Cash In"
          value={data.totalCashIn}
          icon={ArrowDownCircle}
          iconBgClass="bg-primary/10"
          iconColorClass="text-primary dark:text-primary/90"
          accentBorderClass="hover:border-primary/40"
          hint="Receipts & cash collected"
          badgeText="Inflow"
          loading={loading}
        />

        <MetricCard
          label="Total Cash Out"
          value={data.totalCashOut}
          icon={ArrowUpCircle}
          iconBgClass="bg-amber-500/10"
          iconColorClass="text-amber-600 dark:text-amber-400"
          accentBorderClass="hover:border-amber-500/40"
          hint="Actual capital paid out"
          badgeText="Disbursed"
          loading={loading}
        />

        <MetricCard
          label="Total Committed Cost"
          value={data.totalCost}
          icon={DollarSign}
          iconBgClass="bg-orange-500/10"
          iconColorClass="text-orange-600 dark:text-orange-400"
          accentBorderClass="hover:border-orange-500/40"
          hint="Paid + unpaid obligations"
          badgeText="Liabilities"
          loading={loading}
        />

        <MetricCard
          label="Net Operating Profit"
          value={data.netProfit}
          icon={TrendingUp}
          iconBgClass="bg-emerald-500/10"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
          accentBorderClass="hover:border-emerald-500/40"
          trendType={isProfitable ? "positive" : "neutral"}
          hint="Net operational surplus"
          badgeText={isProfitable ? "+ Surplus" : "Zero"}
          loading={loading}
        />

        <MetricCard
          label="Net Deficit / Loss"
          value={data.netLoss}
          icon={TrendingDown}
          iconBgClass="bg-red-500/10"
          iconColorClass="text-red-600 dark:text-red-400"
          accentBorderClass="hover:border-red-500/40"
          trendType={hasLoss ? "negative" : "neutral"}
          hint="Net cash deficit"
          badgeText={hasLoss ? "- Deficit" : "Zero"}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { stats, analytics, getStats, getAnalytics } = useDashboard();

  const [preset, setPreset] = useState<DatePreset>("all");
  const [activeTab, setActiveTab] = useState<ModuleTab>("all");
  const [draftStartDate, setDraftStartDate] = useState("");
  const [draftEndDate, setDraftEndDate] = useState("");
  const [appliedStartDate, setAppliedStartDate] = useState("");
  const [appliedEndDate, setAppliedEndDate] = useState("");
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  useEffect(() => {
    handleRefresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRefresh = async () => {
    setAnalyticsLoading(true);
    try {
      await Promise.all([
        getStats(),
        loadAnalytics(appliedStartDate || undefined, appliedEndDate || undefined),
      ]);
    } finally {
      setAnalyticsLoading(false);
    }
  };

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
    ? `${appliedStartDate || "Start"} → ${appliedEndDate || "Present"}`
    : "All Time";

  // Financial ratios & metrics
  const financialSummary = useMemo(() => {
    const totalIn = consolidation.totalCashIn || 0;
    const totalOut = consolidation.totalCashOut || 0;
    const combinedFlow = totalIn + totalOut;
    const inPercent = combinedFlow > 0 ? Math.round((totalIn / combinedFlow) * 100) : 50;
    const outPercent = combinedFlow > 0 ? 100 - inPercent : 50;

    const netProfitMargin =
      totalIn > 0 && consolidation.netProfit > 0
        ? ((consolidation.netProfit / totalIn) * 100).toFixed(1)
        : null;

    const totalGrossSales = (shop.totalSale || 0) + (design.totalSale || 0);

    return {
      inPercent,
      outPercent,
      netProfitMargin,
      totalGrossSales,
    };
  }, [consolidation, shop, design]);

  return (
    <div className="space-y-7 pb-10">
      {/* 1. Executive Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-in">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
              Executive Dashboard
            </h1>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Live Telemetry</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Consolidated fiscal metrics and cashflow across Construction, Shop, and Design operations.
          </p>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border-main text-xs font-medium text-muted-foreground shadow-2xs">
            <Calendar size={14} className="text-primary" />
            <span className="text-foreground font-semibold">{rangeLabel}</span>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={analyticsLoading}
            leftIcon={
              <RefreshCw
                size={14}
                className={`transition-transform ${
                  analyticsLoading ? "animate-spin text-primary" : ""
                }`}
              />
            }
            className="shadow-2xs text-xs font-semibold"
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 2. Interactive Date Control Hub */}
      <div className="bg-card rounded-2xl border border-border-main p-3 sm:p-4 shadow-2xs animate-fade-in">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Preset Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            <div className="flex items-center gap-1.5 pr-2 mr-1 border-r border-border-main shrink-0">
              <CalendarRange size={15} className="text-primary" />
              <span className="text-xs font-bold text-foreground">Time Horizon</span>
            </div>

            {PRESET_OPTIONS.map((option) => {
              const active = preset === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handlePresetClick(option.id)}
                  disabled={analyticsLoading}
                  className={`h-8 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 shrink-0 ${
                    active
                      ? "bg-primary text-white shadow-xs font-bold"
                      : "bg-muted-foreground/5 hover:bg-muted-foreground/10 text-muted-foreground hover:text-foreground border border-border-main/70"
                  }`}
                >
                  {option.label}
                </button>
              );
            })}
          </div>

          {/* Custom Date Inputs */}
          <div className="flex items-center gap-2 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-border-main/50">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground">From</span>
              <input
                id="analytics-start-date"
                type="date"
                value={draftStartDate}
                max={draftEndDate || undefined}
                onChange={(e) => {
                  setDraftStartDate(e.target.value);
                  setPreset("custom");
                }}
                className="common-input text-xs h-8.5 w-[136px] py-1 px-2.5 font-medium"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-muted-foreground">To</span>
              <input
                id="analytics-end-date"
                type="date"
                value={draftEndDate}
                min={draftStartDate || undefined}
                onChange={(e) => {
                  setDraftEndDate(e.target.value);
                  setPreset("custom");
                }}
                className="common-input text-xs h-8.5 w-[136px] py-1 px-2.5 font-medium"
              />
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={handleApplyCustom}
              disabled={analyticsLoading || (!draftStartDate && !draftEndDate)}
              className="h-8.5 text-xs px-3 font-semibold shadow-xs"
            >
              Apply
            </Button>

            {hasDateFilter ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                disabled={analyticsLoading}
                className="h-8.5 text-xs px-2.5 text-muted-foreground hover:text-foreground"
              >
                Reset
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      {/* 3. Executive Consolidated Snapshot (HERO SECTION) */}
      <div className="relative rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/[0.08] via-card to-card p-5 sm:p-7 shadow-xs overflow-hidden animate-fade-in">
        {/* Decorative corner glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Hero Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-main/70">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center shadow-md shadow-primary/20">
                <Layers size={22} className="stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight">
                    Consolidated Financial Overview
                  </h2>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 uppercase tracking-wider">
                    Unified
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Aggregate fiscal health across Construction, Shop, and Design ({rangeLabel}).
                </p>
              </div>
            </div>

            {/* Profitability Status Pill */}
            <div className="flex items-center gap-2 self-start sm:self-center">
              {consolidation.netProfit > 0 ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-2xs">
                  <TrendingUp size={16} className="stroke-[2.5]" />
                  <span>Profitable Position</span>
                  {financialSummary.netProfitMargin ? (
                    <span className="text-[11px] font-semibold opacity-90">
                      ({financialSummary.netProfitMargin}% margin)
                    </span>
                  ) : null}
                </div>
              ) : consolidation.netLoss > 0 ? (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-bold shadow-2xs">
                  <TrendingDown size={16} className="stroke-[2.5]" />
                  <span>Net Deficit Outflow</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-muted-foreground/10 text-muted-foreground text-xs font-semibold">
                  <Activity size={15} />
                  <span>Break-Even</span>
                </div>
              )}
            </div>
          </div>

          {/* Core Consolidated Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Cash In */}
            <div className="bg-card/90 backdrop-blur-xs rounded-xl border border-border-main p-4.5 shadow-2xs transition-all hover:border-primary/40 hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total Cash In
                </span>
                <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <ArrowDownCircle size={17} className="stroke-[2.2]" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-semibold text-muted-foreground">PKR</span>
                  <span className="text-2xl font-extrabold text-foreground tracking-tight">
                    {formatCurrency(consolidation.totalCashIn)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-main/50 text-[11px]">
                  <span className="text-muted-foreground font-medium">Inflow Volume</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                    {financialSummary.inPercent}% of Flow
                  </span>
                </div>
              </div>
            </div>

            {/* Total Cash Out */}
            <div className="bg-card/90 backdrop-blur-xs rounded-xl border border-border-main p-4.5 shadow-2xs transition-all hover:border-amber-500/40 hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total Cash Out
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <ArrowUpCircle size={17} className="stroke-[2.2]" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-semibold text-muted-foreground">PKR</span>
                  <span className="text-2xl font-extrabold text-foreground tracking-tight">
                    {formatCurrency(consolidation.totalCashOut)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-main/50 text-[11px]">
                  <span className="text-muted-foreground font-medium">Outflow Ratio</span>
                  <span className="text-amber-600 dark:text-amber-400 font-bold">
                    {financialSummary.outPercent}% of Flow
                  </span>
                </div>
              </div>
            </div>

            {/* Net Financial Result */}
            <div
              className={`bg-card/90 backdrop-blur-xs rounded-xl border p-4.5 shadow-2xs transition-all hover:-translate-y-0.5 ${
                consolidation.netProfit > 0
                  ? "border-emerald-500/30 hover:border-emerald-500/60"
                  : consolidation.netLoss > 0
                  ? "border-red-500/30 hover:border-red-500/60"
                  : "border-border-main hover:border-primary/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  {consolidation.netLoss > 0 ? "Net Financial Loss" : "Net Operating Profit"}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    consolidation.netProfit > 0
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : consolidation.netLoss > 0
                      ? "bg-red-500/10 text-red-600 dark:text-red-400"
                      : "bg-muted-foreground/10 text-muted-foreground"
                  }`}
                >
                  {consolidation.netLoss > 0 ? (
                    <TrendingDown size={17} className="stroke-[2.2]" />
                  ) : (
                    <TrendingUp size={17} className="stroke-[2.2]" />
                  )}
                </div>
              </div>
              <div className="mt-2.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-semibold text-muted-foreground">PKR</span>
                  <span
                    className={`text-2xl font-extrabold tracking-tight ${
                      consolidation.netProfit > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : consolidation.netLoss > 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-foreground"
                    }`}
                  >
                    {formatCurrency(
                      consolidation.netLoss > 0
                        ? consolidation.netLoss
                        : consolidation.netProfit,
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-main/50 text-[11px]">
                  <span className="text-muted-foreground font-medium">Bottom Line</span>
                  <span
                    className={`font-bold ${
                      consolidation.netProfit > 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : consolidation.netLoss > 0
                        ? "text-red-600 dark:text-red-400"
                        : "text-muted-foreground"
                    }`}
                  >
                    {consolidation.netProfit > 0
                      ? "Positive Return"
                      : consolidation.netLoss > 0
                      ? "Deficit Outflow"
                      : "Balanced"}
                  </span>
                </div>
              </div>
            </div>

            {/* Total Committed Cost */}
            <div className="bg-card/90 backdrop-blur-xs rounded-xl border border-border-main p-4.5 shadow-2xs transition-all hover:border-orange-500/40 hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total Committed Cost
                </span>
                <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <DollarSign size={17} className="stroke-[2.2]" />
                </div>
              </div>
              <div className="mt-2.5">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-semibold text-muted-foreground">PKR</span>
                  <span className="text-2xl font-extrabold text-foreground tracking-tight">
                    {formatCurrency(consolidation.totalCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-border-main/50 text-[11px]">
                  <span className="text-muted-foreground font-medium">Obligations</span>
                  <span className="text-orange-600 dark:text-orange-400 font-bold">
                    Paid + Unpaid
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Cashflow Inflow vs Outflow Visual Gauge */}
          <div className="bg-card/70 rounded-xl border border-border-main/70 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                <span className="font-semibold text-foreground">Cash Inflow: {financialSummary.inPercent}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Cash Outflow: {financialSummary.outPercent}%</span>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              </div>
            </div>

            {/* Two-tone percentage bar */}
            <div className="w-full h-3 bg-muted-foreground/10 rounded-full overflow-hidden flex">
              <div
                style={{ width: `${financialSummary.inPercent}%` }}
                className="bg-primary h-full transition-all duration-500 relative group cursor-pointer"
                title={`Cash Inflow: ${financialSummary.inPercent}%`}
              />
              <div
                style={{ width: `${financialSummary.outPercent}%` }}
                className="bg-amber-500 h-full transition-all duration-500 relative group cursor-pointer"
                title={`Cash Outflow: ${financialSummary.outPercent}%`}
              />
            </div>

            {/* Vertical Contribution Breakdown */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>
                  <strong className="text-foreground">Construction:</strong>{" "}
                  PKR {formatCurrency(construction.totalCashIn)}
                </span>
                <span>
                  <strong className="text-foreground">Shop:</strong>{" "}
                  PKR {formatCurrency(shop.totalCashIn)}
                </span>
                <span>
                  <strong className="text-foreground">Design:</strong>{" "}
                  PKR {formatCurrency(design.totalCashIn)}
                </span>
              </div>

              {financialSummary.totalGrossSales > 0 ? (
                <div className="inline-flex items-center gap-1.5 font-semibold text-foreground">
                  <ShoppingBag size={13} className="text-violet-500" />
                  <span>Combined Sales: PKR {formatCurrency(financialSummary.totalGrossSales)}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Module View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div>
          <h2 className="text-xl font-extrabold text-foreground tracking-tight">
            Vertical Operations
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Individual operational cashflows and analytics by business module.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-card border border-border-main p-1 rounded-xl shadow-2xs self-start sm:self-auto">
          {[
            { id: "all", label: "All Verticals" },
            { id: "construction", label: "Construction" },
            { id: "shop", label: "Shop" },
            { id: "design", label: "Design" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as ModuleTab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Module Analytics Sections */}
      <div className="space-y-6 animate-fade-in">
        {(activeTab === "all" || activeTab === "construction") && (
          <AnalyticsSection
            title="Construction Analytics"
            description={`Site cashflows and project execution finances (${rangeLabel}).`}
            icon={HardHat}
            accentClass="bg-primary/10 text-primary"
            badge="Site Ops"
            quickLink={{ text: "View Sites", to: "/projects" }}
            data={construction}
            loading={analyticsLoading}
          />
        )}

        {(activeTab === "all" || activeTab === "shop") && (
          <AnalyticsSection
            title="Shop & Retail Analytics"
            description={`Inventory sales, purchase costs, and fixed overheads (${rangeLabel}).`}
            icon={Store}
            accentClass="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            badge="Retail & Stock"
            quickLink={{ text: "View Sales", to: "/sales" }}
            data={shop}
            showSale
            loading={analyticsLoading}
          />
        )}

        {(activeTab === "all" || activeTab === "design") && (
          <AnalyticsSection
            title="Design Studio Analytics"
            description={`Architectural contracts and client cashflow accounts (${rangeLabel}).`}
            icon={Compass}
            accentClass="bg-sky-500/10 text-sky-600 dark:text-sky-400"
            badge="Studio & Contracts"
            quickLink={{ text: "Design Projects", to: "/design/projects" }}
            data={design}
            showSale
            loading={analyticsLoading}
          />
        )}
      </div>

      {/* 6. Operational Telemetry & Quick Catalogs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in pt-2">
        <Can permission={PERMISSIONS.CONSTRUCTION_SITE_READ}>
          <Link
            to="/projects"
            className="group relative bg-card rounded-2xl border border-border-main p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-primary/40 transition-all duration-300 flex items-center justify-between overflow-hidden"
          >
            {/* Watermark Icon */}
            <Building2
              size={120}
              className="absolute -right-6 -bottom-6 text-foreground/[0.03] group-hover:text-primary/[0.07] transition-all duration-500 pointer-events-none stroke-[1]"
            />

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-13 h-13 rounded-xl bg-primary/10 text-primary flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs">
                <Building2 size={24} className="stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Active Site Projects
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground mt-0.5 tracking-tight">
                  {stats?.totalProjects ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Construction sites registered in portfolio
                </p>
              </div>
            </div>

            <div className="w-9 h-9 rounded-full bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white transition-all flex items-center justify-center shrink-0 relative z-10">
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </Can>

        <Can permission={PERMISSIONS.VENDORS_READ}>
          <Link
            to="/vendors"
            className="group relative bg-card rounded-2xl border border-border-main p-5 sm:p-6 shadow-2xs hover:shadow-md hover:border-amber-500/40 transition-all duration-300 flex items-center justify-between overflow-hidden"
          >
            {/* Watermark Icon */}
            <Users
              size={120}
              className="absolute -right-6 -bottom-6 text-foreground/[0.03] group-hover:text-amber-500/[0.07] transition-all duration-500 pointer-events-none stroke-[1]"
            />

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-13 h-13 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center transition-transform group-hover:scale-105 shadow-2xs">
                <Users size={24} className="stroke-[2.2]" />
              </div>
              <div>
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Supply Chain Vendors
                </span>
                <p className="text-2xl sm:text-3xl font-extrabold text-foreground mt-0.5 tracking-tight">
                  {stats?.totalVendors ?? 0}
                </p>
                <p className="text-xs text-muted-foreground mt-1 font-medium">
                  Active suppliers and service contractors
                </p>
              </div>
            </div>

            <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all flex items-center justify-center shrink-0 relative z-10">
              <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </Can>
      </div>
    </div>
  );
}
