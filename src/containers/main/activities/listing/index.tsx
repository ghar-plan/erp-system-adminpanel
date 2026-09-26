import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Briefcase,
  Layers,
  Ruler,
  Search,
  CheckCircle2,
  Sparkles,
  Inbox,
  Loader2,
} from "lucide-react";
import useActivities from "../useHooks";
import Button from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";

type NamedItem = { id: string; name: string };
type SectionType = "job" | "workStage" | "unit";

interface SectionMeta {
  key: SectionType;
  label: string;
  singular: string;
  createLabel: string;
  description: string;
  badgeText: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  placeholder: string;
}

const SECTIONS: SectionMeta[] = [
  {
    key: "job",
    label: "Jobs",
    singular: "Job",
    createLabel: "Add Job",
    description: "Contractor roles, craft trades, & labour titles",
    badgeText: "Roles & Labor",
    icon: Briefcase,
    placeholder: "e.g. Mason, Plumber, Painter, Site Supervisor",
  },
  {
    key: "workStage",
    label: "Work Stages",
    singular: "Work Stage",
    createLabel: "Add Work Stage",
    description: "Construction milestones & project progress phases",
    badgeText: "Milestones",
    icon: Layers,
    placeholder: "e.g. Excavation, Foundation, Grey Structure, Finishing",
  },
  {
    key: "unit",
    label: "Units",
    singular: "Unit",
    createLabel: "Add Unit",
    description: "Standard units of measurement for materials & work",
    badgeText: "Measurements",
    icon: Ruler,
    placeholder: "e.g. Sq Ft, Rft, Nos, Bags, Ton, Hours, Days",
  },
];

export default function ActivitiesListing() {
  const { hasPermission } = usePermissions();
  const {
    getJobs,
    createJob,
    updateJob,
    deleteJob,
    getWorkStages,
    createWorkStage,
    updateWorkStage,
    deleteWorkStage,
    getUnits,
    createUnit,
    updateUnit,
    deleteUnit,
  } = useActivities();

  const canCreate = hasPermission(PERMISSIONS.ACTIVITY_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.ACTIVITY_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.ACTIVITY_DELETE);

  const [jobs, setJobs] = useState<NamedItem[]>([]);
  const [workStages, setWorkStages] = useState<NamedItem[]>([]);
  const [units, setUnits] = useState<NamedItem[]>([]);
  const [activeTab, setActiveTab] = useState<SectionType>("job");
  const [searchQuery, setSearchQuery] = useState("");

  const [modalType, setModalType] = useState<SectionType | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemError, setItemError] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    await Promise.all([
      getJobs(setJobs),
      getWorkStages(setWorkStages),
      getUnits(setUnits),
    ]);
  };

  useEffect(() => {
    refresh();
  }, []);

  const openCreate = (type: SectionType) => {
    setModalType(type);
    setEditingId(null);
    setItemName("");
    setItemError("");
  };

  const openEdit = (type: SectionType, item: NamedItem) => {
    setModalType(type);
    setEditingId(item.id);
    setItemName(item.name);
    setItemError("");
  };

  const closeModal = () => {
    if (saving) return;
    setModalType(null);
    setEditingId(null);
    setItemName("");
    setItemError("");
  };

  const currentSection = SECTIONS.find((s) => s.key === activeTab)!;
  const CurrentIcon = currentSection.icon;

  const modalSection = modalType
    ? SECTIONS.find((s) => s.key === modalType)!
    : currentSection;

  const modalTitle = editingId
    ? `Edit ${modalSection.singular}`
    : `Add New ${modalSection.singular}`;

  const handleSave = async () => {
    const name = itemName.trim();
    if (!name) {
      setItemError("Name is required");
      return;
    }
    setSaving(true);
    let ok = null;
    if (modalType === "job") {
      ok = editingId ? await updateJob(editingId, name) : await createJob(name);
    } else if (modalType === "workStage") {
      ok = editingId
        ? await updateWorkStage(editingId, name)
        : await createWorkStage(name);
    } else if (modalType === "unit") {
      ok = editingId ? await updateUnit(editingId, name) : await createUnit(name);
    }
    setSaving(false);
    if (ok) {
      closeModal();
      refresh();
    }
  };

  const activeRows =
    activeTab === "job"
      ? jobs
      : activeTab === "workStage"
        ? workStages
        : units;

  const filteredRows = activeRows.filter((row) =>
    row.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const tabCounts: Record<SectionType, number> = {
    job: jobs.length,
    workStage: workStages.length,
    unit: units.length,
  };

  const ModalIcon = modalSection.icon;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>Master Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl text-foreground font-bold tracking-tight">
            Jobs, Stages & Units
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Manage master classifications, work milestone stages, and measurement
            units referenced across contracts, projects, and cashflow.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Can permission={PERMISSIONS.ACTIVITY_CREATE}>
            <Button
              variant="primary"
              onClick={() => openCreate(activeTab)}
              className="h-10 text-xs px-4 font-semibold flex items-center gap-2 shadow-xs"
            >
              <Plus size={16} />
              {currentSection.createLabel}
            </Button>
          </Can>
        </div>
      </div>

      {/* 3 Interactive Master Selector / Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SECTIONS.map((section) => {
          const isActive = activeTab === section.key;
          const Icon = section.icon;
          const count = tabCounts[section.key];

          return (
            <button
              key={section.key}
              type="button"
              onClick={() => {
                setActiveTab(section.key);
                setSearchQuery("");
              }}
              className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden bg-card flex flex-col justify-between shadow-xs group ${
                isActive
                  ? "border-primary ring-2 ring-primary/20 shadow-md translate-y-[-2px]"
                  : "border-border-main hover:border-primary/50 hover:shadow-sm"
              }`}
            >
              {/* Active Top Line Indicator */}
              {isActive && (
                <span className="absolute top-0 left-0 right-0 h-1 bg-primary" />
              )}

              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${
                      isActive
                        ? "bg-primary text-white shadow-sm shadow-primary/30"
                        : "bg-muted-foreground/10 text-muted-foreground group-hover:text-foreground"
                    }`}
                  >
                    <Icon size={22} />
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "bg-muted-foreground/10 text-muted-foreground"
                    }`}
                  >
                    {section.badgeText}
                  </span>
                </div>

                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-foreground">
                    {count}
                  </h3>
                  <span className="text-base font-semibold text-foreground">
                    {section.label}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {section.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border-main flex items-center justify-between text-xs">
                <span
                  className={`font-semibold ${
                    isActive ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {isActive ? "Currently Active" : "Click to select"}
                </span>
                {isActive && (
                  <CheckCircle2 size={15} className="text-primary" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Table Card */}
      <div className="bg-card rounded-2xl border border-border-main shadow-xs overflow-hidden">
        {/* Card Toolbar with Active Section Header & Search */}
        <div className="p-4 sm:p-5 border-b border-border-main flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <CurrentIcon size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>{currentSection.label}</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-muted-foreground/10 text-muted-foreground">
                  {tabCounts[activeTab]} records
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {currentSection.description}
              </p>
            </div>
          </div>

          {/* Search Input & Action Button */}
          <div className="flex items-center gap-3 w-full sm:w-auto sm:max-w-md sm:flex-1 sm:justify-end">
            <div className="relative flex-1 sm:max-w-xs">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                type="text"
                placeholder={`Search ${currentSection.label.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-bg-input border border-border-input hover:border-primary focus:border-primary rounded-xl outline-none transition-all placeholder:text-muted-foreground/60 text-foreground"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <Can permission={PERMISSIONS.ACTIVITY_CREATE}>
              <Button
                variant="primary"
                onClick={() => openCreate(activeTab)}
                className="h-9 text-xs px-3.5 font-semibold flex items-center gap-1.5 shrink-0"
              >
                <Plus size={15} />
                <span>{currentSection.createLabel}</span>
              </Button>
            </Can>
          </div>
        </div>

        {/* Search Status Filter Indicator */}
        {searchQuery && (
          <div className="px-5 py-2.5 bg-muted-foreground/5 border-b border-border-main flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {filteredRows.length} of {activeRows.length} {currentSection.label.toLowerCase()} matching &quot;<strong className="text-foreground">{searchQuery}</strong>&quot;
            </span>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="text-primary hover:underline font-semibold cursor-pointer"
            >
              Reset filter
            </button>
          </div>
        )}

        {/* Table Content */}
        {filteredRows.length ? (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-border-main">
              <thead className="bg-muted-foreground/5">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider w-24">
                    S/No.
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider">
                    {currentSection.singular} Name
                  </th>
                  {canUpdate || canDelete || canCreate ? (
                    <th className="px-6 py-3.5 text-xs font-bold text-right text-muted-foreground uppercase tracking-wider w-32">
                      Actions
                    </th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {filteredRows.map((row, index) => (
                  <tr
                    key={row.id}
                    className="hover:bg-muted-foreground/5 transition-colors group"
                  >
                    <td className="px-6 py-4 text-xs font-bold text-muted-foreground whitespace-nowrap">
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-muted-foreground/10 text-foreground text-xs font-semibold">
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {row.name}
                        </span>
                      </div>
                    </td>
                    {canUpdate || canDelete || canCreate ? (
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {canUpdate ? (
                            <button
                              type="button"
                              className="btn-action-edit"
                              title={`Edit ${row.name}`}
                              onClick={() => openEdit(activeTab, row)}
                            >
                              <Pencil size={15} />
                            </button>
                          ) : null}
                          {canDelete || canCreate ? (
                            <button
                              type="button"
                              className="btn-action-delete"
                              title={`Delete ${row.name}`}
                              onClick={async () => {
                                const ok =
                                  activeTab === "job"
                                    ? await deleteJob(row.id, row.name)
                                    : activeTab === "workStage"
                                      ? await deleteWorkStage(row.id, row.name)
                                      : await deleteUnit(row.id, row.name);
                                if (ok) refresh();
                              }}
                            >
                              <Trash2 size={15} />
                            </button>
                          ) : null}
                        </div>
                      </td>
                    ) : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Empty State */
          <div className="px-6 py-16 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-muted-foreground/10 flex items-center justify-center text-muted-foreground mb-4">
              <Inbox size={28} />
            </div>
            {searchQuery ? (
              <>
                <h4 className="text-base font-bold text-foreground">
                  No {currentSection.label.toLowerCase()} found
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  We couldn&apos;t find any {currentSection.label.toLowerCase()} matching &quot;{searchQuery}&quot;. Try a different search term.
                </p>
                <Button
                  variant="secondary"
                  onClick={() => setSearchQuery("")}
                  className="mt-4 h-8 text-xs px-4"
                >
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <h4 className="text-base font-bold text-foreground">
                  No {currentSection.label.toLowerCase()} recorded yet
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Get started by adding your first {currentSection.singular.toLowerCase()} to the system.
                </p>
                <Can permission={PERMISSIONS.ACTIVITY_CREATE}>
                  <Button
                    variant="primary"
                    onClick={() => openCreate(activeTab)}
                    className="mt-4 h-9 text-xs px-4 font-semibold flex items-center gap-1.5"
                  >
                    <Plus size={15} />
                    {currentSection.createLabel}
                  </Button>
                </Can>
              </>
            )}
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {modalType ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={closeModal}
          />
          <div className="bg-card border border-border-main w-full max-w-md rounded-2xl shadow-2xl z-10 relative overflow-hidden animate-slide-up">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-muted-foreground/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <ModalIcon size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {modalTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {modalSection.badgeText} Master Entry
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-muted-foreground/10 transition-colors cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground">
                  {modalSection.singular} Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={itemName}
                  placeholder={modalSection.placeholder}
                  autoFocus
                  onChange={(e) => {
                    setItemName(e.target.value);
                    if (itemError) setItemError("");
                  }}
                  className={`w-full px-4 py-2.5 text-sm bg-bg-input border ${
                    itemError
                      ? "border-red-500 ring-2 ring-red-500/20"
                      : "border-border-input hover:border-primary focus:border-primary"
                  } rounded-xl outline-none transition-all placeholder:text-muted-foreground/50 text-foreground`}
                  disabled={saving}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSave();
                    }
                  }}
                />
                {itemError ? (
                  <p className="mt-1.5 text-xs text-red-500 font-semibold flex items-center gap-1">
                    {itemError}
                  </p>
                ) : (
                  <p className="mt-1.5 text-[11px] text-muted-foreground">
                    Provide a clear, standard name for this master {modalSection.singular.toLowerCase()}.
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-muted-foreground/5 border-t border-border-main flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={closeModal}
                disabled={saving}
                className="h-9 text-xs px-5 font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={saving}
                className="h-9 text-xs px-5 font-semibold flex items-center gap-1.5"
              >
                {saving ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : editingId ? (
                  "Update"
                ) : (
                  "Save Entry"
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
