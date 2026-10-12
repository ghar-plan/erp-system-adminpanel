import React, { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Layers,
  Search,
  Sparkles,
  Inbox,
  Loader2,
} from "lucide-react";
import useDesignActivities from "../useHooks";
import Button from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";

type NamedItem = { id: string; name: string };

const SECTION = {
  label: "Work Stages",
  singular: "Work Stage",
  createLabel: "Add Work Stage",
  description: "Design milestones & project progress phases",
  badgeText: "Milestones",
  placeholder: "e.g. Concept Design, Working Drawings, Approvals",
};

export default function DesignActivitiesListing() {
  const { hasPermission } = usePermissions();
  const { getWorkStages, createWorkStage, updateWorkStage, deleteWorkStage } =
    useDesignActivities();

  const canCreate = hasPermission(PERMISSIONS.DESIGN_ACTIVITY_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.DESIGN_ACTIVITY_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.DESIGN_ACTIVITY_DELETE);

  const [workStages, setWorkStages] = useState<NamedItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemError, setItemError] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    await getWorkStages(setWorkStages);
  };

  useEffect(() => {
    refresh();
  }, []);

  const openCreate = () => {
    setModalOpen(true);
    setEditingId(null);
    setItemName("");
    setItemError("");
  };

  const openEdit = (item: NamedItem) => {
    setModalOpen(true);
    setEditingId(item.id);
    setItemName(item.name);
    setItemError("");
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    setEditingId(null);
    setItemName("");
    setItemError("");
  };

  const modalTitle = editingId
    ? `Edit ${SECTION.singular}`
    : `Add New ${SECTION.singular}`;

  const handleSave = async () => {
    const name = itemName.trim();
    if (!name) {
      setItemError("Name is required");
      return;
    }
    setSaving(true);
    const ok = editingId
      ? await updateWorkStage(editingId, name)
      : await createWorkStage(name);
    setSaving(false);
    if (ok) {
      closeModal();
      refresh();
    }
  };

  const filteredRows = workStages.filter((row) =>
    row.name.toLowerCase().includes(searchQuery.toLowerCase().trim()),
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider mb-1">
            <Sparkles size={14} />
            <span>Master Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl text-foreground font-bold tracking-tight">
            Work Stages
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Manage work milestone stages referenced across design contracts,
            projects, and cashflow.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Can permission={PERMISSIONS.DESIGN_ACTIVITY_CREATE}>
            <Button
              variant="primary"
              onClick={openCreate}
              className="h-10 text-xs px-4 font-semibold flex items-center gap-2 shadow-xs"
            >
              <Plus size={16} />
              {SECTION.createLabel}
            </Button>
          </Can>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border-main shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-border-main flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <span>{SECTION.label}</span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-muted-foreground/10 text-muted-foreground">
                  {workStages.length} records
                </span>
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {SECTION.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto sm:max-w-md sm:flex-1 sm:justify-end">
            <div className="relative flex-1 sm:max-w-xs">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search work stages..."
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
          </div>
        </div>

        {searchQuery && (
          <div className="px-5 py-2.5 bg-muted-foreground/5 border-b border-border-main flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Showing {filteredRows.length} of {workStages.length} work stages
              matching &quot;<strong className="text-foreground">{searchQuery}</strong>&quot;
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

        {filteredRows.length ? (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-border-main">
              <thead className="bg-muted-foreground/5">
                <tr>
                  <th className="px-6 py-3.5 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider w-24">
                    S/No.
                  </th>
                  <th className="px-6 py-3.5 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider">
                    {SECTION.singular} Name
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
                              onClick={() => openEdit(row)}
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
                                const ok = await deleteWorkStage(row.id, row.name);
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
          <div className="px-6 py-16 text-center flex flex-col items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-muted-foreground/10 flex items-center justify-center text-muted-foreground mb-4">
              <Inbox size={28} />
            </div>
            {searchQuery ? (
              <>
                <h4 className="text-base font-bold text-foreground">
                  No work stages found
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  We couldn&apos;t find any work stages matching &quot;{searchQuery}&quot;.
                  Try a different search term.
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
                  No work stages recorded yet
                </h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Get started by adding your first work stage to the system.
                </p>
                <Can permission={PERMISSIONS.DESIGN_ACTIVITY_CREATE}>
                  <Button
                    variant="primary"
                    onClick={openCreate}
                    className="mt-4 h-9 text-xs px-4 font-semibold flex items-center gap-1.5"
                  >
                    <Plus size={15} />
                    {SECTION.createLabel}
                  </Button>
                </Can>
              </>
            )}
          </div>
        )}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fade-in"
            onClick={closeModal}
          />
          <div className="bg-card border border-border-main w-full max-w-md rounded-2xl shadow-2xl z-10 relative overflow-hidden animate-slide-up">
            <div className="px-6 py-4 border-b border-border-main flex items-center justify-between bg-muted-foreground/5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    {modalTitle}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {SECTION.badgeText} Master Entry
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

            <div className="p-6 space-y-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-foreground">
                  {SECTION.singular} Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={itemName}
                  placeholder={SECTION.placeholder}
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
                    Provide a clear, standard name for this master{" "}
                    {SECTION.singular.toLowerCase()}.
                  </p>
                )}
              </div>
            </div>

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
