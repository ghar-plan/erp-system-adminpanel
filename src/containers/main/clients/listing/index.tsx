import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, Search, Trash2 } from "lucide-react";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import useClients from "../useHooks";

export default function ClientsListing() {
  const { hasPermission } = usePermissions();
  const { getClients, deleteClient } = useClients();
  const canView = hasPermission(PERMISSIONS.CLIENTS_READ);
  const canDelete = hasPermission(PERMISSIONS.CLIENTS_DELETE);
  const showActions = canView || canDelete;
  const [list, setList] = useState<any[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [searchVal, setSearchVal] = useState("");
  const [statusVal, setStatusVal] = useState("");
  const [filters, setFilters] = useState({ search: "", status: "", page: 1, limit: 10 });

  const fetchClients = (current = filters) => {
    getClients(
      setList,
      {
        limit: current.limit,
        offset: (current.page - 1) * current.limit,
        ...(current.search ? { search: current.search } : {}),
        ...(current.status ? { status: current.status } : {}),
      },
      setTotalElements,
    );
  };

  useEffect(() => {
    fetchClients({ ...filters, page: 1 });
  }, []);

  const handleApplyFilters = () => {
    const next = { ...filters, search: searchVal.trim(), status: statusVal, page: 1 };
    setFilters(next);
    fetchClients(next);
  };

  const handleResetFilters = () => {
    setSearchVal("");
    setStatusVal("");
    const next = { search: "", status: "", page: 1, limit: filters.limit };
    setFilters(next);
    fetchClients(next);
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    const next = { ...filters, page: pageInfo.selected + 1, limit: pageInfo.limit };
    setFilters(next);
    fetchClients(next);
  };

  const columns = [
    "Sr No.",
    "Name",
    "Email",
    "Title",
    "Phone",
    "Projects",
    "Status",
    ...(showActions ? ["Actions"] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl text-foreground font-bold">Clients</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review client accounts and the projects assigned to them.
          </p>
        </div>
      </div>

      <div className="bg-muted-foreground/5 border border-border-main p-4 rounded-xl animate-fade-in shadow-xs flex flex-wrap items-end justify-start md:justify-end gap-3 w-full">
        <div className="flex flex-col items-start gap-1 w-full sm:max-w-sm flex-1 md:max-w-md min-w-[260px]">
          <label className="text-xs text-foreground font-medium">Search</label>
          <div className="relative w-full">
            <Search
              className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground/80"
              size={16}
            />
            <input
              type="search"
              placeholder="Search by name, email, title, or phone..."
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
          <label className="text-xs text-foreground font-medium">Status</label>
          <select
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
          <Button variant="primary" onClick={handleApplyFilters} className="h-10 text-xs px-6 font-semibold flex-1 sm:flex-initial !py-0">
            Apply
          </Button>
          <Button variant="secondary" onClick={handleResetFilters} className="h-10 text-xs px-6 font-semibold flex-1 sm:flex-initial !py-0">
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
                    {columns.map((column) => (
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
                  {list.map((row, index) => {
                    const user = row.user || {};
                    const enabled = user.status !== false;
                    return (
                      <tr
                        key={user.id || index}
                        className={`transition-colors ${
                          enabled ? "hover:bg-muted-foreground/5" : "bg-muted-foreground/[0.03] opacity-80"
                        }`}
                      >
                        <td className="table-td">{(filters.page - 1) * filters.limit + index + 1}</td>
                        <td className="table-td font-semibold">{user.fullName || "--"}</td>
                        <td className="table-td">{user.email || "--"}</td>
                        <td className="table-td">{user.title || "—"}</td>
                        <td className="table-td">{user.phone || "—"}</td>
                        <td className="table-td">{row.projectsCount ?? 0}</td>
                        <td className="table-td">
                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                              enabled
                                ? "border-primary/20 bg-primary/10 text-primary"
                                : "border-border-main bg-muted-foreground/10 text-muted-foreground"
                            }`}
                          >
                            {enabled ? "Enabled" : "Disabled"}
                          </span>
                        </td>
                        {showActions ? (
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex gap-2">
                              {canView && user.id ? (
                                <Link
                                  to={`/clients/view/${user.id}`}
                                  className="btn-action-view"
                                  title="View client"
                                >
                                  <Eye size={16} />
                                </Link>
                              ) : null}
                              <Can permission={PERMISSIONS.CLIENTS_DELETE}>
                                {user.id ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteClient(user.id, user.fullName || user.email || "client", () =>
                                        fetchClients(filters),
                                      )
                                    }
                                    className="btn-action-delete"
                                    title="Delete client"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                ) : null}
                              </Can>
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
            page={filters.page}
            limit={filters.limit}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
}
