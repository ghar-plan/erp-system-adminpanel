import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Pencil, Building2, Calendar, MapPin, TrendingUp } from "lucide-react";
import { IoArrowBackOutline } from "react-icons/io5";
import useProjects from "../useHooks";
import { Project } from "@/utils/helpers/models/projects/project.dto";
import { getFilePathWithBackendUrl } from "@/utils/helpers/common/http-methods";

export default function ProjectsView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProjectById } = useProjects();

  const [project, setProject] = useState<Project | null>(null);

  useEffect(() => {
    if (id) {
      getProjectById(id, setProject);
    }
  }, [id]);

  if (!project) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
            title="Go Back"
          >
            <IoArrowBackOutline size={20} className="stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-2xl text-foreground font-bold leading-tight">
              {project.siteName}
            </h1>
          </div>
        </div>

        <Link
          to={`/projects/edit/${project.id}`}
          className="flex h-10 px-5 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm animate-fade-in"
        >
          <Pencil size={16} />
          Edit Project
        </Link>
      </div>

      <hr className="border-border-main" />

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-slide-up">
        {/* Left Column: Image & Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border-main rounded-xl overflow-hidden shadow-xs">
            {/* Cover image container */}
            <div className="h-64 sm:h-80 w-full bg-panel-bg relative">
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
                  <div className="p-2.5 rounded-lg bg-info-bg text-info-text">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Site Name
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {project?.siteName || "--"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-success-bg text-success-text">
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
                  <div className="p-2.5 rounded-lg bg-accent-bg text-accent-text">
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
                  <div className="p-2.5 rounded-lg bg-warning-bg text-warning-text">
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
        {/* <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border-main rounded-xl p-6 shadow-xs">
            <h2 className="text-lg font-bold text-foreground">
              Financial Status
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Current profit & deficit margins.
            </p>
            <hr className="border-border-main my-5" />

            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-panel-bg border border-panel-border flex items-center gap-4">
                <div className="p-3 rounded-xl bg-success-bg text-success-text">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    Profit / Deficit
                  </span>
                  <h3 className="text-xl font-black mt-0.5 text-success-text">
                    +PKR 560,350.00
                  </h3>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center text-sm border-b border-border-main pb-2">
                  <span className="text-muted-foreground">Total Budget</span>
                  <span className="font-bold text-foreground">
                    PKR 2,500,000.00
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-border-main pb-2">
                  <span className="text-muted-foreground">
                    Expenses Incurred
                  </span>
                  <span className="font-bold text-foreground">
                    PKR 1,890,000.00
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    Revenue Invoiced
                  </span>
                  <span className="font-bold text-foreground">
                    PKR 2,450,000.00
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
