import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Pencil, Plus, Search, Shield, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import { Can } from "@/components/auth/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import {
  formatModuleLabel,
  formatPermissionLabel,
  groupPermissionsByModule,
} from "../group-permissions";
import useRoles from "../useHooks";
import type { RbacRole } from "../types";

export default function RolesListing() {
  const { hasPermission } = usePermissions();
  const { getRolesList, deleteRole, setRoleStatus } = useRoles();
  const canUpdate = hasPermission(PERMISSIONS.ROLES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.ROLES_DELETE);
  const showActions = canUpdate || canDelete;
  const [list, setList] = useState<RbacRole[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchVal, setSearchVal] = useState("");
  const [search, setSearch] = useState("");
  const [statusVal, setStatusVal] = useState("");
  const [status, setStatus] = useState("");
  const [viewing, setViewing] = useState<RbacRole | null>(null);

  const viewingModules = useMemo(
    () => groupPermissionsByModule(viewing?.permissions || []),
    [viewing],
  );

  const fetchRoles = (
    nextPage = page,
    nextLimit = limit,
    nextSearch = search,
    nextStatus = status,
  ) => {
    const queryParams: Record<string, unknown> = {
      limit: nextLimit,
      offset: (nextPage - 1) * nextLimit,
    };
    if (nextSearch.trim()) queryParams.search = nextSearch.trim();
    if (nextStatus) queryParams.status = nextStatus;
    getRolesList(setList, queryParams, setTotalElements);
  };

  useEffect(() => {
    fetchRoles(1, limit, search, status);
  }, []);

  const handleApplyFilters = () => {
    setSearch(searchVal);
    setStatus(statusVal);
    setPage(1);
    fetchRoles(1, limit, searchVal, statusVal);
  };

  const handleResetFilters = () => {
    setSearchVal("");
    setSearch("");
    setStatusVal("");
    setStatus("");
    setPage(1);
    fetchRoles(1, limit, "", "");
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    const nextPage = pageInfo.selected + 1;
    setPage(nextPage);
    setLimit(pageInfo.limit);
    fetchRoles(nextPage, pageInfo.limit, search, status);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
            Roles
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create roles and assign module permissions. A disabled role stays
            assigned but grants no access on login.
          </p>
        </div>
        <Can permission={PERMISSIONS.ROLES_CREATE}>
          <Link
            to={siteRoutes.rolesCreate}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap self-start sm:self-auto text-sm"
          >
            <Plus size={18} />
            Create Role
          </Link>
        </Can>
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
              id="search"
              type="search"
              name="search"
              placeholder="Search by role name..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleApplyFilters();
              }}
              className="common-input pl-10 pr-4 text-sm h-10 w-full"
            />
          </div>
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label
            htmlFor="status"
            className="text-xs text-foreground font-medium whitespace-nowrap"
          >
            Status
          </label>
          <select
            name="status"
            id="status"
            value={statusVal}
            onChange={(e) => setStatusVal(e.target.value)}
            className="common-input text-sm h-10 w-full sm:w-40"
          >
            <option value="">All</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
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
        {list.length > 0 ? (
          <div className="bg-card rounded-xl border border-border-main overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-main">
                <thead className="bg-muted-foreground/5">
                  <tr>
                    {[
                      "Sr No.",
                      "Role",
                      "Permissions",
                      "Created",
                      "Status",
                      ...(showActions ? ["Actions"] : []),
                    ].map((column) => (
                      <th
                        key={column}
                        className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main bg-card text-foreground">
                  {list.map((role, index) => {
                    const enabled = role.status !== false;
                    return (
                      <tr
                        key={role.id}
                        className={`transition-colors ${
                          enabled
                            ? "hover:bg-muted-foreground/5"
                            : "bg-muted-foreground/[0.03] opacity-80"
                        }`}
                      >
                        <td className="table-td">
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td className="table-td font-semibold">
                          <span className="inline-flex items-center gap-2">
                            <Shield size={16} className="text-primary" />
                            {role.name}
                          </span>
                        </td>
                        <td className="table-td">
                          <button
                            type="button"
                            className="text-primary font-semibold hover:underline cursor-pointer"
                            title="View permissions"
                            onClick={() => setViewing(role)}
                          >
                            {role.permissions?.length || 0}
                          </button>
                        </td>
                        <td className="table-td">
                          {role.created_at
                            ? new Date(role.created_at).toLocaleDateString(
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
                          <Can
                            permission={PERMISSIONS.ROLES_UPDATE}
                            fallback={
                              <button
                                type="button"
                                role="switch"
                                aria-checked={enabled}
                                disabled
                                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full ${
                                  enabled
                                    ? "bg-primary"
                                    : "bg-muted-foreground/30"
                                }`}
                              >
                                <span
                                  className={`pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm ${
                                    enabled ? "translate-x-5" : "translate-x-0"
                                  }`}
                                />
                              </button>
                            }
                          >
                            <button
                              type="button"
                              role="switch"
                              aria-checked={enabled}
                              title={
                                enabled ? "Disable role" : "Enable role"
                              }
                              onClick={() =>
                                setRoleStatus(role.id, !enabled, () =>
                                  fetchRoles(page, limit, search, status),
                                )
                              }
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                enabled
                                  ? "bg-primary"
                                  : "bg-muted-foreground/30"
                              }`}
                            >
                              <span
                                className={`pointer-events-none absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                                  enabled ? "translate-x-5" : "translate-x-0"
                                }`}
                              />
                            </button>
                          </Can>
                        </td>
                        {showActions ? (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="btn-action-view"
                              title="View permissions"
                              onClick={() => setViewing(role)}
                            >
                              <Eye size={16} />
                            </button>
                            {canUpdate ? (
                              <Link
                                to={`/roles/edit/${role.id}`}
                                className="btn-action-edit"
                                title="Edit Role"
                              >
                                <Pencil size={16} />
                              </Link>
                            ) : null}
                            {canDelete ? (
                              <button
                                onClick={() =>
                                  deleteRole(role.id, role.name, () =>
                                    fetchRoles(page, limit, search, status),
                                  )
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
                    );
                  })}
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
            page={page}
            limit={limit}
            onPageChange={onPageChange}
          />
        )}
      </div>

      {viewing ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setViewing(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-xl border border-border-main bg-card shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border-main px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  {viewing.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {viewing.permissions?.length || 0} permission
                  {(viewing.permissions?.length || 0) === 1 ? "" : "s"} assigned
                  {viewing.status === false ? " · Role is disabled" : ""}
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted-foreground/10 cursor-pointer"
                onClick={() => setViewing(null)}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 overflow-y-auto space-y-5">
              {viewingModules.length ? (
                viewingModules.map(([module, perms]) => (
                  <div key={module} className="space-y-2">
                    <h3 className="text-sm font-bold text-foreground border-b border-border-main pb-2">
                      {formatModuleLabel(module)}
                    </h3>
                    <div className="grid gap-2 sm:grid-cols-2">
                      {perms.map((permission) => (
                        <div
                          key={permission.id || permission.codename}
                          className="flex items-start justify-between gap-2 rounded-lg border border-border-main px-3 py-2"
                        >
                          <span className="text-sm font-medium text-foreground">
                            {formatPermissionLabel(permission)}
                          </span>
                          {permission.status === false ? (
                            <span className="shrink-0 text-xs text-muted-foreground">
                              Disabled
                            </span>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No permissions assigned to this role.
                </p>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
