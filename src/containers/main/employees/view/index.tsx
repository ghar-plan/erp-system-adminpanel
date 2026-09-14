import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MapPin, Pencil, Phone, User } from "lucide-react";
import { IoArrowBackOutline } from "react-icons/io5";
import useEmployees from "../useHooks";
import { Employee } from "@/utils/helpers/models/employees/employee.dto";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";
import type { AttendanceRecord } from "@/utils/helpers/models/attendance/attendance.dto";
import type { LeaveRequest } from "@/utils/helpers/models/leaves/leave.dto";

function formatDateTime(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function attendanceStatusLabel(status?: string) {
  if (status === "checked_in") return "Checked In";
  if (status === "checked_out") return "Checked Out";
  return status || "--";
}

function attendanceStatusClass(status?: string) {
  if (status === "checked_in") return "bg-info-bg text-info-text border border-panel-border";
  if (status === "checked_out") return "bg-success-bg text-success-text border border-panel-border";
  return "bg-muted-foreground/10 text-muted-foreground";
}

function leaveStatusLabel(status?: string) {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : "--";
}

function leaveStatusClass(status?: string) {
  if (status === "approved") return "bg-success-bg text-success-text border border-panel-border";
  if (status === "rejected") return "bg-accent-bg text-accent-text border border-panel-border";
  if (status === "cancelled") return "bg-muted-foreground/10 text-muted-foreground";
  return "bg-info-bg text-info-text border border-panel-border";
}

export default function EmployeesView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getEmployeeById, getEmployeeAttendance, getEmployeeLeaves } = useEmployees();
  const [employee, setEmployee] = useState<Employee | null>(null);

  const [attendanceRows, setAttendanceRows] = useState<AttendanceRecord[]>([]);
  const [attendanceTotal, setAttendanceTotal] = useState(0);
  const [attendanceStart, setAttendanceStart] = useState("");
  const [attendanceEnd, setAttendanceEnd] = useState("");
  const [attendancePage, setAttendancePage] = useState(1);
  const [attendanceLimit, setAttendanceLimit] = useState(10);

  const [leaveRows, setLeaveRows] = useState<LeaveRequest[]>([]);
  const [leaveTotal, setLeaveTotal] = useState(0);
  const [leaveStatus, setLeaveStatus] = useState("");
  const [leaveStart, setLeaveStart] = useState("");
  const [leaveEnd, setLeaveEnd] = useState("");
  const [leavePage, setLeavePage] = useState(1);
  const [leaveLimit, setLeaveLimit] = useState(10);

  const fetchAttendance = (
    page = attendancePage,
    limit = attendanceLimit,
    from = attendanceStart,
    to = attendanceEnd,
  ) => {
    if (!id) return;
    const params: Record<string, unknown> = { limit, offset: (page - 1) * limit };
    if (from) params.startDate = from;
    if (to) params.endDate = to;
    getEmployeeAttendance(id, setAttendanceRows, params, setAttendanceTotal);
  };

  const fetchLeaves = (
    page = leavePage,
    limit = leaveLimit,
    status = leaveStatus,
    from = leaveStart,
    to = leaveEnd,
  ) => {
    if (!id) return;
    const params: Record<string, unknown> = { limit, offset: (page - 1) * limit };
    if (status) params.leaveStatus = status;
    if (from) params.startDate = from;
    if (to) params.endDate = to;
    getEmployeeLeaves(id, setLeaveRows, params, setLeaveTotal);
  };

  useEffect(() => {
    if (!id) return;
    getEmployeeById(id, setEmployee);
    fetchAttendance(1, attendanceLimit, "", "");
    fetchLeaves(1, leaveLimit, "", "", "");
  }, [id]);

  if (!employee) return null;

  const fields = [
    { label: "Name", value: employee.name },
    { label: "Email", value: employee.email },
    { label: "Mobile Number", value: employee.mobileNumber },
    { label: "Designation", value: employee.designation },
    { label: "Address", value: employee.address },
    { label: "Attendance Latitude", value: String(employee.lat) },
    { label: "Attendance Longitude", value: String(employee.lng) },
    { label: "Allowed Radius", value: `${employee.radius} meters` },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(siteRoutes.employees)}
            className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
            title="Go Back"
          >
            <IoArrowBackOutline size={20} className="stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-2xl text-foreground font-bold leading-tight">{employee.name}</h1>
            <p className="text-sm text-muted-foreground">{employee.designation}</p>
          </div>
        </div>
        <Can permission={PERMISSIONS.EMPLOYEE_UPDATE}>
          <Link
            to={`/employees/edit/${employee.id}`}
            className="flex h-10 px-5 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm"
          >
            <Pencil size={16} />
            Edit Employee
          </Link>
        </Can>
      </div>
      <hr className="border-border-main" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="app-card border border-border-main shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Designation</p>
            <h3 className="text-lg font-bold text-foreground">{employee.designation}</h3>
          </div>
        </div>
        <div className="app-card border border-border-main shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Phone size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Mobile</p>
            <h3 className="text-lg font-bold text-foreground">{employee.mobileNumber}</h3>
          </div>
        </div>
        <div className="app-card border border-border-main shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <MapPin size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Geofence</p>
            <h3 className="text-lg font-bold text-foreground">{employee.radius} m</h3>
          </div>
        </div>
      </div>
      <div className="bg-card rounded-xl border border-border-main p-6 grid gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <div key={field.label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{field.label}</p>
            <p className="mt-1 text-sm font-medium text-foreground">{field.value || "--"}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">Attendance</h2>
        <div className="bg-muted-foreground/5 border border-border-main p-4 rounded-xl shadow-xs flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-foreground font-medium">Start date</label>
            <input
              type="date"
              value={attendanceStart}
              onChange={(e) => setAttendanceStart(e.target.value)}
              className="common-input text-sm h-10"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-foreground font-medium">End date</label>
            <input
              type="date"
              value={attendanceEnd}
              onChange={(e) => setAttendanceEnd(e.target.value)}
              className="common-input text-sm h-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              className="h-10 text-xs px-6 font-semibold !py-0"
              onClick={() => {
                setAttendancePage(1);
                fetchAttendance(1, attendanceLimit, attendanceStart, attendanceEnd);
              }}
            >
              Apply
            </Button>
            <Button
              variant="secondary"
              className="h-10 text-xs px-6 font-semibold !py-0"
              onClick={() => {
                setAttendanceStart("");
                setAttendanceEnd("");
                setAttendancePage(1);
                fetchAttendance(1, attendanceLimit, "", "");
              }}
            >
              Reset
            </Button>
          </div>
        </div>
        {attendanceRows.length ? (
          <div className="bg-card rounded-xl border border-border-main overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-main">
                <thead className="bg-muted-foreground/5">
                  <tr>
                    {["Date", "Check In", "Check Out", "Status"].map((column) => (
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
                  {attendanceRows.map((row) => (
                    <tr key={row.id} className="hover:bg-muted-foreground/5">
                      <td className="table-td">{row.date || "--"}</td>
                      <td className="table-td">{formatDateTime(row.checkInAt)}</td>
                      <td className="table-td">{formatDateTime(row.checkOutAt)}</td>
                      <td className="table-td">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${attendanceStatusClass(row.status)}`}>
                          {attendanceStatusLabel(row.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <DataNotFound show={true} />
        )}
        {attendanceTotal > 0 && (
          <Pagination
            count={attendanceTotal}
            page={attendancePage}
            limit={attendanceLimit}
            onPageChange={(pageInfo) => {
              const nextPage = pageInfo.selected + 1;
              setAttendancePage(nextPage);
              setAttendanceLimit(pageInfo.limit);
              fetchAttendance(nextPage, pageInfo.limit, attendanceStart, attendanceEnd);
            }}
          />
        )}
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">Leave Management</h2>
        <div className="bg-muted-foreground/5 border border-border-main p-4 rounded-xl shadow-xs flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-foreground font-medium">Status</label>
            <select
              value={leaveStatus}
              onChange={(e) => setLeaveStatus(e.target.value)}
              className="common-input text-sm h-10"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-foreground font-medium">Start date</label>
            <input
              type="date"
              value={leaveStart}
              onChange={(e) => setLeaveStart(e.target.value)}
              className="common-input text-sm h-10"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-foreground font-medium">End date</label>
            <input
              type="date"
              value={leaveEnd}
              onChange={(e) => setLeaveEnd(e.target.value)}
              className="common-input text-sm h-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="primary"
              className="h-10 text-xs px-6 font-semibold !py-0"
              onClick={() => {
                setLeavePage(1);
                fetchLeaves(1, leaveLimit, leaveStatus, leaveStart, leaveEnd);
              }}
            >
              Apply
            </Button>
            <Button
              variant="secondary"
              className="h-10 text-xs px-6 font-semibold !py-0"
              onClick={() => {
                setLeaveStatus("");
                setLeaveStart("");
                setLeaveEnd("");
                setLeavePage(1);
                fetchLeaves(1, leaveLimit, "", "", "");
              }}
            >
              Reset
            </Button>
          </div>
        </div>
        {leaveRows.length ? (
          <div className="bg-card rounded-xl border border-border-main overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-main">
                <thead className="bg-muted-foreground/5">
                  <tr>
                    {["Dates", "Reason", "Status", "Reviewed"].map((column) => (
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
                  {leaveRows.map((row) => (
                    <tr key={row.id} className="hover:bg-muted-foreground/5">
                      <td className="table-td whitespace-nowrap">
                        {row.startDate} → {row.endDate}
                      </td>
                      <td className="table-td max-w-sm">{row.reason || "--"}</td>
                      <td className="table-td">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${leaveStatusClass(row.status)}`}>
                          {leaveStatusLabel(row.status)}
                        </span>
                      </td>
                      <td className="table-td">
                        {row.reviewedBy?.fullName || formatDateTime(row.reviewedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <DataNotFound show={true} />
        )}
        {leaveTotal > 0 && (
          <Pagination
            count={leaveTotal}
            page={leavePage}
            limit={leaveLimit}
            onPageChange={(pageInfo) => {
              const nextPage = pageInfo.selected + 1;
              setLeavePage(nextPage);
              setLeaveLimit(pageInfo.limit);
              fetchLeaves(nextPage, pageInfo.limit, leaveStatus, leaveStart, leaveEnd);
            }}
          />
        )}
      </div>
    </div>
  );
}
