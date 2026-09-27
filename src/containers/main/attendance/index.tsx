import { useEffect, useState } from "react";
import { CheckCircle2, Clock, Loader2, LogIn, LogOut, MapPin } from "lucide-react";
import useAttendance from "./useHooks";
import useEmployees from "../employees/useHooks";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";
import { Can, CanAny } from "@/components/auth/Can";
import { warningToaster } from "@/utils/helpers/common/alert-service";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import type { AttendanceRecord } from "@/utils/helpers/models/attendance/attendance.dto";
import type { Employee } from "@/utils/helpers/models/employees/employee.dto";

function formatDateTime(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function statusLabel(status?: string) {
  if (status === "checked_in") return "Checked In";
  if (status === "checked_out") return "Checked Out";
  return status || "--";
}

function statusClass(status?: string) {
  if (status === "checked_in") return "bg-info-bg text-info-text border border-panel-border";
  if (status === "checked_out") return "bg-success-bg text-success-text border border-panel-border";
  return "bg-muted-foreground/10 text-muted-foreground";
}

export default function AttendancePage() {
  const { hasPermission } = usePermissions();
  const canMark = hasPermission(PERMISSIONS.ATTENDANCE_CREATE);
  const canReadAll = hasPermission(PERMISSIONS.ATTENDANCE_READ_ALL);
  const { markCheckIn, markCheckOut, getToday, getMyAttendance, getAllAttendance } =
    useAttendance();
  const { getMyEmployee, getAllEmployees } = useEmployees();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [today, setToday] = useState<AttendanceRecord | null>(null);
  const [busyAction, setBusyAction] = useState<"in" | "out" | null>(null);
  const [locationHint, setLocationHint] = useState("");

  const [myRows, setMyRows] = useState<AttendanceRecord[]>([]);
  const [myTotal, setMyTotal] = useState(0);
  const [myPage, setMyPage] = useState(1);
  const [myLimit, setMyLimit] = useState(10);
  const [myStartDate, setMyStartDate] = useState("");
  const [myEndDate, setMyEndDate] = useState("");

  const [allRows, setAllRows] = useState<AttendanceRecord[]>([]);
  const [allTotal, setAllTotal] = useState(0);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [allPage, setAllPage] = useState(1);
  const [allLimit, setAllLimit] = useState(10);

  const fetchMine = (
    page = myPage,
    limit = myLimit,
    from = myStartDate,
    to = myEndDate,
  ) => {
    const params: Record<string, unknown> = {
      limit,
      offset: (page - 1) * limit,
    };
    if (from) params.startDate = from;
    if (to) params.endDate = to;
    getMyAttendance(setMyRows, params, setMyTotal);
  };

  const refreshSelf = () => {
    getMyEmployee(setEmployee);
    getToday(setToday);
    fetchMine();
  };

  const fetchAll = (
    page = allPage,
    limit = allLimit,
    emp = employeeId,
    from = startDate,
    to = endDate,
  ) => {
    const params: Record<string, unknown> = {
      limit,
      offset: (page - 1) * limit,
    };
    if (emp) params.employeeId = emp;
    if (from) params.startDate = from;
    if (to) params.endDate = to;
    getAllAttendance(setAllRows, params, setAllTotal);
  };

  useEffect(() => {
    if (canMark) {
      getMyEmployee(setEmployee);
      getToday(setToday);
    }
    fetchMine(1, myLimit, "", "");
    if (canReadAll) {
      getAllEmployees(setEmployees);
      fetchAll(1, allLimit, "", "", "");
    }
  }, []);

  const onMark = async (action: "in" | "out") => {
    if (busyAction) return;
    setBusyAction(action);
    setLocationHint("");
    try {
      const result = action === "in" ? await markCheckIn() : await markCheckOut();
      if (result) {
        refreshSelf();
        return;
      }
      if (!navigator.geolocation) {
        setLocationHint("Location permission is required to mark attendance.");
      }
    } finally {
      setBusyAction(null);
    }
  };

  const busy = Boolean(busyAction);
  const alreadyCheckedIn = Boolean(today?.checkInAt);
  const alreadyCheckedOut = Boolean(today?.checkOutAt);
  const canCheckIn = !busy && !alreadyCheckedIn;
  const canCheckOut = !busy && alreadyCheckedIn && !alreadyCheckedOut;

  const explainDisabled = (action: "in" | "out") => {
    if (busyAction === "in") {
      warningToaster("Check-in is already in progress. Please wait.");
      return;
    }
    if (busyAction === "out") {
      warningToaster("Check-out is already in progress. Please wait.");
      return;
    }
    if (action === "in") {
      if (alreadyCheckedOut) {
        warningToaster("Today's attendance is complete. Your next check-in will be available tomorrow.");
        return;
      }
      if (alreadyCheckedIn) {
        warningToaster("You have already checked in today. Your next check-in will be available tomorrow.");
        return;
      }
    }
    if (action === "out") {
      if (!alreadyCheckedIn) {
        warningToaster("You have not checked in yet.");
        return;
      }
                  if (alreadyCheckedOut) {
                    warningToaster("You have already checked out today. Your next check-in will be available tomorrow.");
                  }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl text-foreground font-bold">Attendance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Check in and out using your current GPS location. The server validates the geofence.
        </p>
      </div>

      <Can permission={PERMISSIONS.ATTENDANCE_CREATE}>
        <div className="bg-card rounded-xl border border-border-main p-6 space-y-4">
          {!employee ? (
            <p className="text-sm text-muted-foreground">
              No employee profile is linked to your account. Ask an administrator to register you as an employee.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Today</p>
                  <p className="text-lg font-semibold text-foreground">
                    {today ? statusLabel(today.status) : "Not marked"}
                  </p>
                  {today?.checkInAt && (
                    <p className="text-xs text-muted-foreground mt-1">
                      In: {formatDateTime(today.checkInAt)}
                      {today.checkOutAt ? ` · Out: ${formatDateTime(today.checkOutAt)}` : ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin size={16} />
                  Allowed radius: {employee.radius} m
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  aria-disabled={!canCheckIn}
                  onClick={() => {
                    if (!canCheckIn) {
                      explainDisabled("in");
                      return;
                    }
                    onMark("in");
                  }}
                  className={`flex h-10 px-5 items-center justify-center gap-2 rounded-md bg-primary font-semibold text-white text-sm ${
                    canCheckIn ? "hover:opacity-95 cursor-pointer" : "opacity-60 cursor-not-allowed"
                  }`}
                >
                  <LogIn size={16} />
                  Check In
                </button>
                <button
                  type="button"
                  aria-disabled={!canCheckOut}
                  onClick={() => {
                    if (!canCheckOut) {
                      explainDisabled("out");
                      return;
                    }
                    onMark("out");
                  }}
                  className={`flex h-10 px-5 items-center justify-center gap-2 rounded-md border border-border-main font-semibold text-foreground text-sm ${
                    canCheckOut ? "hover:bg-muted-foreground/5 cursor-pointer" : "opacity-60 cursor-not-allowed"
                  }`}
                >
                  <LogOut size={16} />
                  Check Out
                </button>
              </div>
              {busyAction ? (
                <p className="text-sm text-primary font-medium flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" />
                  {busyAction === "in"
                    ? "Check-in is in progress. Please wait while we verify your location."
                    : "Check-out is in progress. Please wait while we verify your location."}
                </p>
              ) : alreadyCheckedIn ? (
                <div className="flex items-start gap-3 rounded-lg border border-panel-border bg-info-bg px-4 py-3">
                  <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-info-text" />
                  <div>
                    <p className="text-sm font-semibold text-info-text">
                      {alreadyCheckedOut ? "Today's attendance is complete" : "Checked in for today"}
                    </p>
                    <p className="mt-0.5 text-sm text-info-text/90">
                      {alreadyCheckedOut
                        ? "You have already checked in and checked out. Your next check-in will be available tomorrow."
                        : "You have already checked in. Use Check Out when you leave. Your next check-in will be available tomorrow."}
                    </p>
                  </div>
                </div>
              ) : null}
              {locationHint && (
                <p className="text-sm text-red-500 font-medium">{locationHint}</p>
              )}
            </>
          )}
        </div>
      </Can>

      <CanAny permissions={[PERMISSIONS.ATTENDANCE_READ, PERMISSIONS.ATTENDANCE_CREATE]}>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Clock size={18} />
            My attendance
          </h2>
          <div className="bg-muted-foreground/5 border border-border-main p-4 rounded-xl flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-xs font-medium">From</label>
              <input
                type="date"
                className="common-input h-10 text-sm"
                value={myStartDate}
                onChange={(e) => setMyStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-xs font-medium">To</label>
              <input
                type="date"
                className="common-input h-10 text-sm"
                value={myEndDate}
                onChange={(e) => setMyEndDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                className="h-10 text-xs px-6 font-semibold !py-0"
                onClick={() => {
                  setMyPage(1);
                  fetchMine(1, myLimit, myStartDate, myEndDate);
                }}
              >
                Apply
              </Button>
              <Button
                variant="secondary"
                className="h-10 text-xs px-6 font-semibold !py-0"
                onClick={() => {
                  setMyStartDate("");
                  setMyEndDate("");
                  setMyPage(1);
                  fetchMine(1, myLimit, "", "");
                }}
              >
                Reset
              </Button>
            </div>
          </div>
          {myRows.length ? (
            <AttendanceTable
              rows={myRows}
              page={myPage}
              limit={myLimit}
              showEmployee={false}
            />
          ) : (
            <DataNotFound show={true} />
          )}
          {myTotal > 0 && (
            <Pagination
              count={myTotal}
              page={myPage}
              limit={myLimit}
              onPageChange={(info) => {
                setMyPage(info.selected + 1);
                setMyLimit(info.limit);
                fetchMine(info.selected + 1, info.limit, myStartDate, myEndDate);
              }}
            />
          )}
        </div>
      </CanAny>

      {canReadAll ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">All employee attendance</h2>
          <div className="bg-muted-foreground/5 border border-border-main p-4 rounded-xl flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1 min-w-[180px] flex-1">
              <label className="text-xs font-medium">Employee</label>
              <select
                className="common-input h-10 text-sm"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
              >
                <option value="">All employees</option>
                {employees.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-xs font-medium">From</label>
              <input type="date" className="common-input h-10 text-sm" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-xs font-medium">To</label>
              <input type="date" className="common-input h-10 text-sm" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button
                variant="primary"
                className="h-10 text-xs px-6 font-semibold !py-0"
                onClick={() => {
                  setAllPage(1);
                  fetchAll(1, allLimit, employeeId, startDate, endDate);
                }}
              >
                Apply
              </Button>
              <Button
                variant="secondary"
                className="h-10 text-xs px-6 font-semibold !py-0"
                onClick={() => {
                  setEmployeeId("");
                  setStartDate("");
                  setEndDate("");
                  setAllPage(1);
                  fetchAll(1, allLimit, "", "", "");
                }}
              >
                Reset
              </Button>
            </div>
          </div>
          {allRows.length ? (
            <AttendanceTable
              rows={allRows}
              page={allPage}
              limit={allLimit}
              showEmployee
            />
          ) : (
            <DataNotFound show={true} />
          )}
          {allTotal > 0 && (
            <Pagination
              count={allTotal}
              page={allPage}
              limit={allLimit}
              onPageChange={(info) => {
                setAllPage(info.selected + 1);
                setAllLimit(info.limit);
                fetchAll(info.selected + 1, info.limit);
              }}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}

function AttendanceTable({
  rows,
  page,
  limit,
  showEmployee,
}: {
  rows: AttendanceRecord[];
  page: number;
  limit: number;
  showEmployee: boolean;
}) {
  return (
    <div className="bg-card rounded-xl border border-border-main overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-main">
          <thead className="bg-muted-foreground/5">
            <tr>
              {["Sr No.", ...(showEmployee ? ["Employee"] : []), "Date", "Check In", "Check Out", "In Location", "Out Location", "Status"].map((col) => (
                <th key={col} className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-main">
            {rows.map((row, index) => (
              <tr key={row.id} className="hover:bg-muted-foreground/5">
                <td className="table-td">{(page - 1) * limit + index + 1}</td>
                {showEmployee ? <td className="table-td font-semibold">{row.employee?.name || "--"}</td> : null}
                <td className="table-td">{String(row.date).slice(0, 10)}</td>
                <td className="table-td">{formatDateTime(row.checkInAt)}</td>
                <td className="table-td">{formatDateTime(row.checkOutAt)}</td>
                <td className="table-td">
                  {row.checkInLat != null ? `${row.checkInLat.toFixed(5)}, ${row.checkInLng?.toFixed(5)}` : "--"}
                </td>
                <td className="table-td">
                  {row.checkOutLat != null ? `${row.checkOutLat.toFixed(5)}, ${row.checkOutLng?.toFixed(5)}` : "--"}
                </td>
                <td className="table-td">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${statusClass(row.status)}`}>
                    {statusLabel(row.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
