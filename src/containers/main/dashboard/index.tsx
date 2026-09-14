import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  Target,
  Activity,
  ChevronRight,
  ArrowDownCircle,
  ArrowUpCircle,
} from "lucide-react";
import useDashboard from "./useHooks";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";

export default function Dashboard() {
  const { stats, getStats } = useDashboard();

  useEffect(() => {
    getStats();
  }, []);

  const formatCurrency = (value: number) => {
    return `PKR ${Number(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date: string | Date) => {
    try {
      return new Date(date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const netProfit = stats?.netProfit ?? 0;
  const netIsPositive = netProfit >= 0;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-[32px] text-foreground font-semibold tracking-tight mb-1">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Overview of ongoing projects, financial summary, and performance
            metrics.
          </p>
        </div>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
        {/* Card 1: Total Revenue */}
        <div className="bg-card rounded-xl border border-border-main p-6 flex flex-col justify-between shadow-2xs relative overflow-hidden transition-all duration-300 hover:shadow-xs hover:border-primary/20">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <Wallet size={20} className="stroke-[2]" />
            </div>
          </div>
          <div className="mt-6">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">
              Total Revenue (IN)
            </span>
            <h2 className="text-2xl font-semibold text-foreground mt-1.5 tracking-tight">
              {formatCurrency(stats?.totalRevenue ?? 0)}
            </h2>
          </div>
          <div className="h-1.5 w-full bg-muted-foreground/10 rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-foreground rounded-full w-full" />
          </div>
        </div>

        {/* Card 2: Total Costs */}
        <div className="bg-card rounded-xl border border-border-main p-6 flex flex-col justify-between shadow-2xs relative overflow-hidden transition-all duration-300 hover:shadow-xs hover:border-primary/20">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-600">
              <DollarSign size={20} className="stroke-[2]" />
            </div>
          </div>
          <div className="mt-6">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">
              Total Costs (OUT)
            </span>
            <h2 className="text-2xl font-semibold text-foreground mt-1.5 tracking-tight">
              {formatCurrency(stats?.totalCosts ?? 0)}
            </h2>
          </div>
          <div className="h-1.5 w-full bg-muted-foreground/10 rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-amber-600 rounded-full w-full" />
          </div>
        </div>

        {/* Card 3: Net Profit / Surplus */}
        <div className="bg-card rounded-xl border border-border-main p-6 flex flex-col justify-between shadow-2xs relative overflow-hidden transition-all duration-300 hover:shadow-xs hover:border-primary/20">
          {/* Watermark */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none text-emerald-500">
            <svg
              width="150"
              height="80"
              viewBox="0 0 150 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 75L30 55L60 62L95 28L120 40L145 5"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex items-center justify-between">
            <div
              className={`w-11 h-11 rounded-lg flex items-center justify-center ${netIsPositive ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"}`}
            >
              {netIsPositive ? (
                <TrendingUp size={20} className="stroke-[2]" />
              ) : (
                <TrendingDown size={20} className="stroke-[2]" />
              )}
            </div>
          </div>
          <div className="mt-6 z-10">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">
              Net Profit / Surplus
            </span>
            <h2
              className={`text-2xl font-semibold mt-1.5 tracking-tight ${netIsPositive ? "text-foreground" : "text-red-600"}`}
            >
              {formatCurrency(netProfit)}
            </h2>
          </div>
          <span className="text-[11px] text-muted-foreground italic mt-6 block">
            Net Surplus tracking active
          </span>
        </div>
      </div>

      {/* Summary Count Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
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
          {
            label: "Total Prospects",
            value: stats?.totalProspects,
            icon: Target,
            color: "text-purple-600",
            bg: "bg-purple-500/10",
            link: "/prospects",
            permission: PERMISSIONS.PROSPECT_READ,
          },
          {
            label: "Total Activities",
            value: stats?.totalActivities,
            icon: Activity,
            color: "text-teal-600",
            bg: "bg-teal-500/10",
            link: "/activity",
            permission: PERMISSIONS.ACTIVITY_READ,
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

      {/* Recent Transactions */}
      <div className="bg-card rounded-xl border border-border-main shadow-2xs animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-border-main/60">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Recent Transactions
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Latest cash inflows and outflows for the projects you can access.
            </p>
          </div>
          <Can permission={PERMISSIONS.CASH_FLOW_READ}>
            <Link
              to="/cashflow"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              View All <ChevronRight size={14} />
            </Link>
          </Can>
        </div>

        {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-main">
              <thead className="bg-muted-foreground/5">
                <tr>
                  {[
                    "Date",
                    "Project",
                    "Type",
                    "Description",
                    "Vendor / Client",
                    "Amount",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main bg-card text-foreground">
                {(stats?.recentTransactions || []).map((tx: any) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-muted-foreground/5 transition-colors"
                  >
                    <td className="table-td text-muted-foreground text-xs">
                      {formatDate(tx.date)}
                    </td>
                    <td className="table-td font-semibold text-xs">
                      {tx.project}
                    </td>
                    <td className="table-td">
                      <span
                        className={`inline-flex items-center gap-1 font-bold text-[10px] tracking-wider px-2 py-0.5 rounded border ${
                          tx.type === "CASH IN"
                            ? "bg-success-bg text-success-text border-success-text/10"
                            : "bg-warning-bg text-warning-text border-warning-text/10"
                        }`}
                      >
                        {tx.type === "CASH IN" ? (
                          <ArrowDownCircle size={10} />
                        ) : (
                          <ArrowUpCircle size={10} />
                        )}
                        {tx.type}
                      </span>
                    </td>
                    <td className="table-td text-muted-foreground text-xs max-w-[180px] truncate">
                      {tx.description}
                    </td>
                    <td className="table-td text-xs">{tx.vendorClient}</td>
                    <td className="table-td font-bold text-right whitespace-nowrap">
                      {formatCurrency(tx.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-10 text-center">
            No transactions recorded yet.
          </p>
        )}
      </div>

      {/* Recent Prospects */}
      <Can permission={PERMISSIONS.PROSPECT_READ}>
      <div className="bg-card rounded-xl border border-border-main shadow-2xs animate-slide-up">
        <div className="flex items-center justify-between p-5 border-b border-border-main/60">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Recent Prospects
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Latest potential customers registered in the system.
            </p>
          </div>
          <Can permission={PERMISSIONS.PROSPECT_READ}>
            <Link
              to="/prospects"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              View All <ChevronRight size={14} />
            </Link>
          </Can>
        </div>

        {stats?.recentProspects && stats.recentProspects.length > 0 ? (
          <div className="divide-y divide-border-main">
            {(stats?.recentProspects || []).map((prospect: any) => {
              const statusColors: Record<string, string> = {
                New: "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400",
                Contacted:
                  "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
                Qualified:
                  "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400",
                Lost: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400",
                Converted:
                  "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400",
              };
              return (
                <div
                  key={prospect.id}
                  className="flex items-center justify-between px-5 py-4 hover:bg-muted-foreground/5 transition-colors"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-bold text-foreground">
                      {prospect.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {prospect.phone || "—"} · {prospect.email || "—"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${statusColors[prospect.status] || "bg-slate-100 text-slate-500"}`}
                    >
                      {prospect.status}
                    </span>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(prospect.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground py-10 text-center">
            No prospects found.
          </p>
        )}
      </div>
      </Can>
    </div>
  );
}
