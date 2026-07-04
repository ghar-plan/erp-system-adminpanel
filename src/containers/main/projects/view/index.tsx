import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Pencil,
  Building2,
  Calendar,
  MapPin,
  DollarSign,
  TrendingUp,
  ShieldAlert,
} from "lucide-react";
import useProjects from "../useHooks";
import { Project } from "@/utils/helpers/models/projects/project.dto";
import { getFilePathWithBackendUrl } from "@/utils/helpers/common/http-methods";

export default function ProjectsView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProjectById, getFinancialStatus } = useProjects();

  const [project, setProject] = useState<Project | null>(null);
  const [financials, setFinancials] = useState<any>(null);

  useEffect(() => {
    if (id) {
      getProjectById(id, setProject);
      getFinancialStatus(id, setFinancials);
    }
  }, [id]);

  if (!project) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-2">
        <Building2 className="animate-pulse text-muted-foreground" size={40} />
        <span className="text-sm font-semibold text-muted-foreground">
          Loading site details...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-background transition-colors duration-200 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border-main">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Projects / Overview
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {project.siteName}
          </h1>
        </div>

        <div className="flex items-center gap-3 animate-fade-in">
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="flex h-11 px-4 items-center justify-center gap-2 rounded-lg border border-border-main bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-foreground text-sm font-bold transition-all cursor-pointer shadow-xs"
          >
            <ArrowLeft size={16} />
            Back to List
          </button>

          <Link
            to={`/projects/edit/${project.id}`}
            className="flex h-11 px-5 items-center justify-center gap-2 rounded-lg bg-primary hover:opacity-90 font-bold text-white text-sm transition-all cursor-pointer shadow-sm"
          >
            <Pencil size={16} />
            Edit Project
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1  gap-6 animate-slide-up">
        {/* Left Column: Image & Details */}
        <div className="space-y-6">
          <div className="app-card overflow-hidden !p-0 border border-border-main shadow-xs">
            <div className="h-64 sm:h-80 w-full bg-slate-100 dark:bg-slate-800 relative">
              {project.media?.url ? (
                <img
                  src={getFilePathWithBackendUrl(project.media.url)}
                  alt={project.siteName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Building2 size={64} className="opacity-40" />
                  <span className="text-xs font-semibold mt-2">
                    No Cover Photo Uploaded
                  </span>
                </div>
              )}
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  Project Profile
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Basic information and location indicators.
                </p>
              </div>
              <hr className="border-border-main" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Site Name
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {project.siteName}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Region / City
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {project.region}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Subregion
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {project.subregion || "N/A"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Registration Date
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {new Date(project.created_at).toLocaleDateString(
                        "en-US",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Financial Overview */}
        {/* <div className="space-y-6">
          <div className="app-card border border-border-main shadow-xs">
            <h2 className="text-lg font-bold text-foreground">Financial Status</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Current profit & deficit margins.</p>
            <hr className="border-border-main my-5" />

            {financials ? (
              <div className="space-y-5">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-border-main flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${financials.profit >= 0 ? "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600" : "bg-red-50 dark:bg-red-950/20 text-red-600"}`}>
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-muted-foreground uppercase">Profit / Deficit</span>
                    <h3 className={`text-xl font-black mt-0.5 ${financials.profit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {financials.profit >= 0 ? "+" : ""}{financials.profit?.toLocaleString("en-US", { style: "currency", currency: "PKR" }) || "PKR 0.00"}
                    </h3>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total Budget</span>
                    <span className="font-bold text-foreground">
                      {financials.totalBudget?.toLocaleString("en-US", { style: "currency", currency: "PKR" }) || "PKR 0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Expenses Incurred</span>
                    <span className="font-bold text-foreground">
                      {financials.expenses?.toLocaleString("en-US", { style: "currency", currency: "PKR" }) || "PKR 0.00"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Revenue Invoiced</span>
                    <span className="font-bold text-foreground">
                      {financials.revenue?.toLocaleString("en-US", { style: "currency", currency: "PKR" }) || "PKR 0.00"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-50 dark:bg-slate-900/20 rounded-xl border border-border-main/50">
                <ShieldAlert className="text-muted-foreground/60 w-8 h-8 mb-2" />
                <h4 className="text-sm font-bold text-foreground">No Financial Summaries</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  There are no ledger or transaction history records logged for this project yet.
                </p>
              </div>
            )}
          </div>
        </div> */}
      </div>
    </div>
  );
}
