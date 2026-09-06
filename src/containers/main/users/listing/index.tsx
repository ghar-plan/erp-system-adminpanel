import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import Button from "@/components/ui/Button";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import { Can } from "@/components/auth/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import { errorToaster } from "@/utils/helpers/common/alert-service";
import useStore from "@/hooks/useStore";
import useRoles from "../../roles/useHooks";
import useUsers from "../useHooks";
import type { RbacRole } from "../../roles/types";

export default function UsersListing() {
  const { getUser } = useStore();
  const currentUser = getUser();
  const { hasPermission } = usePermissions();
  const canUpdate = hasPermission(PERMISSIONS.USERS_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.USERS_DELETE);
  const showActions = canUpdate || canDelete;
  const { getUsersWithRoles, getRolesList, assignRole } = useRoles();
  const { setUserStatus, deleteUser } = useUsers();
  const [list, setList] = useState<any[]>([]);
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [viewing, setViewing] = useState<any | null>(null);
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);
  const [savingRoles, setSavingRoles] = useState(false);
  const [searchVal, setSearchVal] = useState("");
  const [search, setSearch] = useState("");
  const [statusVal, setStatusVal] = useState("");
  const [status, setStatus] = useState("");
  const [roleVal, setRoleVal] = useState("");
  const [roleId, setRoleId] = useState("");

  const fetchUsers = (
    nextPage = page,
    nextLimit = limit,
    nextSearch = search,
    nextStatus = status,
    nextRoleId = roleId,
  ) => {
    const queryParams: Record<string, unknown> = {
      limit: nextLimit,
      offset: (nextPage - 1) * nextLimit,
    };
    if (nextSearch.trim()) queryParams.search = nextSearch.trim();
    if (nextStatus) queryParams.status = nextStatus;
    if (nextRoleId) queryParams.roleId = nextRoleId;
    getUsersWithRoles(setList, queryParams, setTotalElements);
  };

  useEffect(() => {
    fetchUsers(1, limit, search, status, roleId);
    getRolesList(setRoles, { limit: 100, offset: 0 }, () => undefined);
  }, []);

  const handleApplyFilters = () => {
    setSearch(searchVal);
    setStatus(statusVal);
    setRoleId(roleVal);
    setPage(1);
    fetchUsers(1, limit, searchVal, statusVal, roleVal);
  };

  const handleResetFilters = () => {
    setSearchVal("");
    setSearch("");
    setStatusVal("");
    setStatus("");
    setRoleVal("");
    setRoleId("");
    setPage(1);
    fetchUsers(1, limit, "", "", "");
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    const nextPage = pageInfo.selected + 1;
    setPage(nextPage);
    setLimit(pageInfo.limit);
    fetchUsers(nextPage, pageInfo.limit, search, status, roleId);
  };

  const currentRoleIds = (row: any) =>
    (row?.assignedRoles || [])
      .map((role: RbacRole) => role?.id)
      .filter(Boolean) as string[];

  const viewingRow = viewing
    ? list.find((row) => row?.user?.id && row.user.id === viewing.user?.id) ||
      viewing
    : null;

  const originalRoleIds = currentRoleIds(viewingRow);
  const hasRoleChanges =
    selectedRoleIds.length !== originalRoleIds.length ||
    selectedRoleIds.some((id) => !originalRoleIds.includes(id));

  const openRolesModal = (row: any) => {
    setViewing(row);
    setSelectedRoleIds(currentRoleIds(row));
  };

  const closeRolesModal = () => {
    setViewing(null);
    setSelectedRoleIds([]);
    setSavingRoles(false);
  };

  const onToggleRole = (roleId: string, checked: boolean) => {
    setSelectedRoleIds((current) => {
      const nextIds = checked
        ? [...new Set([...current, roleId])]
        : current.filter((id) => id !== roleId);
      if (!nextIds.length) {
        errorToaster("A user must have at least one role");
        return current;
      }
      return nextIds;
    });
  };

  const onSaveRoles = async () => {
    if (!viewingRow?.user?.id) return;
    if (!selectedRoleIds.length) {
      errorToaster("A user must have at least one role");
      return;
    }
    setSavingRoles(true);
    const saved = await assignRole(viewingRow.user.id, selectedRoleIds, () =>
      fetchUsers(page, limit, search, status, roleId),
    );
    setSavingRoles(false);
    if (saved) closeRolesModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl text-foreground font-bold">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Create users and assign one or more roles. Disabled users cannot
            sign in.
          </p>
        </div>
        <Can permission={PERMISSIONS.USERS_CREATE}>
          <Link
            to={siteRoutes.usersCreate}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap self-start sm:self-auto text-sm"
          >
            <Plus size={18} />
            Create User
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
              placeholder="Search by name, title, or email..."
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

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label
            htmlFor="roleId"
            className="text-xs text-foreground font-medium whitespace-nowrap"
          >
            Role
          </label>
          <select
            name="roleId"
            id="roleId"
            value={roleVal}
            onChange={(e) => setRoleVal(e.target.value)}
            className="common-input text-sm h-10 w-full sm:w-44"
          >
            <option value="">All</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
                {role.status === false ? " (Disabled)" : ""}
              </option>
            ))}
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
                    {["Sr No.", "Name", "Title", "Email", "Roles", "Status", ...(showActions ? ["Actions"] : [])].map(
                      (column) => (
                        <th
                          key={column}
                          className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                        >
                          {column}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main bg-card text-foreground">
                  {list.map((row, index) => {
                    const userId = row.user?.id;
                    const isSelf = Boolean(userId && currentUser?.id === userId);
                    const enabled = row.user?.status !== false;
                    const assignedRoles = (row.assignedRoles || []).filter(
                      (role: RbacRole) => role?.name,
                    );
                    const isClientUser = assignedRoles.some(
                      (role: RbacRole) =>
                        String(role?.name || "").trim().toLowerCase() === "client",
                    );
                    return (
                      <tr
                        key={userId || index}
                        className={`transition-colors ${
                          enabled
                            ? "hover:bg-muted-foreground/5"
                            : "bg-muted-foreground/[0.03] opacity-80"
                        }`}
                      >
                        <td className="table-td">
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td className="table-td font-semibold text-foreground">
                          {row.user?.fullName || "--"}
                        </td>
                        <td className="table-td">{row.user?.title || "—"}</td>
                        <td className="table-td">{row.user?.email || "--"}</td>
                        <td className="px-6 py-4">
                          {assignedRoles.length ? (
                            <div className="flex flex-wrap gap-1.5">
                              {assignedRoles.slice(0, 2).map((role: RbacRole) => (
                                <span
                                  key={role.id || role.name}
                                  className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                    role.status === false
                                      ? "border-border-main bg-muted-foreground/10 text-muted-foreground"
                                      : "border-primary/20 bg-primary/10 text-primary"
                                  }`}
                                >
                                  {role.name}
                                </span>
                              ))}
                              {assignedRoles.length > 2 ? (
                                <span className="inline-flex items-center rounded-full border border-border-main bg-muted-foreground/10 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                                  +{assignedRoles.length - 2}
                                </span>
                              ) : null}
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              No role assigned
                            </span>
                          )}
                        </td>
                        <td className="table-td">
                          <Can
                            permission={PERMISSIONS.USERS_UPDATE}
                            fallback={
                              <button
                                type="button"
                                role="switch"
                                aria-checked={enabled}
                                disabled
                                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full ${
                                  enabled ? "bg-primary" : "bg-muted-foreground/30"
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
                              disabled={isSelf || !userId}
                              title={
                                isSelf
                                  ? "You cannot disable your own account"
                                  : enabled
                                    ? "Disable user"
                                    : "Enable user"
                              }
                              onClick={() =>
                                userId &&
                                setUserStatus(userId, !enabled, () =>
                                  fetchUsers(page, limit, search, status, roleId),
                                )
                              }
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                                enabled ? "bg-primary" : "bg-muted-foreground/30"
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
                          <div className="flex items-center gap-2">
                            {canUpdate ? (
                              <button
                                type="button"
                                className="btn-action-edit disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-amber-500/10"
                                title={
                                  isSelf
                                    ? "You cannot edit your own account"
                                    : isClientUser
                                      ? "Client roles are managed from Projects"
                                      : "Edit roles"
                                }
                                disabled={isSelf || isClientUser || !userId}
                                onClick={() => {
                                  if (isSelf || isClientUser || !userId) return;
                                  openRolesModal(row);
                                }}
                              >
                                <Pencil size={16} />
                              </button>
                            ) : null}
                            {canDelete ? (
                              <button
                                type="button"
                                className="btn-action-delete disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-500/10"
                                title={
                                  isSelf
                                    ? "You cannot delete your own account"
                                    : isClientUser
                                      ? "Client users cannot be deleted from here"
                                      : "Delete user"
                                }
                                disabled={isSelf || isClientUser || !userId}
                                onClick={() => {
                                  if (isSelf || isClientUser || !userId) return;
                                  deleteUser(
                                    userId,
                                    row.user?.fullName || row.user?.email || "user",
                                    () =>
                                      fetchUsers(
                                        page,
                                        limit,
                                        search,
                                        status,
                                        roleId,
                                      ),
                                  );
                                }}
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

      {viewingRow ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeRolesModal}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-border-main bg-card shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border-main px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">
                  Edit roles
                </h2>
                <p className="text-sm text-muted-foreground">
                  {viewingRow.user?.fullName || "User"}
                  {viewingRow.user?.email ? ` · ${viewingRow.user.email}` : ""}
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted-foreground/10 cursor-pointer"
                onClick={closeRolesModal}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4">
              <p className="text-sm font-semibold text-foreground mb-3">
                Roles
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Assigned roles are checked. A user must keep at least one role.
                Disabled roles stay assigned but grant no access on login.
              </p>
              {roles.length ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {roles.map((role) => {
                    const checked = selectedRoleIds.includes(role.id);
                    const lastRole = checked && selectedRoleIds.length === 1;
                    return (
                      <Can
                        key={role.id}
                        permission={PERMISSIONS.ROLES_MANAGE}
                        fallback={
                          <label className="flex items-center gap-2 rounded-lg border border-border-main px-3 py-2 text-sm">
                            <input
                              type="checkbox"
                              className="rounded border-border-main"
                              checked={checked}
                              disabled
                              readOnly
                            />
                            {role.name}
                            {role.status === false ? (
                              <span className="text-xs text-muted-foreground">
                                (Disabled)
                              </span>
                            ) : null}
                          </label>
                        }
                      >
                        <label
                          className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm ${
                            lastRole
                              ? "border-primary/30 bg-primary/5 cursor-not-allowed"
                              : "border-border-main cursor-pointer hover:bg-muted-foreground/5"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="rounded border-border-main"
                            checked={checked}
                            disabled={lastRole}
                            title={
                              lastRole
                                ? "A user must have at least one role"
                                : undefined
                            }
                            onChange={(e) =>
                              onToggleRole(role.id, e.target.checked)
                            }
                          />
                          {role.name}
                          {role.status === false ? (
                            <span className="text-xs text-muted-foreground">
                              (Disabled)
                            </span>
                          ) : null}
                        </label>
                      </Can>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No roles available. Create a role first.
                </p>
              )}
            </div>
            <Can permission={PERMISSIONS.ROLES_MANAGE}>
              <div className="flex justify-end gap-2 border-t border-border-main px-5 py-4">
                <button
                  type="button"
                  onClick={closeRolesModal}
                  className="h-10 px-5 rounded-md border border-border-main text-sm font-semibold text-foreground hover:bg-muted-foreground/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSaveRoles}
                  disabled={!hasRoleChanges || savingRoles}
                  className="h-10 px-5 rounded-md bg-primary text-white text-sm font-semibold hover:opacity-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save changes
                </button>
              </div>
            </Can>
          </div>
        </div>
      ) : null}
    </div>
  );
}
