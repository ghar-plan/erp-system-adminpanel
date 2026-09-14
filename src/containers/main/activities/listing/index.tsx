import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Upload,
  FileSpreadsheet,
  Loader2,
  List,
  X,
  Pencil,
  Trash2,
} from "lucide-react";
import useActivities from "../useHooks";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";

interface ActivityFilters {
  search: string;
  page: number;
  limit: number;
}

export default function ActivitiesListing() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { getActivities, uploadActivitiesCsv, deleteActivity, downloadSampleExcel } = useActivities();
  const canUpdate = hasPermission(PERMISSIONS.ACTIVITY_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.ACTIVITY_DELETE);
  const showActions = canUpdate || canDelete;
  const [activities, setActivities] = useState<any[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [csvUploading, setCsvUploading] = useState(false);

  // Modal / Import State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [searchVal, setSearchVal] = useState("");

  // Filters State
  const [filters, setFilters] = useState<ActivityFilters>({
    search: "",
    page: 1,
    limit: 10,
  });

  const fetchActivities = (currentFilters: ActivityFilters) => {
    const queryParams: any = {
      limit: currentFilters.limit,
      offset: (currentFilters.page - 1) * currentFilters.limit,
    };
    if (currentFilters.search) queryParams.search = currentFilters.search;

    getActivities(setActivities, queryParams, setTotalElements);
  };

  // Triggers search on mount
  useEffect(() => {
    fetchActivities({ ...filters, page: 1 });
  }, []);

  const handleChangeFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    const updatedFilters = { ...filters, search: searchVal, page: 1 };
    setFilters(updatedFilters);
    fetchActivities(updatedFilters);
  };

  const handleResetFilters = () => {
    setSearchVal("");
    const cleared = {
      search: "",
      page: 1,
      limit: 10,
    };
    setFilters(cleared);
    fetchActivities(cleared);
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    const nextPage = pageInfo.selected + 1;
    setFilters((prev) => ({
      ...prev,
      page: nextPage,
      limit: pageInfo.limit,
    }));
    fetchActivities({
      ...filters,
      page: nextPage,
      limit: pageInfo.limit,
    });
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setCsvUploading(true);
    await uploadActivitiesCsv(selectedFile);
    fetchActivities({ ...filters, page: 1 });
    setCsvUploading(false);
    setIsImportModalOpen(false);
    setSelectedFile(null);
  };

  const handleDelete = async (id: string, name: string) => {
    await deleteActivity(id, name, () => fetchActivities(filters));
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const dateObj = new Date(dateString);
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return "N/A";
    }
  };

  const columns = [
    "Sr No.",
    "Activity ID",
    "Activity Name",
    "Category",
    "Work Stages",
    "Date of Entry",
    ...(showActions ? ["Actions"] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in  ">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
              Activities
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          <Can permission={PERMISSIONS.ACTIVITY_IMPORT}>
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex h-10 px-4 items-center justify-center gap-2 rounded-md border border-border-main bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-foreground text-sm font-semibold transition-all cursor-pointer shadow-xs"
            >
              <Upload size={16} />
              Import CSV
            </button>
          </Can>

          <Can permission={PERMISSIONS.ACTIVITY_CREATE}>
            <Link
              to="/activity/create"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap text-sm"
            >
              <Plus size={18} />
              Create Activity
            </Link>
          </Can>
        </div>
      </div>

      {/* Filters Toolbar Card */}
      <div className="bg-muted-foreground/5 border border-border-main p-4 rounded-xl animate-fade-in shadow-xs flex flex-wrap items-end justify-start md:justify-end gap-3 w-full">
        {/* Search */}
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
              placeholder="Search by activity name..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="common-input pl-10 pr-4 text-sm h-10 w-full"
            />
          </div>
        </div>

        {/* Action Buttons */}
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

      {/* Table / Grid Container */}
      <div className="w-full flex flex-col gap-4">
        {activities.length > 0 ? (
          <div className="bg-card rounded-xl border border-border-main overflow-hidden shadow-xs animate-slide-up">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-main">
                {/* Table Header */}
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

                {/* Table Body */}
                <tbody className="divide-y divide-border-main bg-card text-foreground">
                  {activities.map((act, index) => (
                    <tr
                      key={act.id}
                      className="hover:bg-muted-foreground/5 transition-colors"
                    >
                      <td className="table-td">
                        {(filters.page - 1) * filters.limit + index + 1}
                      </td>
                      <td className="table-td font-mono">{act.id}</td>
                      <td className="table-td font-semibold text-foreground">
                        {act.name}
                      </td>
                      <td className="table-td font-semibold text-foreground">
                        {act.category || "—"}
                      </td>
                      <td className="table-td font-semibold text-foreground">
                        {act.workStage || "—"}
                      </td>
                      <td className="table-td">{formatDate(act.created_at)}</td>
                      {showActions ? (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          {canUpdate ? (
                            <Link
                              to={`/activity/edit/${act.id}`}
                              className="btn-action-edit"
                              title="Edit Activity"
                            >
                              <Pencil size={16} />
                            </Link>
                          ) : null}
                          {canDelete ? (
                            <button
                              onClick={() => handleDelete(act.id, act.name)}
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

      {/* Import CSV Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => {
              setIsImportModalOpen(false);
              setSelectedFile(null);
            }}
          />

          {/* Modal Content */}
          <div className="bg-card border border-border-main w-full max-w-md rounded-2xl shadow-xl overflow-hidden z-10 animate-scale-up relative">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border-main flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Upload size={20} className="text-primary" />
                Import Activities
              </h3>
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setSelectedFile(null);
                }}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted-foreground/5 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload an Excel (.xlsx) file containing activities. Ensure your file format matches the required structure.
              </p>

              {/* Sample File Download */}
              <div className="p-4 rounded-xl bg-muted-foreground/5 border border-border-main flex items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-foreground">Need a template?</h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Use our predefined format for a smooth import.</p>
                </div>
                <button
                  type="button"
                  onClick={downloadSampleExcel}
                  className="text-xs font-bold text-primary hover:underline whitespace-nowrap cursor-pointer"
                >
                  Download Sample Excel
                </button>
              </div>

              {/* File Drag and Drop / Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Select Excel File
                </label>
                <div className="relative border-2 border-dashed border-border-main hover:border-primary/50 transition-colors rounded-xl p-6 flex flex-col items-center justify-center gap-2 bg-bg-input/20">
                  <input
                    type="file"
                    accept=".xlsx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <FileSpreadsheet size={32} className="text-muted-foreground/60 stroke-[1.5]" />
                  <span className="text-sm text-foreground font-semibold text-center">
                    {selectedFile ? selectedFile.name : "Click or drag file to upload"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {selectedFile ? `${(selectedFile.size / 1024).toFixed(2)} KB` : "Supports only XLSX files"}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 bg-muted-foreground/5 border-t border-border-main flex gap-3 justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsImportModalOpen(false);
                  setSelectedFile(null);
                }}
                disabled={csvUploading}
                className="h-10 text-xs px-6 font-semibold"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpload}
                disabled={!selectedFile || csvUploading}
                className="h-10 text-xs px-6 font-semibold flex items-center justify-center gap-2"
              >
                {csvUploading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Importing...
                  </>
                ) : (
                  "Add Bulk Data"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
