import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Pencil,
  Building2,
  Calendar,
  MapPin,
  TrendingUp,
  Hammer,
  Percent,
  UserRound,
  MessageSquare,
  FileText,
  FileSignature,
  Mail,
  Phone,
  Shield,
  ChevronDown,
  Package,
} from "lucide-react";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import { IoArrowBackOutline } from "react-icons/io5";
import useProjects from "../useHooks";
import {
  Project,
  PaymentPlan,
  formatProjectAmount,
  paymentPlanLabel,
} from "@/utils/helpers/models/projects/project.dto";
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

function AccordionSection({
  title,
  description,
  open,
  onToggle,
  children,
}: {
  title: string;
  description?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border-main rounded-xl overflow-hidden shadow-xs">
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-6 py-4 flex items-center justify-between gap-3 text-left hover:bg-muted-foreground/5 transition-colors cursor-pointer"
        title={open ? `Collapse ${title}` : `Expand ${title}`}
      >
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          {description ? (
            <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
          ) : null}
        </div>
        <ChevronDown
          size={20}
          className={`text-muted-foreground shrink-0 transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      {open ? (
        <div className="px-6 pb-6 border-t border-border-main pt-5">
          {children}
        </div>
      ) : null}
    </div>
  );
}

export default function ProjectsView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getProjectById } = useProjects();

  const [project, setProject] = useState<Project | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    profile: true,
    clientContract: false,
    vendorContracts: false,
    pulledMaterials: false,
    timeline: false,
  });

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
  const materialPulls = project.materialPulls || [];

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

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <div className="space-y-6">
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
              title="Comments"
            >
              <MessageSquare size={16} />
              Comments
            </Link>
          </CanIf>
          <Can permission={PERMISSIONS.CONSTRUCTION_SITE_UPDATE}>
            <Link
              to={`/projects/edit/${project.id}`}
              className="flex h-10 px-5 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm animate-fade-in"
              title="Edit Project"
            >
              <Pencil size={16} />
              Edit Project
            </Link>
          </Can>
        </div>
      </div>

      <hr className="border-border-main" />

      <div className="space-y-4 animate-slide-up">
        <AccordionSection
          title="Project Profile"
          description="Basic information and location indicators."
          open={!!openSections.profile}
          onToggle={() => toggleSection("profile")}
        >
          <div className="space-y-6">
            <div className="h-64 sm:h-80 w-full bg-panel-bg relative rounded-xl overflow-hidden border border-border-main">
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
                      ? new Date(project.startDate).toLocaleDateString("en-US", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
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
                      ? `${paymentPlanLabel(project.paymentPlan)} (${Number(project.markupPercentage)}%)`
                      : project.paymentPlan === PaymentPlan.LUMP_SUM
                        ? `${paymentPlanLabel(project.paymentPlan)} (${formatProjectAmount(project.amount)})`
                        : paymentPlanLabel(project.paymentPlan)}
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
                    {new Date(project.created_at).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
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

            {project.paymentPlan === PaymentPlan.LUMP_SUM &&
            (project.paymentStages || []).length > 0 ? (
              <div className="mt-2 space-y-3">
                <h3 className="text-sm font-bold text-foreground">
                  Stagewise Payment Plan
                </h3>
                <div className="overflow-x-auto rounded-xl border border-border-main">
                  <table className="w-full min-w-[560px] text-sm">
                    <thead>
                      <tr className="bg-muted-foreground/5 border-b border-border-main">
                        <th className="px-3 py-2.5 text-left text-xs font-bold text-foreground w-16">
                          S/ No.
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-bold text-foreground">
                          Stage
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-bold text-foreground">
                          Amount in PKR
                        </th>
                        <th className="px-3 py-2.5 text-left text-xs font-bold text-foreground">
                          Expected Date
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {[...(project.paymentStages || [])]
                        .sort(
                          (a, b) =>
                            Number(a.sortOrder || 0) - Number(b.sortOrder || 0),
                        )
                        .map((stage, index) => (
                          <tr
                            key={stage.id || `${stage.stage}-${index}`}
                            className="border-b border-border-main last:border-b-0"
                          >
                            <td className="px-3 py-2.5 text-foreground font-semibold">
                              {index + 1}
                            </td>
                            <td className="px-3 py-2.5 text-foreground">
                              {stage.stage || "--"}
                            </td>
                            <td className="px-3 py-2.5 text-foreground">
                              {Number(stage.amount || 0).toLocaleString("en-US")}
                            </td>
                            <td className="px-3 py-2.5 text-foreground">
                              {stage.expectedDate
                                ? new Date(stage.expectedDate).toLocaleDateString(
                                    "en-GB",
                                    {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    },
                                  )
                                : "--"}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </AccordionSection>

        <AccordionSection
          title="Client Contract"
          description="Drawing and/or contract PDF linked to this project."
          open={!!openSections.clientContract}
          onToggle={() => toggleSection("clientContract")}
        >
          {clientContracts.length > 0 ? (
            <div className="space-y-3">
              {clientContracts.map((contract: any) => {
                const pdfUrl = contract.media?.url
                  ? getFilePathWithBackendUrl(contract.media.url)
                  : "";
                const drawingUrl = contract.drawingMedia?.url
                  ? getFilePathWithBackendUrl(contract.drawingMedia.url)
                  : "";
                return (
                  <div
                    key={contract.id}
                    className="p-4 rounded-xl border border-border-main bg-panel-bg space-y-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <FileText size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                          Client Contract
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Added {formatDate(contract.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {drawingUrl ? (
                        <a
                          href={drawingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md bg-primary/10 text-primary text-sm font-semibold hover:bg-primary/20 shrink-0"
                        >
                          <FileText size={15} />
                          View Drawing PDF
                        </a>
                      ) : null}
                      {pdfUrl ? (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-md bg-primary text-white text-sm font-semibold hover:opacity-95 shrink-0"
                        >
                          <FileText size={15} />
                          View Contract PDF
                        </a>
                      ) : null}
                      {!drawingUrl && !pdfUrl ? (
                        <span className="text-sm text-muted-foreground">
                          No file
                        </span>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No client contract has been uploaded for this project yet.
            </p>
          )}
        </AccordionSection>

        <AccordionSection
          title="Vendor Contracts"
          description="Vendor contracts assigned to this project."
          open={!!openSections.vendorContracts}
          onToggle={() => toggleSection("vendorContracts")}
        >
          {vendorContracts.length > 0 ? (
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
                        {contract.activity?.name
                          ? ` — ${contract.activity.name}`
                          : ""}
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
          ) : (
            <p className="text-sm text-muted-foreground">
              No vendor contracts have been assigned to this project yet.
            </p>
          )}
        </AccordionSection>

        <AccordionSection
          title="Pulled Materials"
          description="Materials pulled from contracted vendors for this project."
          open={!!openSections.pulledMaterials}
          onToggle={() => toggleSection("pulledMaterials")}
        >
          {materialPulls.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-border-main">
              <table className="w-full min-w-[640px] text-sm">
                <thead>
                  <tr className="bg-muted-foreground/5 border-b border-border-main">
                    <th className="px-3 py-2.5 text-left text-xs font-bold text-foreground w-16">
                      S/ No.
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-bold text-foreground">
                      Material
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-bold text-foreground">
                      Vendor
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-bold text-foreground">
                      Quantity
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-bold text-foreground">
                      UOM
                    </th>
                    <th className="px-3 py-2.5 text-left text-xs font-bold text-foreground">
                      Pulled On
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {materialPulls.map((pull, index) => (
                    <tr
                      key={pull.id}
                      className="border-b border-border-main last:border-b-0"
                    >
                      <td className="px-3 py-2.5 text-foreground font-semibold">
                        {index + 1}
                      </td>
                      <td className="px-3 py-2.5 text-foreground">
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-primary shrink-0" />
                          {pull.material?.name || "--"}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-foreground">
                        {pull.vendor?.vendorName || "--"}
                      </td>
                      <td className="px-3 py-2.5 text-foreground">
                        {pull.quantity !== null && pull.quantity !== undefined
                          ? Number(pull.quantity).toLocaleString("en-US")
                          : "--"}
                      </td>
                      <td className="px-3 py-2.5 text-foreground">
                        {pull.uom || "--"}
                      </td>
                      <td className="px-3 py-2.5 text-foreground">
                        {formatDate(pull.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No materials have been pulled for this project yet.
            </p>
          )}
        </AccordionSection>

        <AccordionSection
          title="Project Timeline"
          description="Cash in and cash out activity for this project."
          open={!!openSections.timeline}
          onToggle={() => toggleSection("timeline")}
        >
          <ProjectTimeline
            projectId={project.id}
            cashflowsIn={project.cashflowsIn}
            cashflowsOut={project.cashflowsOut}
          />
        </AccordionSection>
      </div>
    </div>
  );
}
