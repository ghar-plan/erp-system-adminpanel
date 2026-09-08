import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import useEmployees from "../useHooks";
import { Employee } from "@/utils/helpers/models/employees/employee.dto";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";

export default function EmployeesListing() {
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { getEmployees, deleteEmployee } = useEmployees();
  const canView = hasPermission(PERMISSIONS.EMPLOYEE_READ);
  const canUpdate = hasPermission(PERMISSIONS.EMPLOYEE_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.EMPLOYEE_DELETE);
  const showActions = canView || canUpdate || canDelete;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [searchVal, setSearchVal] = useState("");
  const [statusVal, setStatusVal] = useState("");
  const [filters, setFilters] = useState({ search: "", status: "", page: 1, limit: 10 });

  const fetchEmployees = (current = filters) => {
    getEmployees(
      setEmployees,
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
    fetchEmployees({ ...filters, page: 1 });
  }, []);

  const handleApplyFilters = () => {
    const next = { ...filters, search: searchVal, status: statusVal, page: 1 };
    setFilters(next);
    fetchEmployees(next);
  };

  const handleResetFilters = () => {
    setSearchVal("");
    setStatusVal("");
    const next = { search: "", status: "", page: 1, limit: filters.limit };
    setFilters(next);
    fetchEmployees(next);
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    const next = { ...filters, page: pageInfo.selected + 1, limit: pageInfo.limit };
    setFilters(next);
    fetchEmployees(next);
  };

  const columns = [
    "Sr No.",
    "Name",
    "Email",
    "Designation",
    "Mobile",
    "Radius",
    "Status",
    ...(showActions ? ["Actions"] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl text-foreground font-bold">Employees</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Register staff and configure their attendance geofence.
          </p>
        </div>
        <Can permission={PERMISSIONS.EMPLOYEE_CREATE}>
          <Link
            to={siteRoutes.employeesCreate}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap self-start sm:self-auto text-sm"
          >
            <Plus size={18} />
            Register Employee
          </Link>
        </Can>
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
              placeholder="Search by name, email, designation, mobile..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
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
        {employees.length > 0 ? (
          <div className="bg-card rounded-xl border border-border-main overflow-hidden shadow-xs animate-slide-up">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-main">
                <thead className="bg-muted-foreground/5">
                  <tr className="text-left">
                    {columns.map((column) => (
                      <th
                        className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                        key={column}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main bg-card text-foreground">
                  {employees.map((employee, index) => (
                    <tr key={employee.id} className="hover:bg-muted-foreground/5 transition-colors">
                      <td className="table-td">
                        {(filters.page - 1) * filters.limit + index + 1}
                      </td>
                      <td className="table-td font-semibold">{employee.name || "--"}</td>
                      <td className="table-td">{employee.email || "--"}</td>
                      <td className="table-td">{employee.designation || "--"}</td>
                      <td className="table-td">{employee.mobileNumber || "--"}</td>
                      <td className="table-td">{employee.radius} m</td>
                      <td className="table-td">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${
                            employee.user?.status === false
                              ? "border-border-main bg-muted-foreground/10 text-muted-foreground"
                              : "border-primary/20 bg-primary/10 text-primary"
                          }`}
                        >
                          {employee.user?.status === false ? "Disabled" : "Enabled"}
                        </span>
                      </td>
                      {showActions ? (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {canView ? (
                              <Link
                                to={`/employees/view/${employee.id}`}
                                className="btn-action-view"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </Link>
                            ) : null}
                            {canUpdate ? (
                              <button
                                type="button"
                                onClick={() => navigate(`/employees/edit/${employee.id}`)}
                                className="btn-action-edit"
                                title="Edit Employee"
                              >
                                <Pencil size={16} />
                              </button>
                            ) : null}
                            {canDelete ? (
                              <button
                                type="button"
                                onClick={() =>
                                  deleteEmployee(employee.id, employee.name, () =>
                                    fetchEmployees(filters),
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
