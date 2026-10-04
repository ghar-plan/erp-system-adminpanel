import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  Eye,
  Pencil,
  MessageSquare,
  CircleCheck,
  CircleX,
} from "lucide-react";
import useDesignProjects from "../useHooks";
import {
  DesignType,
  Project,
  ProjectStatus,
  designTypeLabel,
  paymentPlanLabel,
} from "@/utils/helpers/models/design/project.dto";
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
  designType: string;
  managerName: string;
  status: string;
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
}

const emptyFilters: ProjectFilters = {
  region: "",
  subregion: "",
  designType: "",
  managerName: "",
  status: "",
  startDate: "",
  endDate: "",
  page: 1,
  limit: 10,
};

export default function DesignProjectListing() {
  const { hasPermission } = usePermissions();
  const {
    getProjects,
    updateProjectStatus,
    getProjectFilterOptions,
  } = useDesignProjects();
  const canView = hasPermission(PERMISSIONS.DESIGN_PROJECTS_READ);
  const canUpdate = hasPermission(PERMISSIONS.DESIGN_PROJECTS_UPDATE);
  const canComments = hasPermission(PERMISSIONS.DESIGN_COMMENTS_READ);
  const showActions = canView || canUpdate || canComments;
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

  const fetchProjects = (currentFilters: ProjectFilters) => {
    const queryParams: any = {
      limit: currentFilters.limit,
      offset: (currentFilters.page - 1) * currentFilters.limit,
    };
    if (currentFilters.region) queryParams.region = currentFilters.region;
    if (currentFilters.subregion) queryParams.subregion = currentFilters.subregion;
    if (currentFilters.designType)
      queryParams.designType = currentFilters.designType;
    if (currentFilters.managerName) queryParams.managerName = currentFilters.managerName;
    if (currentFilters.status) queryParams.status = currentFilters.status;
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

  const columns = [
    "S/No.",
    "Site Name",
    "Architecture",
    "Type (Design)",
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
              Design Projects
            </h1>
          </div>
        </div>
        <Can permission={PERMISSIONS.DESIGN_PROJECTS_CREATE}>
          <Link
            to={siteRoutes.designProjectsCreate}
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
          <label htmlFor="designType" className="text-xs text-foreground font-medium whitespace-nowrap">
            Type (Design)
          </label>
          <select
            name="designType"
            id="designType"
            value={filters.designType}
            onChange={handleChangeFilter}
            className="common-input h-10 w-full sm:w-44 text-sm bg-card"
          >
            <option value="">All types</option>
            <option value={DesignType.GREY_STRUCTURE}>Grey Structure</option>
            <option value={DesignType.FINISHING}>Finishing</option>
            <option value={DesignType.RENOVATION}>Renovation</option>
          </select>
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label htmlFor="status" className="text-xs text-foreground font-medium whitespace-nowrap">
            Status
          </label>
          <select
            name="status"
            id="status"
            value={filters.status}
            onChange={handleChangeFilter}
            className="common-input h-10 w-full sm:w-40 text-sm bg-card"
          >
            <option value="">All statuses</option>
            <option value={ProjectStatus.ACTIVE}>Active</option>
            <option value={ProjectStatus.COMPLETED}>Completed</option>
            <option value={ProjectStatus.CLOSED}>Closed</option>
          </select>
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label htmlFor="managerName" className="text-xs text-foreground font-medium whitespace-nowrap">
            Architecture
          </label>
          <select
            name="managerName"
            id="managerName"
            value={filters.managerName}
            onChange={handleChangeFilter}
            className="common-input h-10 w-full sm:w-44 text-sm bg-card"
          >
            <option value="">All Architecture</option>
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
                        {designTypeLabel(project?.designType)}
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
                                to={`${siteRoutes.designProjects}/view/${project.id}`}
                                className="btn-action-view"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </Link>
                            ) : null}
                            {canUpdate ? (
                              <Link
                                to={`${siteRoutes.designProjects}/edit/${project.id}`}
                                className="btn-action-edit"
                                title="Edit Project"
                              >
                                <Pencil size={16} />
                              </Link>
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
                            {canComments ? (
                              <Link
                                to={`${siteRoutes.designComments}?projectId=${project.id}`}
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
    </div>
  );
}
