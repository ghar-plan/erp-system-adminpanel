import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Pencil, Building2, Calendar, MapPin, TrendingUp, Hammer, Percent, UserRound, MessageSquare } from "lucide-react";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import { IoArrowBackOutline } from "react-icons/io5";
import useProjects from "../useHooks";
import { Project, PaymentPlan } from "@/utils/helpers/models/projects/project.dto";
import { getFilePathWithBackendUrl } from "@/utils/helpers/common/http-methods";
import { Can, CanIf } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";

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

        <div className="flex items-center gap-2">
          <CanIf
            permissions={[
              PERMISSIONS.COMMENTS_READ,
              PERMISSIONS.CONSTRUCTION_SITE_READ,
            ]}
          >
            <Link
              to={siteRoutes.comments}
              className="flex h-10 px-5 items-center justify-center gap-2 rounded-md border border-border-main bg-card hover:bg-muted-foreground/5 font-semibold text-foreground text-sm transition-all cursor-pointer shadow-sm"
            >
              <MessageSquare size={16} />
              Comments
            </Link>
          </CanIf>
        <Can permission={PERMISSIONS.CONSTRUCTION_SITE_UPDATE}>
          <Link
            to={`/projects/edit/${project.id}`}
            className="flex h-10 px-5 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm animate-fade-in"
          >
            <Pencil size={16} />
            Edit Project
          </Link>
        </Can>
        </div>
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
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <UserRound size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Client
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {project.client?.fullName || "--"}
                    </span>
                    {project.client?.email || project.client?.phone ? (
                      <span className="text-xs text-muted-foreground mt-0.5 block">
                        {[project.client?.email, project.client?.phone]
                          .filter(Boolean)
                          .join(" · ")}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <UserRound size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Guard Name
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {project.guardName || "--"}
                    </span>
                    {project.guardContactNumber ? (
                      <span className="text-xs text-muted-foreground mt-0.5 block">
                        {project.guardContactNumber}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <UserRound size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Supervisor Name
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {project.supervisorName || "--"}
                    </span>
                    {project.supervisorContactNumber ? (
                      <span className="text-xs text-muted-foreground mt-0.5 block">
                        {project.supervisorContactNumber}
                      </span>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <UserRound size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Manager Name
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {project.managerName || "--"}
                    </span>
                    {project.managerContactNumber ? (
                      <span className="text-xs text-muted-foreground mt-0.5 block">
                        {project.managerContactNumber}
                      </span>
                    ) : null}
                  </div>
                </div>

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
                      Start Date
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {project.startDate
                        ? new Date(project.startDate).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )
                        : "--"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-accent-bg text-accent-text">
                    <Hammer size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Construction Type
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {project.constructionType || "--"}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <Percent size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Payment Plan
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {project.paymentPlan === PaymentPlan.MARKUP &&
                      project.markupPercentage !== null &&
                      project.markupPercentage !== undefined
                        ? `${project.paymentPlan} (${Number(project.markupPercentage)}%)`
                        : project.paymentPlan || "--"}
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

                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Total Number of Cash Out
                    </span>
                    <span className="text-sm font-semibold text-foreground mt-0.5 block">
                      {project?.cashflowsOut?.length || 0}
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
