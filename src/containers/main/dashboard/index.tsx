import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  ChevronRight,
  Briefcase,
} from "lucide-react";
import useDashboard from "./useHooks";

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

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in  ">
        <div>
          <h1 className="text-2xl sm:text-[32px] text-foreground font-semibold tracking-tight mb-1">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Overview of ongoing projects, financial summary, and performance
            metrics.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border-main px-3.5 py-2 rounded-lg shadow-2xs self-start sm:self-auto font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Sync Active
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
            {/* <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30 text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <TrendingUp size={12} />
              100%
            </div> */}
          </div>
          <div className="mt-6">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">
              Total Revenue (IN)
            </span>
            <h2 className="text-2xl font-semibold text-foreground mt-1.5 tracking-tight  ">
              {formatCurrency(stats.totalRevenue)}
            </h2>
          </div>
          <div className="h-1.5 w-full bg-muted-foreground/10 rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-foreground rounded-full w-[100%]" />
          </div>
        </div>

        {/* Card 2: Total Costs */}
        <div className="bg-card rounded-xl border border-border-main p-6 flex flex-col justify-between shadow-2xs relative overflow-hidden transition-all duration-300 hover:shadow-xs hover:border-primary/20">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-600">
              <DollarSign size={20} className="stroke-[2]" />
            </div>
            {/* <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/30 text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <TrendingDown size={12} />
              100%
            </div> */}
          </div>
          <div className="mt-6">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">
              Total Costs (OUT)
            </span>
            <h2 className="text-2xl font-semibold text-foreground mt-1.5 tracking-tight  ">
              {formatCurrency(stats.totalCosts)}
            </h2>
          </div>
          <div className="h-1.5 w-full bg-muted-foreground/10 rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-amber-600 rounded-full w-[100%]" />
          </div>
        </div>

        {/* Card 3: Net Profit / Surplus */}
        <div className="bg-card rounded-xl border border-border-main p-6 flex flex-col justify-between shadow-2xs relative overflow-hidden transition-all duration-300 hover:shadow-xs hover:border-primary/20">
          {/* Watermark Graph Line */}
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
            <div className="w-11 h-11 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-600">
              <TrendingUp size={20} className="stroke-[2]" />
            </div>
            {/* <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30 text-[9px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">
              Live Status
            </div> */}
          </div>
          <div className="mt-6 z-10">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">
              Net Profit / Surplus
            </span>
            <h2 className="text-2xl font-semibold text-foreground mt-1.5 tracking-tight  ">
              {formatCurrency(stats.netProfit)}
            </h2>
          </div>
          <span className="text-[11px] text-muted-foreground italic mt-6 block">
            Net Surplus tracking active
          </span>
        </div>
      </div>

      {/* Main Grid: Projects Progress & Recent Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
        {/* Left Column: Active Projects Track */}
        <div className="bg-card rounded-xl border border-border-main p-4 md:p-6 shadow-2xs lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-border-main/60">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Briefcase size={18} className="text-primary stroke-[2]" />
                Active Projects Progress
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time phase and execution progress across construction
                sites.
              </p>
            </div>
            <Link
              to="/projects"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              View All <ChevronRight size={14} />
            </Link>
          </div>

          {stats.activeProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stats.activeProjects.map((project: any) => (
                <div
                  key={project.id}
                  className="p-4 rounded-lg bg-bg-input border border-border-input hover:border-primary/20 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-foreground text-sm line-clamp-1">
                        {project.siteName}
                      </h4>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-primary/10 text-primary whitespace-nowrap">
                        {project.region}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      {project.subregion}
                    </p>
                  </div>

                  <div className="mt-5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-muted-foreground">
                        {project.status}
                      </span>
                      <span className="font-bold text-foreground">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted-foreground/15 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No active projects found.
            </p>
          )}
        </div>

        {/* Right Column: Recent Vendors Activity */}
        <div className="bg-card rounded-xl border border-border-main p-4 md:p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-border-main/60">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Users size={18} className="text-primary stroke-[2]" />
                Recent Vendor Actions
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Active suppliers and sub-contractors updates.
              </p>
            </div>
            <Link
              to="/vendors"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              View All <ChevronRight size={14} />
            </Link>
          </div>

          {stats.recentVendors.length > 0 ? (
            <div className="space-y-4">
              {stats.recentVendors.map((vendor: any) => (
                <div
                  key={vendor.id}
                  className="p-3.5 rounded-lg border border-border-main/60 hover:border-primary/20 transition-all duration-200 flex items-start justify-between gap-3 bg-bg-input/30"
                >
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-foreground leading-tight">
                      {vendor.vendorName}
                    </h4>
                    <p className="text-[11px] font-semibold text-muted-foreground">
                      {vendor.vendorType} • {vendor.city}
                    </p>
                    <p className="text-[11px] text-muted-foreground/80 leading-normal">
                      {vendor.activity}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-foreground block">
                      {formatCurrency(vendor.amount)}
                    </span>
                    <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                      Paid
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No recent vendor actions found.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
