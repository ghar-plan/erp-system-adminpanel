import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Trash2, Eye, Pencil, Loader2, X } from "lucide-react";
import useVendors from "../useHooks";
import { Vendor } from "@/utils/helpers/models/vendors/vendor.dto";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";

interface VendorFilters {
  search: string;
  vendorType: string;
  city: string;
  page: number;
  limit: number;
}

const emptyFilters: VendorFilters = {
  search: "",
  vendorType: "",
  city: "",
  page: 1,
  limit: 10,
};

export default function VendorListing() {
  const { hasPermission, isSuperAdmin } = usePermissions();
  const {
    getVendors,
    deleteVendor,
    getVendorFilterOptions,
    getMaterials,
    createMaterial,
    updateMaterial,
    deleteMaterial,
  } = useVendors();
  const canView = hasPermission(PERMISSIONS.VENDORS_READ);
  const canUpdate = hasPermission(PERMISSIONS.VENDORS_UPDATE);
  const canDelete = isSuperAdmin;
  const showActions = canView || canUpdate || canDelete;
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [filterOptions, setFilterOptions] = useState({
    cities: [] as string[],
  });

  const [searchVal, setSearchVal] = useState("");
  const [filters, setFilters] = useState<VendorFilters>(emptyFilters);

  // Create / Edit Material Modal
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [materialName, setMaterialName] = useState("");
  const [materialSaving, setMaterialSaving] = useState(false);
  const [materialError, setMaterialError] = useState("");
  const [materialsList, setMaterialsList] = useState<{ id: string; name: string }[]>([]);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);

  const fetchVendors = (currentFilters: VendorFilters) => {
    const queryParams: any = {
      limit: currentFilters.limit,
      offset: (currentFilters.page - 1) * currentFilters.limit,
    };
    if (currentFilters.search) queryParams.search = currentFilters.search;
    if (currentFilters.vendorType)
      queryParams.vendorType = currentFilters.vendorType;
    if (currentFilters.city) queryParams.city = currentFilters.city;

    getVendors(setVendors, queryParams, setTotalElements);
  };

  useEffect(() => {
    getVendorFilterOptions(setFilterOptions);
    fetchVendors({ ...emptyFilters, page: 1 });
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
    const updatedFilters = { ...filters, search: searchVal, page: 1 };
    setFilters(updatedFilters);
    fetchVendors(updatedFilters);
  };

  const handleResetFilters = () => {
    setSearchVal("");
    setFilters(emptyFilters);
    fetchVendors(emptyFilters);
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    const nextPage = pageInfo.selected + 1;
    setFilters((prev) => ({
      ...prev,
      page: nextPage,
      limit: pageInfo.limit,
    }));
    fetchVendors({
      ...filters,
      page: nextPage,
      limit: pageInfo.limit,
    });
  };

  const handleDelete = async (id: string, name: string) => {
    await deleteVendor(id, name, () => fetchVendors(filters));
  };

  const resetMaterialModal = () => {
    setIsMaterialModalOpen(false);
    setMaterialName("");
    setMaterialError("");
    setEditingMaterialId(null);
  };

  const openMaterialModal = () => {
    setMaterialName("");
    setMaterialError("");
    setEditingMaterialId(null);
    setIsMaterialModalOpen(true);
    getMaterials(setMaterialsList);
  };

  const startEditMaterial = (material: { id: string; name: string }) => {
    setEditingMaterialId(material.id);
    setMaterialName(material.name);
    setMaterialError("");
  };

  const handleDeleteMaterial = async (material: { id: string; name: string }) => {
    const deleted = await deleteMaterial(material.id, material.name);
    if (deleted) {
      if (editingMaterialId === material.id) {
        setEditingMaterialId(null);
        setMaterialName("");
        setMaterialError("");
      }
      getMaterials(setMaterialsList);
    }
  };

  const handleSaveMaterial = async () => {
    const trimmed = materialName.trim();
    if (!trimmed) {
      setMaterialError("Material name is required");
      return;
    }
    setMaterialSaving(true);
    setMaterialError("");
    const wasEditing = !!editingMaterialId;
    const saved = editingMaterialId
      ? await updateMaterial(editingMaterialId, trimmed)
      : await createMaterial(trimmed);
    setMaterialSaving(false);
    if (saved) {
      setMaterialName("");
      setEditingMaterialId(null);
      getMaterials(setMaterialsList);
      if (wasEditing) {
        fetchVendors(filters);
      }
    }
  };

  const getVendorTypeBadgeClass = (type: string) => {
    switch (type) {
      case "vendorMaterial":
      case "Raw Material":
        return "bg-success-bg text-success-text border border-panel-border";
      case "vendorLabour":
      case "Sub Contractor":
        return "bg-accent-bg text-accent-text border border-panel-border";
      default:
        return "bg-info-bg text-info-text border border-panel-border";
    }
  };

  const getVendorTypeLabel = (type: string) => {
    switch (type) {
      case "vendorMaterial":
        return "Material";
      case "vendorLabour":
        return "Labor";
      case "Both":
        return "Both";
      default:
        return type || "--";
    }
  };

  const columns = [
    "Sr No.",
    "Name",
    "Job Description",
    "Type",
    "Phone",
    "City",
    ...(showActions ? ["Actions"] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
            Vendor Profiles
          </h1>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <Can permission={PERMISSIONS.VENDORS_CREATE}>
            <button
              onClick={openMaterialModal}
              className="flex h-10 px-4 items-center justify-center gap-2 rounded-md border border-border-main bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-foreground text-sm font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Plus size={16} />
              Create Material
            </button>
          </Can>
          <Can permission={PERMISSIONS.VENDORS_CREATE}>
            <Link
              to="/vendors/create"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap text-sm"
            >
              <Plus size={18} />
              Create Vendor
            </Link>
          </Can>
        </div>
      </div>

      <div className="bg-muted-foreground/5 border border-border-main p-4 rounded-xl animate-fade-in shadow-xs flex flex-wrap items-end justify-start md:justify-end gap-3 w-full">
        <div className="flex flex-col items-start gap-1 w-full sm:max-w-sm flex-1 md:max-w-md min-w-[260px]">
          <label
            htmlFor="search"
            className="text-xs text-foreground font-medium whitespace-nowrap"
          >
            Search
          </label>
          <div className="relative w-full">
            <Search
              className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground/80"
              size={16}
            />
            <input
              type="search"
              name="search"
              placeholder="Search by name or phone..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="common-input pl-10 pr-4 text-sm h-10 w-full"
            />
          </div>
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label
            htmlFor="city"
            className="text-xs text-foreground font-medium whitespace-nowrap"
          >
            City
          </label>
          <select
            name="city"
            id="city"
            value={filters.city}
            onChange={handleChangeFilter}
            className="common-input text-sm h-10 w-full sm:w-40 bg-card"
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
          <label
            htmlFor="vendorType"
            className="text-xs text-foreground font-medium whitespace-nowrap"
          >
            Type
          </label>
          <select
            name="vendorType"
            id="vendorType"
            value={filters.vendorType}
            onChange={handleChangeFilter}
            className="common-input text-sm h-10 w-full sm:w-40 bg-card"
          >
            <option value="">All types</option>
            <option value="Both">Both</option>
            <option value="vendorMaterial">Material</option>
            <option value="vendorLabour">Labor</option>
          </select>
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
        {vendors.length > 0 ? (
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
                  {vendors.map((vendor, index) => (
                    <tr
                      key={vendor.id}
                      className="hover:bg-muted-foreground/5 transition-colors"
                    >
                      <td className="table-td">
                        {(filters.page - 1) * filters.limit + index + 1}
                      </td>
                      <td className="table-td font-semibold text-foreground">
                        {vendor?.vendorName || "--"}
                      </td>
                      <td className="table-td">
                        {vendor?.jobDescription || "--"}
                      </td>
                      <td className="table-td">
                        <span
                          className={`px-2.5 py-1 text-xs font-bold tracking-wide rounded-md ${getVendorTypeBadgeClass(vendor?.vendorType || "")}`}
                        >
                          {getVendorTypeLabel(vendor?.vendorType || "")}
                        </span>
                      </td>
                      <td className="table-td">{vendor?.phone || "--"}</td>
                      <td className="table-td">{vendor?.city || "--"}</td>
                      {showActions ? (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {canView ? (
                              <Link
                                to={`/vendors/view/${vendor.id}`}
                                className="btn-action-view"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </Link>
                            ) : null}
                            {canUpdate ? (
                              <Link
                                to={`/vendors/edit/${vendor.id}`}
                                className="btn-action-edit"
                                title="Edit Vendor"
                              >
                                <Pencil size={16} />
                              </Link>
                            ) : null}
                            {canDelete ? (
                              <button
                                onClick={() =>
                                  handleDelete(vendor.id, vendor.vendorName)
                                }
                                className="btn-action-delete"
                                title="Delete"
                              >
                                <Trash2 size={16} />
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

      {/* Create / Edit Material Modal */}
      {isMaterialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => {
              if (!materialSaving) resetMaterialModal();
            }}
          />

          <div className="bg-card border border-border-main w-full max-w-md rounded-2xl shadow-xl overflow-hidden z-10 animate-scale-up relative">
            <div className="px-6 py-4 border-b border-border-main flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                {editingMaterialId ? (
                  <Pencil size={20} className="text-primary" />
                ) : (
                  <Plus size={20} className="text-primary" />
                )}
                {editingMaterialId ? "Edit Material" : "Create Material"}
              </h3>
              <button
                onClick={() => {
                  if (!materialSaving) resetMaterialModal();
                }}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted-foreground/5 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {editingMaterialId
                  ? "Fix the spelling and save. Vendors already linked keep this material."
                  : "Add a material that can be selected when creating a vendor."}
              </p>
              <div>
                <label className="mb-2 block ui-form-label">Material Name</label>
                <input
                  type="text"
                  value={materialName}
                  onChange={(e) => {
                    setMaterialName(e.target.value);
                    if (materialError) setMaterialError("");
                  }}
                  placeholder="e.g. Cement"
                  className={`common-input ${materialError ? "border-red-500 focus:border-red-500" : ""}`}
                  disabled={materialSaving}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveMaterial();
                    }
                  }}
                />
                {materialError ? (
                  <p className="mt-1.5 text-xs text-red-500 font-semibold">
                    {materialError}
                  </p>
                ) : null}
              </div>

              {!editingMaterialId && materialsList.length > 0 ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Existing Materials
                  </label>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-border-main divide-y divide-border-main">
                    {materialsList.map((material) => (
                      <div
                        key={material.id}
                        className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-muted-foreground/5"
                      >
                        <span className="text-sm font-medium text-foreground truncate">
                          {material.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditMaterial(material)}
                            className="btn-action-edit"
                            title="Edit material"
                            disabled={materialSaving}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteMaterial(material)}
                            className="btn-action-delete"
                            title="Delete material"
                            disabled={materialSaving}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="px-6 py-4 bg-muted-foreground/5 border-t border-border-main flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  if (editingMaterialId) {
                    setEditingMaterialId(null);
                    setMaterialName("");
                    setMaterialError("");
                  } else {
                    resetMaterialModal();
                  }
                }}
                disabled={materialSaving}
                className="h-10 text-xs px-6 font-semibold"
              >
                {editingMaterialId ? "Back" : "Cancel"}
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveMaterial}
                disabled={materialSaving}
                className="h-10 text-xs px-6 font-semibold flex items-center justify-center gap-2"
              >
                {materialSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Saving...
                  </>
                ) : editingMaterialId ? (
                  "Save Changes"
                ) : (
                  "Create Material"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
