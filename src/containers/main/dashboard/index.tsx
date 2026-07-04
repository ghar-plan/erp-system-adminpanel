import React from "react";
import { Link } from "react-router-dom";
import {
  Wallet,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Building2,
  Users,
  ArrowUpRight,
  Briefcase,
  ChevronRight
} from "lucide-react";

// Static Data for Dashboard
const staticProjects = [
  {
    id: "1",
    siteName: "Ghar Plans Office Complex",
    region: "Islamabad",
    subregion: "Sector G-11",
    progress: 75,
    status: "Active"
  },
  {
    id: "2",
    siteName: "Bahria Heights Plaza",
    region: "Rawalpindi",
    subregion: "Bahria Town Ph 4",
    progress: 45,
    status: "Active"
  },
  {
    id: "3",
    siteName: "Gulberg Heights Commercial",
    region: "Lahore",
    subregion: "Gulberg III",
    progress: 90,
    status: "Near Completion"
  },
  {
    id: "4",
    siteName: "DHA Phase 6 Residence",
    region: "Lahore",
    subregion: "DHA Phase 6",
    progress: 20,
    status: "Early Stage"
  }
];

const staticVendors = [
  {
    id: "1",
    vendorName: "Faisal Steel Traders",
    vendorType: "Raw Material",
    city: "Lahore",
    activity: "Dispatched 50 Tons Steel",
    amount: "$45,000.00"
  },
  {
    id: "2",
    vendorName: "Al-Noor Concrete Services",
    vendorType: "Sub Contractor",
    city: "Rawalpindi",
    activity: "Slab Pouring Phase 2",
    amount: "$120,500.00"
  },
  {
    id: "3",
    vendorName: "Kamran Electric & Co",
    vendorType: "Sub Contractor",
    city: "Islamabad",
    activity: "Wiring installation",
    amount: "$15,300.00"
  }
];

export default function Dashboard() {
  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in font-sans">
        <div>
          <h1 className="text-2xl sm:text-[32px] text-foreground font-semibold tracking-tight mb-1">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Overview of ongoing projects, financial summary, and performance metrics.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-card border border-border-main px-3.5 py-2 rounded-lg shadow-2xs self-start sm:self-auto font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Sync Active
        </div>
      </div>

      {/* Financial Metrics Cards (Matching Image Exactly) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        {/* Card 1: Total Revenue */}
        <div className="bg-card rounded-xl border border-border-main p-6 flex flex-col justify-between shadow-2xs relative overflow-hidden transition-all duration-300 hover:shadow-xs hover:border-primary/20">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
              <Wallet size={20} className="stroke-[2]" />
            </div>
            <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border border-emerald-100/50 dark:border-emerald-900/30 text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <TrendingUp size={12} />
              12.5%
            </div>
          </div>
          <div className="mt-6">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">
              Total Revenue (IN)
            </span>
            <h2 className="text-3xl font-semibold text-foreground mt-1.5 tracking-tight font-sans">
              $2,450,800.00
            </h2>
          </div>
          {/* Progress Bar (Black/Foreground indicator) */}
          <div className="h-1.5 w-full bg-muted-foreground/10 rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-foreground rounded-full w-[70%]" />
          </div>
        </div>

        {/* Card 2: Total Costs */}
        <div className="bg-card rounded-xl border border-border-main p-6 flex flex-col justify-between shadow-2xs relative overflow-hidden transition-all duration-300 hover:shadow-xs hover:border-primary/20">
          <div className="flex items-center justify-between">
            <div className="w-11 h-11 bg-amber-500/10 rounded-lg flex items-center justify-center text-amber-600">
              <DollarSign size={20} className="stroke-[2]" />
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border border-amber-100/50 dark:border-amber-900/30 text-xs font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <TrendingDown size={12} />
              4.2%
            </div>
          </div>
          <div className="mt-6">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest block">
              Total Costs (OUT)
            </span>
            <h2 className="text-3xl font-semibold text-foreground mt-1.5 tracking-tight font-sans">
              $1,890,450.25
            </h2>
          </div>
          {/* Progress Bar (Amber indicator) */}
          <div className="h-1.5 w-full bg-muted-foreground/10 rounded-full mt-6 overflow-hidden">
            <div className="h-full bg-amber-600 rounded-full w-[80%]" />
          </div>
        </div>

        {/* Card 3: Net Profit / Surplus */}
        <div className="bg-slate-900 dark:bg-card rounded-xl border border-transparent dark:border-border-main p-6 flex flex-col justify-between shadow-md relative overflow-hidden transition-all duration-300 hover:shadow-lg text-white">
          {/* Chart Fade Background Effect */}
          <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
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
            <div className="w-11 h-11 bg-white/10 rounded-lg flex items-center justify-center text-white">
              <TrendingUp size={20} className="stroke-[2]" />
            </div>
            <div className="bg-white/10 text-white text-[9px] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">
              Live Status
            </div>
          </div>
          <div className="mt-6 z-10">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-muted-foreground uppercase tracking-widest block">
              Net Profit / Surplus
            </span>
            <h2 className="text-3xl font-semibold text-white dark:text-foreground mt-1.5 tracking-tight font-sans">
              $560,349.75
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 dark:text-muted-foreground italic mt-6 block">
            Projected annual surplus: +$1.2M
          </span>
        </div>
      </div>

      {/* Main Grid: Projects Progress & Recent Vendors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up">
        {/* Left Column: Active Projects Track (2/3 width on desktop) */}
        <div className="bg-card rounded-xl border border-border-main p-6 shadow-2xs lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-border-main/60">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Briefcase size={18} className="text-primary stroke-[2]" />
                Active Projects Progress
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Real-time phase and execution progress across construction sites.
              </p>
            </div>
            <Link
              to="/projects"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-0.5"
            >
              View All <ChevronRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staticProjects.map((project) => (
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
        </div>

        {/* Right Column: Recent Vendors Activity (1/3 width on desktop) */}
        <div className="bg-card rounded-xl border border-border-main p-6 shadow-2xs space-y-6">
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

          <div className="space-y-4">
            {staticVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="p-3.5 rounded-lg border border-border-main/60 hover:border-primary/20 transition-all duration-200 flex items-start justify-between gap-3 bg-bg-input/30"
              >
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-foreground leading-tight">
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
                  <span className="text-xs font-semibold text-foreground block">
                    {vendor.amount}
                  </span>
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded mt-1.5 inline-block">
                    Paid
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

