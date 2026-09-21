import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Pencil,
  Users,
  Calendar,
  MapPin,
  Phone,
  Briefcase,
  FileText,
  Wallet,
  Building2,
  Package,
  ExternalLink,
} from "lucide-react";
import { IoArrowBackOutline } from "react-icons/io5";
import useVendors from "../useHooks";
import { Vendor } from "@/utils/helpers/models/vendors/vendor.dto";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import ActivityTimelineBadge from "@/containers/main/contracts/ActivityTimelineBadge";
import {
  durationDays,
  formatDurationLabel,
} from "@/containers/main/contracts/activity-timeline";
import { getFilePathWithBackendUrl } from "@/utils/helpers/common/http-methods";

type DetailTab = "projects" | "contracts" | "cash" | "materials";

const formatPkr = (value: number) =>
  `PKR ${Number(value || 0).toLocaleString()}`;

const isPdfUrl = (url?: string | null) =>
  !!url && url.toLowerCase().includes(".pdf");

export default function VendorView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getVendorById } = useVendors();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [activeTab, setActiveTab] = useState<DetailTab>("projects");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");

  useEffect(() => {
    if (id) {
      getVendorById(id, setVendor);
    }
  }, [id]);

  const derived = useMemo(() => {
    const contracts = vendor?.contracts || [];
    const cashflows = vendor?.cashflowsOut || [];
    const materials = vendor?.materials || [];

    const projectMap = new Map<
      string,
      {
        id: string;
        siteName: string;
        region?: string;
        subregion?: string;
        status?: string;
        amount: number | null;
        cashGiven: number;
        decidedAmount: number;
        contracts: any[];
        cashflows: any[];
        awardDocs: { url: string; label: string }[];
      }
    >();

    const ensureProject = (project: any, projectId: string) => {
      if (!projectId) return null;
      if (!projectMap.has(projectId)) {
        projectMap.set(projectId, {
          id: projectId,
          siteName: project?.siteName || "Unknown Project",
          region: project?.region,
          subregion: project?.subregion,
          status: project?.status,
          amount:
            project?.amount !== undefined && project?.amount !== null
              ? Number(project.amount)
              : null,
          cashGiven: 0,
          decidedAmount: 0,
          contracts: [],
          cashflows: [],
          awardDocs: [],
        });
      }
      return projectMap.get(projectId)!;
    };

    contracts.forEach((contract: any) => {
      const projectId = contract.projectId || contract.project?.id;
      const entry = ensureProject(contract.project, projectId);
      if (!entry) return;
      entry.contracts.push(contract);
      entry.decidedAmount += Number(contract.amount || 0);
      if (contract.media?.url) {
        entry.awardDocs.push({
          url: contract.media.url,
          label: contract.activity?.name || "Award document",
        });
      }
    });

    cashflows.forEach((cf: any) => {
      const projectId = cf.projectId || cf.project?.id;
      const entry = ensureProject(cf.project, projectId);
      if (!entry) return;
      entry.cashflows.push(cf);
      entry.cashGiven += Number(cf.amount || 0);
      if (entry.amount === null && cf.project?.amount != null) {
        entry.amount = Number(cf.project.amount);
      }
    });

    const projects = Array.from(projectMap.values()).sort((a, b) =>
      a.siteName.localeCompare(b.siteName),
    );

    const totalCashGiven = cashflows.reduce(
      (sum, cf: any) => sum + Number(cf.amount || 0),
      0,
    );

    return {
      projects,
      contracts,
      cashflows,
      materials,
      totalCashGiven,
      projectsCount: projects.length,
      contractsCount: contracts.length,
      materialsCount: materials.length,
    };
  }, [vendor]);

  const filteredCashflows = useMemo(() => {
    if (selectedProjectId === "all") return derived.cashflows;
    return derived.cashflows.filter(
      (cf: any) => (cf.projectId || cf.project?.id) === selectedProjectId,
    );
  }, [derived.cashflows, selectedProjectId]);

  const selectedProjectSummary = useMemo(() => {
    if (selectedProjectId === "all") {
      return {
        cashGiven: derived.totalCashGiven,
        decidedAmount: derived.projects.reduce(
          (sum, p) => sum + (p.decidedAmount > 0 ? p.decidedAmount : 0),
          0,
        ),
        projectAmount: null as number | null,
        hasDecided: derived.projects.some((p) => p.decidedAmount > 0),
      };
    }
    const project = derived.projects.find((p) => p.id === selectedProjectId);
    if (!project) {
      return {
        cashGiven: 0,
        decidedAmount: 0,
        projectAmount: null,
        hasDecided: false,
      };
    }
    const decided =
      project.decidedAmount > 0
        ? project.decidedAmount
        : project.amount != null && project.amount > 0
          ? project.amount
          : 0;
    return {
      cashGiven: project.cashGiven,
      decidedAmount: decided,
      projectAmount: project.amount,
      hasDecided: decided > 0,
    };
  }, [derived, selectedProjectId]);

  if (!vendor) {
    return null;
  }

  const summaryCards: {
    key: DetailTab;
    label: string;
    value: string | number;
    icon: React.ReactNode;
    iconClass: string;
  }[] = [
    {
      key: "projects",
      label: "Current Projects Served",
      value: derived.projectsCount,
      icon: <Building2 size={24} />,
      iconClass: "bg-primary/10 text-primary",
    },
    {
      key: "contracts",
      label: "Total Contracts",
      value: derived.contractsCount,
      icon: <FileText size={24} />,
      iconClass: "bg-info-bg text-info-text",
    },
    {
      key: "cash",
      label: "Cash Given",
      value: formatPkr(derived.totalCashGiven),
      icon: <Wallet size={24} />,
      iconClass: "bg-success-bg text-success-text",
    },
    {
      key: "materials",
      label: "Material Supplied",
      value: derived.materialsCount,
      icon: <Package size={24} />,
      iconClass: "bg-accent-bg text-accent-text",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/vendors")}
            className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
            title="Go Back"
          >
            <IoArrowBackOutline size={20} className="stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-2xl text-foreground font-bold leading-tight">
              {vendor?.vendorName || "--"}
            </h1>
          </div>
        </div>

        <Can permission={PERMISSIONS.VENDORS_UPDATE}>
          <Link
            to={`/vendors/edit/${vendor.id}`}
            className="flex h-10 px-5 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm animate-fade-in"
          >
            <Pencil size={16} />
            Edit Profile
          </Link>
        </Can>
      </div>

      <hr className="border-border-main" />

      {/* Clickable Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 animate-slide-up">
        {summaryCards.map((card) => {
          const isActive = activeTab === card.key;
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => setActiveTab(card.key)}
              className={`app-card border text-left shadow-xs flex flex-col justify-center transition-all cursor-pointer ${
                isActive
                  ? "border-primary ring-2 ring-primary/20"
                  : "border-border-main hover:border-primary/40"
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${card.iconClass}`}
                >
                  {card.icon}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-muted-foreground">
                    {card.label}
                  </p>
                  <h3 className="text-xl font-bold text-foreground truncate">
                    {card.value}
                  </h3>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Panel */}
      <div className="app-card border border-border-main shadow-xs animate-slide-up">
        {activeTab === "projects" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Projects Served
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Projects this vendor has worked on, with cash and award status to date.
              </p>
            </div>
            <hr className="border-border-main" />
            {derived.projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">No projects found for this vendor.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {derived.projects.map((project) => {
                  const decided =
                    project.decidedAmount > 0
                      ? project.decidedAmount
                      : project.amount != null && project.amount > 0
                        ? project.amount
                        : 0;
                  const remaining = decided > 0 ? Math.max(decided - project.cashGiven, 0) : null;
                  return (
                    <div
                      key={project.id}
                      className="p-4 rounded-xl border border-border-main bg-panel-bg space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                            <Building2 size={16} className="text-primary" />
                            {project.siteName}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {[project.region, project.subregion].filter(Boolean).join(" · ") ||
                              "—"}
                            {project.status ? ` · ${project.status}` : ""}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-4 text-right">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                              Contracts
                            </span>
                            <span className="font-semibold text-foreground text-sm">
                              {project.contracts.length}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                              Cash Given
                            </span>
                            <span className="font-semibold text-success-text text-sm">
                              {formatPkr(project.cashGiven)}
                            </span>
                          </div>
                          {decided > 0 ? (
                            <>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                                  Decided
                                </span>
                                <span className="font-semibold text-info-text text-sm">
                                  {formatPkr(decided)}
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                                  Remaining
                                </span>
                                <span className="font-semibold text-warning-text text-sm">
                                  {formatPkr(remaining || 0)}
                                </span>
                              </div>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-muted-foreground">
                          Award PDF:
                        </span>
                        {project.awardDocs.length > 0 ? (
                          project.awardDocs.map((doc, idx) => (
                            <a
                              key={`${doc.url}-${idx}`}
                              href={getFilePathWithBackendUrl(doc.url)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                            >
                              <FileText size={14} />
                              {doc.label}
                              <ExternalLink size={12} />
                            </a>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Not uploaded
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "contracts" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Contracts Breakdown
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Contracts assigned to this vendor, with award documents if uploaded.
              </p>
            </div>
            <hr className="border-border-main" />
            {derived.contracts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No contracts found.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {derived.contracts.map((contract: any, index: number) => {
                  const cashGiven =
                    vendor.cashflowsOut
                      ?.filter(
                        (cf: any) =>
                          cf.projectId === contract.projectId &&
                          cf.activityId === contract.activityId,
                      )
                      .reduce(
                        (sum: number, cf: any) => sum + Number(cf.amount || 0),
                        0,
                      ) || 0;
                  const mediaUrl = contract.media?.url
                    ? getFilePathWithBackendUrl(contract.media.url)
                    : null;

                  return (
                    <div
                      key={contract.id || index}
                      className="p-4 rounded-xl border border-border-main bg-panel-bg flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {mediaUrl ? (
                          <a
                            href={mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0"
                            title="View award document"
                          >
                            {isPdfUrl(contract.media.url) ? (
                              <div className="w-12 h-12 rounded-lg border border-border-main bg-primary/10 flex items-center justify-center text-primary">
                                <FileText size={20} />
                              </div>
                            ) : (
                              <img
                                src={mediaUrl}
                                alt=""
                                className="w-12 h-12 rounded-lg object-cover border border-border-main"
                              />
                            )}
                          </a>
                        ) : (
                          <div className="w-12 h-12 rounded-lg border border-dashed border-border-main flex items-center justify-center text-[10px] text-muted-foreground text-center px-1">
                            No PDF
                          </div>
                        )}
                        <div className="space-y-1 min-w-0">
                          <h4 className="font-bold text-foreground text-sm flex items-center gap-2">
                            <Briefcase size={16} className="text-primary" />
                            {contract.project?.siteName || "Unknown Project"} -{" "}
                            {contract.activity?.name || "Unknown Activity"}
                          </h4>
                          <p className="text-xs text-muted-foreground line-clamp-2 max-w-md">
                            {contract.description || "No description provided."}
                          </p>
                          {contract.startDate || contract.endDate ? (
                            <div className="flex flex-wrap items-center gap-2 pt-1">
                              <ActivityTimelineBadge
                                startDate={contract.startDate}
                                endDate={contract.endDate}
                              />
                              <span className="text-[11px] text-muted-foreground">
                                {formatDurationLabel(
                                  durationDays(contract.startDate, contract.endDate),
                                )}
                              </span>
                            </div>
                          ) : null}
                          <p className="text-[11px] text-muted-foreground">
                            Award PDF:{" "}
                            {mediaUrl ? (
                              <a
                                href={mediaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary font-semibold hover:underline"
                              >
                                View
                              </a>
                            ) : (
                              "Not uploaded"
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                            Decided
                          </span>
                          <span className="font-semibold text-info-text block text-sm">
                            {formatPkr(Number(contract.amount || 0))}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider block">
                            Cash Given
                          </span>
                          <span className="font-semibold text-success-text block text-sm">
                            {formatPkr(cashGiven)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === "cash" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">Cash Given</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  All cash given across projects. Select a project for project-level totals.
                </p>
              </div>
              <div className="w-full sm:w-64">
                <label className="mb-1.5 block text-xs font-medium text-foreground">
                  Project
                </label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="common-input text-sm h-10 w-full"
                >
                  <option value="all">All projects</option>
                  {derived.projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.siteName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <hr className="border-border-main" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl border border-border-main p-4 bg-muted-foreground/5">
                <p className="text-xs font-semibold text-muted-foreground">
                  Payment Given
                </p>
                <p className="text-lg font-bold text-success-text mt-1">
                  {formatPkr(selectedProjectSummary.cashGiven)}
                </p>
              </div>
              {selectedProjectSummary.hasDecided ? (
                <>
                  <div className="rounded-xl border border-border-main p-4 bg-muted-foreground/5">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Decided Amount
                    </p>
                    <p className="text-lg font-bold text-info-text mt-1">
                      {formatPkr(selectedProjectSummary.decidedAmount)}
                    </p>
                  </div>
                  <div className="rounded-xl border border-border-main p-4 bg-muted-foreground/5">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Payment Remaining
                    </p>
                    <p className="text-lg font-bold text-warning-text mt-1">
                      {formatPkr(
                        Math.max(
                          selectedProjectSummary.decidedAmount -
                            selectedProjectSummary.cashGiven,
                          0,
                        ),
                      )}
                    </p>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-border-main p-4 bg-muted-foreground/5 sm:col-span-2">
                  <p className="text-xs font-semibold text-muted-foreground">
                    Decided Amount
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Not decided yet for{" "}
                    {selectedProjectId === "all"
                      ? "these projects"
                      : "this project"}
                    .
                  </p>
                </div>
              )}
            </div>

            {filteredCashflows.length === 0 ? (
              <p className="text-sm text-muted-foreground">No cash entries found.</p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border-main">
                <table className="min-w-full divide-y divide-border-main">
                  <thead className="bg-muted-foreground/5">
                    <tr>
                      {["Date", "Project", "Activity / Items", "Amount"].map(
                        (col) => (
                          <th
                            key={col}
                            className="px-4 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider"
                          >
                            {col}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main">
                    {filteredCashflows.map((cf: any) => (
                      <tr key={cf.id} className="hover:bg-muted-foreground/5">
                        <td className="px-4 py-3 text-sm text-foreground">
                          {cf.entryDate || cf.created_at
                            ? new Date(
                                cf.entryDate || cf.created_at,
                              ).toLocaleDateString()
                            : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-foreground">
                          {cf.project?.siteName || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-foreground">
                          {cf.activity?.name || cf.items || "—"}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-success-text">
                          {formatPkr(Number(cf.amount || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "materials" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">
                Materials Supplied
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Materials linked to this vendor to date.
              </p>
            </div>
            <hr className="border-border-main" />
            {derived.materials.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No materials linked to this vendor.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {derived.materials.map((material) => (
                  <div
                    key={material.id}
                    className="rounded-xl border border-border-main bg-panel-bg px-4 py-3 flex items-center gap-3"
                  >
                    <div className="p-2 rounded-lg bg-success-bg text-success-text">
                      <Package size={16} />
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {material.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="app-card border border-border-main max-w-4xl shadow-xs animate-slide-up">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">Vendor Profile</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Basic contact information and job criteria.
            </p>
          </div>
          <hr className="border-border-main" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-info-bg text-info-text">
                <Users size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Name
                </span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block">
                  {vendor?.vendorName || "--"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-success-bg text-success-text">
                <Briefcase size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Job Description
                </span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block">
                  {vendor?.jobDescription || "--"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-accent-bg text-accent-text">
                <Briefcase size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Vendor Type
                </span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block">
                  {vendor?.vendorType === "vendorMaterial"
                    ? "Material"
                    : vendor?.vendorType === "vendorLabour"
                      ? "Labor"
                      : vendor?.vendorType || "--"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-accent-bg text-accent-text">
                <Phone size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Phone
                </span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block">
                  {vendor?.phone || "--"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-warning-bg text-warning-text">
                <MapPin size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  City
                </span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block">
                  {vendor?.city || "--"}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-panel-bg text-muted-foreground border border-panel-border">
                <Calendar size={20} />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                  Registration Date
                </span>
                <span className="text-sm font-semibold text-foreground mt-0.5 block">
                  {vendor?.created_at
                    ? new Date(vendor.created_at).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "--"}
                </span>
              </div>
            </div>
          </div>

          <hr className="border-border-main" />

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-danger-bg text-danger-text">
              <MapPin size={20} />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Address
              </span>
              <p className="text-sm font-semibold text-foreground mt-1 leading-relaxed">
                {vendor?.address || "No address logged."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
