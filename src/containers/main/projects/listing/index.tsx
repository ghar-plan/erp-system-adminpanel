import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Trash2,
  Eye,
  Pencil,
  MessageSquare,
  CircleCheck,
  CircleX,
  PackagePlus,
  X,
} from "lucide-react";
import useProjects from "../useHooks";
import {
  ConstructionType,
  PaymentPlan,
  Project,
  ProjectStatus,
  constructionTypeLabel,
  paymentPlanLabel,
} from "@/utils/helpers/models/projects/project.dto";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";

interface ProjectFilters {
  region: string;
  subregion: string;
  constructionType: string;
  paymentPlan: string;
  managerName: string;
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
}

interface PullableVendor {
  id: string;
  vendorName: string;
  materials: Array<{ id: string; name: string }>;
}

interface PullSelection {
  vendorId: string;
  materialId: string;
  materialName: string;
  vendorName: string;
  quantity: string;
  uom: string;
}

const UOM_OPTIONS = [
  "CFT",
  "Bags",
  "Rft",
  "Sft",
  "Nos",
  "Kg",
  "Liters",
  "Tons",
  "Hours",
  "Days",
  "Lumpsum",
];

const emptyFilters: ProjectFilters = {
  region: "",
  subregion: "",
  constructionType: "",
  paymentPlan: "",
  managerName: "",
  startDate: "",
  endDate: "",
  page: 1,
  limit: 10,
};

export default function ProjectListing() {
  const { hasPermission, isSuperAdmin } = usePermissions();
  const {
    getProjects,
    deleteProject,
    updateProjectStatus,
    getProjectFilterOptions,
    getPullableMaterials,
    pullMaterials,
  } = useProjects();
  const canView = hasPermission(PERMISSIONS.CONSTRUCTION_SITE_READ);
  const canUpdate = hasPermission(PERMISSIONS.CONSTRUCTION_SITE_UPDATE);
  const canDelete = isSuperAdmin;
  const canComments = hasPermission(PERMISSIONS.COMMENTS_READ);
  const showActions = canView || canUpdate || canDelete || canComments;
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [filterOptions, setFilterOptions] = useState({
    cities: [] as string[],
    areas: [] as string[],
    managers: [] as Array<{
      id: string;
      fullName: string;
      phone: string;
      source: string;
    }>,
  });

  const [filters, setFilters] = useState<ProjectFilters>(emptyFilters);

  const [pullModalOpen, setPullModalOpen] = useState(false);
  const [pullProject, setPullProject] = useState<Project | null>(null);
  const [pullVendors, setPullVendors] = useState<PullableVendor[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [selectedMaterialId, setSelectedMaterialId] = useState("");
  const [pullQuantity, setPullQuantity] = useState("");
  const [pullUom, setPullUom] = useState("");
  const [pullSelections, setPullSelections] = useState<PullSelection[]>([]);
  const [pullLoading, setPullLoading] = useState(false);
  const [pullSaving, setPullSaving] = useState(false);
  const [pullError, setPullError] = useState("");

  const fetchProjects = (currentFilters: ProjectFilters) => {
    const queryParams: any = {
      limit: currentFilters.limit,
      offset: (currentFilters.page - 1) * currentFilters.limit,
    };
    if (currentFilters.region) queryParams.region = currentFilters.region;
    if (currentFilters.subregion) queryParams.subregion = currentFilters.subregion;
    if (currentFilters.constructionType)
      queryParams.constructionType = currentFilters.constructionType;
    if (currentFilters.paymentPlan) queryParams.paymentPlan = currentFilters.paymentPlan;
    if (currentFilters.managerName) queryParams.managerName = currentFilters.managerName;
    if (currentFilters.startDate) queryParams.startDate = currentFilters.startDate;
    if (currentFilters.endDate) queryParams.endDate = currentFilters.endDate;

    getProjects(setProjects, queryParams, setTotalElements);
  };

  useEffect(() => {
    getProjectFilterOptions(setFilterOptions);
    fetchProjects({ ...emptyFilters, page: 1 });
  }, []);

  const handleChangeFilter = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    const updatedFilters = { ...filters, page: 1 };
    setFilters(updatedFilters);
    fetchProjects(updatedFilters);
  };

  const handleResetFilters = () => {
    setFilters(emptyFilters);
    fetchProjects(emptyFilters);
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    const nextPage = pageInfo.selected + 1;
    setFilters((prev) => ({
      ...prev,
      page: nextPage,
      limit: pageInfo.limit,
    }));
    fetchProjects({
      ...filters,
      page: nextPage,
      limit: pageInfo.limit,
    });
  };

  const refresh = () => fetchProjects(filters);

  const handleDelete = async (id: string, name: string) => {
    await deleteProject(id, name, refresh);
  };

  const resetPullModal = () => {
    setPullModalOpen(false);
    setPullProject(null);
    setPullVendors([]);
    setSelectedVendorId("");
    setSelectedMaterialId("");
    setPullQuantity("");
    setPullUom("");
    setPullSelections([]);
    setPullLoading(false);
    setPullSaving(false);
    setPullError("");
  };

  const openPullModal = async (project: Project) => {
    setPullProject(project);
    setPullModalOpen(true);
    setPullVendors([]);
    setSelectedVendorId("");
    setSelectedMaterialId("");
    setPullQuantity("");
    setPullUom("");
    setPullSelections([]);
    setPullError("");
    setPullLoading(true);
    await getPullableMaterials(project.id, setPullVendors);
    setPullLoading(false);
  };

  const selectedVendor = pullVendors.find((v) => v.id === selectedVendorId);
  const vendorMaterials = selectedVendor?.materials || [];

  const handleAddPullSelection = () => {
    setPullError("");
    if (!selectedVendorId || !selectedMaterialId) {
      setPullError("Select a vendor and a material to add.");
      return;
    }
    if (!pullUom) {
      setPullError("Select a UOM (unit) to add.");
      return;
    }
    const vendor = pullVendors.find((v) => v.id === selectedVendorId);
    const material = vendor?.materials.find((m) => m.id === selectedMaterialId);
    if (!vendor || !material) {
      setPullError("Selected vendor or material is invalid.");
      return;
    }
    const alreadyAdded = pullSelections.some(
      (item) =>
        item.vendorId === selectedVendorId &&
        item.materialId === selectedMaterialId,
    );
    if (alreadyAdded) {
      setPullError("This material is already added for the selected vendor.");
      return;
    }
    setPullSelections((prev) => [
      ...prev,
      {
        vendorId: vendor.id,
        materialId: material.id,
        materialName: material.name,
        vendorName: vendor.vendorName,
        quantity: pullQuantity,
        uom: pullUom,
      },
    ]);
    setSelectedMaterialId("");
    setPullQuantity("");
    setPullUom("");
  };

  const handleRemovePullSelection = (vendorId: string, materialId: string) => {
    setPullSelections((prev) =>
      prev.filter(
        (item) =>
          !(item.vendorId === vendorId && item.materialId === materialId),
      ),
    );
  };

  const handleSubmitPull = async () => {
    if (!pullProject) return;
    if (pullSelections.length === 0) {
      setPullError("Add at least one material to pull.");
      return;
    }
    setPullSaving(true);
    setPullError("");
    const response = await pullMaterials(
      pullProject.id,
      pullSelections.map((item) => ({
        vendorId: item.vendorId,
        materialId: item.materialId,
        uom: item.uom,
        ...(item.quantity !== ""
          ? { quantity: Number(item.quantity) }
          : {}),
      })),
    );
    setPullSaving(false);
    if (response) {
      resetPullModal();
    }
  };

  const columns = [
    "S/No.",
    "Site Name",
    "Manager",
    "Type (Construction)",
    "Payment Plan",
    "Start Date",
    ...(showActions ? ["Actions"] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in  ">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
              Projects
            </h1>
          </div>
        </div>
        <Can permission={PERMISSIONS.CONSTRUCTION_SITE_CREATE}>
          <Link
            to="/projects/create"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap self-start sm:self-auto text-sm"
          >
            <Plus size={18} />
            Create Project
          </Link>
        </Can>
      </div>

      <div className="bg-muted-foreground/5 border border-border-main p-4 rounded-xl animate-fade-in shadow-xs flex flex-wrap items-end justify-start md:justify-end gap-3 w-full">
        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label htmlFor="region" className="text-xs text-foreground font-medium whitespace-nowrap">
            City
          </label>
          <select
            name="region"
            id="region"
            value={filters.region}
            onChange={handleChangeFilter}
            className="common-input h-10 w-full sm:w-40 text-sm bg-card"
          >
            <option value="">All cities</option>
            {filterOptions.cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label htmlFor="subregion" className="text-xs text-foreground font-medium whitespace-nowrap">
            Area
          </label>
          <select
            name="subregion"
            id="subregion"
            value={filters.subregion}
            onChange={handleChangeFilter}
            className="common-input h-10 w-full sm:w-40 text-sm bg-card"
          >
            <option value="">All areas</option>
            {filterOptions.areas.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label htmlFor="constructionType" className="text-xs text-foreground font-medium whitespace-nowrap">
            Construction Type
          </label>
          <select
            name="constructionType"
            id="constructionType"
            value={filters.constructionType}
            onChange={handleChangeFilter}
            className="common-input h-10 w-full sm:w-44 text-sm bg-card"
          >
            <option value="">All types</option>
            <option value={ConstructionType.GREY_STRUCTURE}>Grey Structure</option>
            <option value={ConstructionType.FINISHING}>Finishing</option>
            <option value={ConstructionType.RENOVATION}>Renovation</option>
          </select>
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label htmlFor="paymentPlan" className="text-xs text-foreground font-medium whitespace-nowrap">
            Payment Plan
          </label>
          <select
            name="paymentPlan"
            id="paymentPlan"
            value={filters.paymentPlan}
            onChange={handleChangeFilter}
            className="common-input h-10 w-full sm:w-40 text-sm bg-card"
          >
            <option value="">All plans</option>
            <option value={PaymentPlan.LUMP_SUM}>Lump Sum</option>
            <option value={PaymentPlan.MARKUP}>Cost Plus</option>
          </select>
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label htmlFor="managerName" className="text-xs text-foreground font-medium whitespace-nowrap">
            Manager
          </label>
          <select
            name="managerName"
            id="managerName"
            value={filters.managerName}
            onChange={handleChangeFilter}
            className="common-input h-10 w-full sm:w-44 text-sm bg-card"
          >
            <option value="">All Manager</option>
            {filterOptions.managers.map((manager) => (
              <option
                key={`${manager.source}-${manager.id}`}
                value={manager.fullName}
              >
                {manager.fullName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label htmlFor="startDate" className="text-xs text-foreground font-medium whitespace-nowrap">
            From
          </label>
          <input
            type="date"
            name="startDate"
            id="startDate"
            value={filters.startDate}
            onChange={handleChangeFilter}
            className="common-input h-10 w-full sm:w-40 text-sm"
          />
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label htmlFor="endDate" className="text-xs text-foreground font-medium whitespace-nowrap">
            To
          </label>
          <input
            type="date"
            name="endDate"
            id="endDate"
            value={filters.endDate}
            onChange={handleChangeFilter}
            className="common-input h-10 w-full sm:w-40 text-sm"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end min-w-[170px]">
          <Button
            variant="primary"
            onClick={handleApplyFilters}
            className="h-10 text-xs px-6 font-semibold flex-1 sm:flex-initial !py-0"
          >
            Apply
          </Button>
          <Button
            variant="secondary"
            onClick={handleResetFilters}
            className="h-10 text-xs px-6 font-semibold flex-1 sm:flex-initial !py-0"
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="w-full flex flex-col gap-4">
        {projects.length > 0 ? (
          <div className="bg-card rounded-xl border border-border-main overflow-hidden shadow-xs animate-slide-up">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-main">
                <thead className="bg-muted-foreground/5">
                  <tr className="text-left">
                    {columns.map((column, index) => (
                      <th
                        className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                        key={index}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-border-main bg-card text-foreground">
                  {projects.map((project, index) => (
                    <tr
                      key={project.id}
                      className="hover:bg-muted-foreground/5 transition-colors"
                    >
                      <td className="table-td">
                        {(filters.page - 1) * filters.limit + index + 1}
                      </td>
                      <td className="table-td font-semibold text-foreground">
                        {project?.siteName || "--"}
                      </td>
                      <td className="table-td">{project?.managerName || "--"}</td>
                      <td className="table-td">
                        {constructionTypeLabel(project?.constructionType)}
                      </td>
                      <td className="table-td">
                        {paymentPlanLabel(project?.paymentPlan)}
                      </td>
                      <td className="table-td">
                        {project?.startDate
                          ? new Date(project.startDate).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              },
                            )
                          : "--"}
                      </td>
                      {showActions ? (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {canView ? (
                              <Link
                                to={`/projects/view/${project.id}`}
                                className="btn-action-view"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </Link>
                            ) : null}
                            {canUpdate ? (
                              <Link
                                to={`/projects/edit/${project.id}`}
                                className="btn-action-edit"
                                title="Edit Project"
                              >
                                <Pencil size={16} />
                              </Link>
                            ) : null}
                            {canUpdate ? (
                              <button
                                type="button"
                                onClick={() => openPullModal(project)}
                                className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors cursor-pointer"
                                title="Pull Material"
                              >
                                <PackagePlus size={14} />
                                Pull Material
                              </button>
                            ) : null}
                            {canUpdate ? (
                              <button
                                type="button"
                                onClick={() =>
                                  updateProjectStatus(
                                    project.id,
                                    project.siteName,
                                    ProjectStatus.COMPLETED,
                                    refresh,
                                  )
                                }
                                className="btn-action-view"
                                title="Mark as Completed"
                              >
                                <CircleCheck size={16} />
                              </button>
                            ) : null}
                            {canUpdate ? (
                              <button
                                type="button"
                                onClick={() =>
                                  updateProjectStatus(
                                    project.id,
                                    project.siteName,
                                    ProjectStatus.CLOSED,
                                    refresh,
                                  )
                                }
                                className="btn-action-delete"
                                title="Mark as Closed"
                              >
                                <CircleX size={16} />
                              </button>
                            ) : null}
                            {canDelete ? (
                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(project.id, project.siteName)
                                }
                                className="btn-action-delete"
                                title="Delete Project"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : null}
                            {canComments ? (
                              <Link
                                to={`${siteRoutes.comments}?projectId=${project.id}`}
                                className="btn-action-view"
                                title="Comments"
                              >
                                <MessageSquare size={16} />
                              </Link>
                            ) : null}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <DataNotFound show={true} />
        )}

        {totalElements > 0 && (
          <Pagination
            count={totalElements}
            page={filters.page}
            limit={filters.limit}
            onPageChange={onPageChange}
          />
        )}
      </div>

      {pullModalOpen && pullProject ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => {
              if (!pullSaving) resetPullModal();
            }}
          />
          <div className="bg-card border border-border-main w-full max-w-xl rounded-2xl shadow-xl overflow-hidden z-10 animate-scale-up relative max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-border-main flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <PackagePlus size={20} className="text-primary" />
                  Pull Material
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {pullProject.siteName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!pullSaving) resetPullModal();
                }}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted-foreground/5 cursor-pointer"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Only vendors linked to this project through a vendor contract
                are shown. Select materials they supply and pull them against
                this project.
              </p>

              {pullLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading vendors and materials...
                </p>
              ) : pullVendors.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No vendor contracts with materials are linked to this project.
                </p>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block ui-form-label">Vendor</label>
                      <select
                        value={selectedVendorId}
                        onChange={(e) => {
                          setSelectedVendorId(e.target.value);
                          setSelectedMaterialId("");
                          setPullError("");
                        }}
                        className="common-input"
                        disabled={pullSaving}
                      >
                        <option value="">Select vendor</option>
                        {pullVendors.map((vendor) => (
                          <option key={vendor.id} value={vendor.id}>
                            {vendor.vendorName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block ui-form-label">
                        Material
                      </label>
                      <select
                        value={selectedMaterialId}
                        onChange={(e) => {
                          setSelectedMaterialId(e.target.value);
                          setPullError("");
                        }}
                        className="common-input"
                        disabled={pullSaving || !selectedVendorId}
                      >
                        <option value="">Select material</option>
                        {vendorMaterials.map((material) => (
                          <option key={material.id} value={material.id}>
                            {material.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 items-end">
                    <div className="flex-1 w-full">
                      <label className="mb-2 block ui-form-label">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={pullQuantity}
                        onChange={(e) => setPullQuantity(e.target.value)}
                        className="common-input"
                        placeholder="e.g. 10"
                        disabled={pullSaving}
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <label className="mb-2 block ui-form-label">
                        UOM (Unit)
                      </label>
                      <select
                        value={pullUom}
                        onChange={(e) => {
                          setPullUom(e.target.value);
                          setPullError("");
                        }}
                        className="common-input cursor-pointer"
                        disabled={pullSaving}
                      >
                        <option value="">Select UOM</option>
                        {UOM_OPTIONS.map((uom) => (
                          <option key={uom} value={uom}>
                            {uom}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Button
                      variant="secondary"
                      onClick={handleAddPullSelection}
                      disabled={pullSaving}
                      className="h-10 text-xs px-5 font-semibold w-full sm:w-auto"
                    >
                      Add Material
                    </Button>
                  </div>

                  {pullError ? (
                    <p className="text-xs text-red-500 font-semibold">
                      {pullError}
                    </p>
                  ) : null}

                  {pullSelections.length > 0 ? (
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Materials to Pull
                      </label>
                      <div className="rounded-xl border border-border-main divide-y divide-border-main max-h-48 overflow-y-auto">
                        {pullSelections.map((item) => (
                          <div
                            key={`${item.vendorId}-${item.materialId}`}
                            className="flex items-center justify-between gap-3 px-3 py-2.5"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">
                                {item.materialName}
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {item.vendorName}
                                {item.quantity !== ""
                                  ? ` · Qty ${item.quantity}`
                                  : ""}
                                {item.uom ? ` ${item.uom}` : ""}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemovePullSelection(
                                  item.vendorId,
                                  item.materialId,
                                )
                              }
                              className="btn-action-delete"
                              title="Remove"
                              disabled={pullSaving}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            <div className="px-6 py-4 bg-muted-foreground/5 border-t border-border-main flex gap-3 justify-end shrink-0">
              <Button
                variant="secondary"
                onClick={resetPullModal}
                disabled={pullSaving}
                className="h-10 text-xs px-6 font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmitPull}
                disabled={
                  pullSaving ||
                  pullLoading ||
                  pullVendors.length === 0 ||
                  pullSelections.length === 0
                }
                className="h-10 text-xs px-6 font-semibold"
              >
                {pullSaving ? "Pulling..." : "Pull Materials"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
