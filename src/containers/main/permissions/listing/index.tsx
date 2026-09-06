import { Fragment, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import {
  formatModuleLabel,
  formatPermissionLabel,
  formatReadableCode,
} from "../../roles/group-permissions";
import usePermissionsAdmin from "../useHooks";
import type { RbacPermission } from "../../roles/types";

export default function PermissionsListing() {
  const { getPermissions, setPermissionStatus } = usePermissionsAdmin();
  const [list, setList] = useState<RbacPermission[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchVal, setSearchVal] = useState("");
  const [search, setSearch] = useState("");
  const [statusVal, setStatusVal] = useState("");
  const [status, setStatus] = useState("");

  const fetchPermissions = (
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
    getPermissions(setList, queryParams, setTotalElements);
  };

  useEffect(() => {
    fetchPermissions(1, limit, search, status);
  }, []);

  const handleApplyFilters = () => {
    setSearch(searchVal);
    setStatus(statusVal);
    setPage(1);
    fetchPermissions(1, limit, searchVal, statusVal);
  };

  const handleResetFilters = () => {
    setSearchVal("");
    setSearch("");
    setStatusVal("");
    setStatus("");
    setPage(1);
    fetchPermissions(1, limit, "", "");
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    const nextPage = pageInfo.selected + 1;
    setPage(nextPage);
    setLimit(pageInfo.limit);
    fetchPermissions(nextPage, pageInfo.limit, search, status);
  };

  const rows = useMemo(() => {
    return [...list].sort((a, b) => {
      const moduleCompare = (a.resource || "").localeCompare(b.resource || "");
      if (moduleCompare !== 0) return moduleCompare;
      return (a.action || "").localeCompare(b.action || "");
    });
  }, [list]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
          Permissions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          View system permissions and enable or disable them. A disabled
          permission is ignored even if it is still assigned to a role.
        </p>
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
              placeholder="Search by module, name, or permission code..."
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
                    {["Sr No.", "Module", "Description", "Code", "Status"].map(
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
                  {rows.map((permission, index) => {
                    const enabled = permission.status !== false;
                    const showModuleHeader =
                      index === 0 ||
                      rows[index - 1]?.resource !== permission.resource;
                    return (
                      <Fragment key={permission.id}>
                        {showModuleHeader ? (
                          <tr
                            key={`${permission.resource}-heading`}
                            className="bg-muted-foreground/5"
                          >
                            <td
                              colSpan={5}
                              className="px-6 py-3 text-sm font-bold text-foreground"
                            >
                              {formatModuleLabel(permission.resource)}
                            </td>
                          </tr>
                        ) : null}
                        <tr
                          key={permission.id}
                          className="hover:bg-muted-foreground/5 transition-colors"
                        >
                          <td className="table-td">
                            {(page - 1) * limit + index + 1}
                          </td>
                          <td className="table-td font-semibold text-foreground">
                            {formatModuleLabel(permission.resource)}
                          </td>
                          <td className="table-td">
                            {formatPermissionLabel(permission)}
                          </td>
                          <td className="table-td">
                            {formatReadableCode(permission)}
                          </td>
                          <td className="table-td">
                            <Can
                              permission={PERMISSIONS.PERMISSIONS_UPDATE}
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
                                      enabled
                                        ? "translate-x-5"
                                        : "translate-x-0"
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
                                  enabled
                                    ? "Disable permission"
                                    : "Enable permission"
                                }
                                onClick={() =>
                                  setPermissionStatus(
                                    permission.id,
                                    !enabled,
                                    () =>
                                      fetchPermissions(
                                        page,
                                        limit,
                                        search,
                                        status,
                                      ),
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
                                    enabled
                                      ? "translate-x-5"
                                      : "translate-x-0"
                                  }`}
                                />
                              </button>
                            </Can>
                          </td>
                        </tr>
                      </Fragment>
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
    </div>
  );
}
