import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Pencil, Building2, Calendar, MapPin, TrendingUp, Hammer, Percent, UserRound, MessageSquare, FileText, FileSignature, Mail, Phone, Shield } from "lucide-react";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import { IoArrowBackOutline } from "react-icons/io5";
import useProjects from "../useHooks";
import { Project, PaymentPlan, formatProjectAmount } from "@/utils/helpers/models/projects/project.dto";
import { getFilePathWithBackendUrl } from "@/utils/helpers/common/http-methods";
import { Can, CanIf } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import ProjectTimeline from "./ProjectTimeline";
import ActivityTimelineBadge from "@/containers/main/contracts/ActivityTimelineBadge";

function InfoField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="p-2.5 rounded-lg bg-primary/10 text-primary shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          {label}
        </span>
        <span className="text-sm font-semibold text-foreground mt-0.5 block break-words">
          {value || "--"}
        </span>
      </div>
    </div>
  );
}

function InfoSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-foreground">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {children}
      </div>
    </div>
  );
}

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

  const clientContracts = (project.contracts || []).filter(
    (contract) => contract.type === "client",
  );
  const vendorContracts = (project.contracts || []).filter(
    (contract) => contract.type !== "client",
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const dateObj = new Date(dateString);
    if (Number.isNaN(dateObj.getTime())) return "N/A";
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

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
              to={`${siteRoutes.comments}?projectId=${project.id}`}
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

              <InfoSection title="Client Information">
                <InfoField
                  icon={<UserRound size={20} />}
                  label="Client Name"
                  value={project.client?.fullName}
                />
                <InfoField
                  icon={<Mail size={20} />}
                  label="Client Email Address"
                  value={project.client?.email}
                />
                <InfoField
                  icon={<Phone size={20} />}
                  label="Client Mobile Number"
                  value={project.client?.phone}
                />
              </InfoSection>

              <hr className="border-border-main" />

              <InfoSection title="Guard Information">
                <InfoField
                  icon={<Shield size={20} />}
                  label="Guard Name"
                  value={project.guardName}
                />
                <InfoField
                  icon={<Phone size={20} />}
                  label="Guard Mobile Number"
                  value={project.guardContactNumber}
                />
              </InfoSection>

              <hr className="border-border-main" />

              <InfoSection title="Supervisor Information">
                <InfoField
                  icon={<UserRound size={20} />}
                  label="Supervisor Name"
                  value={project.supervisorName}
                />
                <InfoField
                  icon={<Phone size={20} />}
                  label="Supervisor Mobile Number"
                  value={project.supervisorContactNumber}
                />
              </InfoSection>

              <hr className="border-border-main" />

              <InfoSection title="Manager Information">
                <InfoField
                  icon={<UserRound size={20} />}
                  label="Manager Name"
                  value={project.managerName}
                />
                <InfoField
                  icon={<Phone size={20} />}
                  label="Manager Mobile Number"
                  value={project.managerContactNumber}
                />
              </InfoSection>

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
                        : project.paymentPlan === PaymentPlan.LUMP_SUM
                          ? `${project.paymentPlan} (${formatProjectAmount(project.amount)})`
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

          <div className="bg-card border border-border-main rounded-xl p-6 shadow-xs">
            <div>
              <h2 className="text-xl font-bold text-foreground">Client Contract</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Contract PDF linked to this project.
              </p>
            </div>
            <hr className="border-border-main my-5" />

            {clientContracts.length > 0 ? (
              <div className="space-y-3">
                {clientContracts.map((contract) => {
                  const pdfUrl = contract.media?.url
                    ? getFilePathWithBackendUrl(contract.media.url)
                    : "";
                  return (
                    <div
                      key={contract.id}
                      className="p-4 rounded-xl border border-border-main bg-panel-bg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <FileText size={18} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">
                            Contract PDF
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Added {formatDate(contract.created_at)}
                          </p>
                        </div>
                      </div>
                      {pdfUrl ? (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md bg-primary text-white text-sm font-semibold hover:opacity-95 shrink-0"
                        >
                          <FileText size={15} />
                          View PDF
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">No file</span>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No client contract has been uploaded for this project yet.
              </p>
            )}
          </div>

          {vendorContracts.length > 0 ? (
            <div className="bg-card border border-border-main rounded-xl p-6 shadow-xs">
              <div>
                <h2 className="text-xl font-bold text-foreground">Vendor Contracts</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Vendor contracts assigned to this project.
                </p>
              </div>
              <hr className="border-border-main my-5" />
              <div className="space-y-3">
                {vendorContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="p-4 rounded-xl border border-border-main bg-panel-bg flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {contract.media?.url ? (
                        <a
                          href={getFilePathWithBackendUrl(contract.media.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0"
                          title="View image"
                        >
                          <img
                            src={getFilePathWithBackendUrl(contract.media.url)}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover border border-border-main"
                          />
                        </a>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <FileSignature size={18} />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          {contract.vendor?.vendorName || "Unknown Vendor"}
                          {contract.activity?.name ? ` — ${contract.activity.name}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {contract.description || "No description provided."}
                        </p>
                        <div className="mt-2">
                          <ActivityTimelineBadge
                            startDate={contract.startDate}
                            endDate={contract.endDate}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-left md:text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                        Amount
                      </span>
                      <span className="font-semibold text-primary text-sm">
                        PKR {Number(contract.amount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
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

      <ProjectTimeline
        projectId={project.id}
        cashflowsIn={project.cashflowsIn}
        cashflowsOut={project.cashflowsOut}
      />
    </div>
  );
}
