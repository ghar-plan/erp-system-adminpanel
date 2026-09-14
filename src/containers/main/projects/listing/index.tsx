import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Trash2, Eye, Building2, Pencil } from "lucide-react";
import useProjects from "../useHooks";
import { Project, PaymentPlan } from "@/utils/helpers/models/projects/project.dto";
import { getFilePathWithBackendUrl } from "@/utils/helpers/common/http-methods";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";

interface ProjectFilters {
  search: string;
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
}

export default function ProjectListing() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { getProjects, deleteProject } = useProjects();
  const canView = hasPermission(PERMISSIONS.CONSTRUCTION_SITE_READ);
  const canUpdate = hasPermission(PERMISSIONS.CONSTRUCTION_SITE_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.CONSTRUCTION_SITE_DELETE);
  const showActions = canView || canUpdate || canDelete;
  const [projects, setProjects] = useState<Project[]>([]);
  const [totalElements, setTotalElements] = useState(0);

  const [searchVal, setSearchVal] = useState("");

  // Filters State
  const [filters, setFilters] = useState<ProjectFilters>({
    search: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 10,
  });

  const fetchProjects = (currentFilters: ProjectFilters) => {
    const queryParams: any = {
      limit: currentFilters.limit,
      offset: (currentFilters.page - 1) * currentFilters.limit,
    };
    if (currentFilters.search) queryParams.search = currentFilters.search;
    if (currentFilters.startDate)
      queryParams.startDate = currentFilters.startDate;
    if (currentFilters.endDate) queryParams.endDate = currentFilters.endDate;

    getProjects(setProjects, queryParams, setTotalElements);
  };

  // Triggers search on initial mount only
  useEffect(() => {
    fetchProjects({ ...filters, page: 1 });
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
    fetchProjects(updatedFilters);
  };

  const handleResetFilters = () => {
    setSearchVal("");
    const cleared = {
      search: "",
      startDate: "",
      endDate: "",
      page: 1,
      limit: 10,
    };
    setFilters(cleared);
    fetchProjects(cleared);
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

  const handleDelete = async (id: string, name: string) => {
    await deleteProject(id, name, () => fetchProjects(filters));
  };

  const columns = [
    "Sr No.",
    "Image",
    "Site Name",
    "Client",
    "Region",
    "Subregion",
    "Construction Type",
    "Payment Plan",
    "Start Date",
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
              Projects
            </h1>
            {/* <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary border border-primary/20">
              {totalElements} Total
            </span> */}
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
              placeholder="Search construction sites..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="common-input pl-10 pr-4 text-sm h-10 w-full"
            />
          </div>
        </div>

        {/* From Date */}
        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label
            htmlFor="startDate"
            className="text-xs text-foreground font-medium whitespace-nowrap"
          >
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

        {/* To Date */}
        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label
            htmlFor="endDate"
            className="text-xs text-foreground font-medium whitespace-nowrap"
          >
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
        {projects.length > 0 ? (
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
                  {projects.map((project, index) => (
                    <tr
                      key={project.id}
                      className="hover:bg-muted-foreground/5 transition-colors"
                    >
                      <td className="table-td">
                        {(filters.page - 1) * filters.limit + index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {project?.media?.url ? (
                          <img
                            src={getFilePathWithBackendUrl(project.media.url)}
                            alt={project?.siteName || "Project"}
                            className="w-12 h-12 rounded-xl object-cover border border-border-main shadow-xs"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl border border-border-main bg-bg-input flex items-center justify-center text-muted-foreground/60 shadow-xs">
                            <Building2 size={18} className="stroke-[1.5]" />
                          </div>
                        )}
                      </td>
                      <td className="table-td font-semibold text-foreground">
                        {project?.siteName || "--"}
                      </td>
                      <td className="table-td">
                        {project?.client?.fullName || "--"}
                      </td>
                      <td className="table-td">{project?.region || "--"}</td>
                      <td className="table-td">{project?.subregion || "--"}</td>
                      <td className="table-td">
                        {project?.constructionType || "--"}
                      </td>
                      <td className="table-td">
                        {project?.paymentPlan === PaymentPlan.MARKUP &&
                        project.markupPercentage !== null &&
                        project.markupPercentage !== undefined
                          ? `${project.paymentPlan} (${Number(project.markupPercentage)}%)`
                          : project?.paymentPlan || "--"}
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
                      <td className="table-td">
                        {project?.created_at
                          ? new Date(project.created_at).toLocaleDateString(
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
                          {canDelete ? (
                            <button
                              onClick={() =>
                                handleDelete(project.id, project.siteName)
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
    </div>
  );
}
