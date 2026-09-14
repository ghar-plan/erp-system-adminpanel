import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Eye, Plus, X } from "lucide-react";
import useLeaves from "./useHooks";
import useEmployees from "../employees/useHooks";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";
import { Can, CanAny } from "@/components/auth/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import type { LeaveRequest, LeaveStatus } from "@/utils/helpers/models/leaves/leave.dto";
import type { Employee } from "@/utils/helpers/models/employees/employee.dto";

function statusLabel(status?: string) {
  return status ? status.charAt(0).toUpperCase() + status.slice(1) : "--";
}

function statusClass(status?: string) {
  if (status === "approved") return "bg-success-bg text-success-text border border-panel-border";
  if (status === "rejected") return "bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40";
  if (status === "cancelled") return "bg-muted-foreground/10 text-muted-foreground";
  return "bg-info-bg text-info-text border border-panel-border";
}

function formatDate(value?: string | null) {
  if (!value) return "--";
  return String(value).slice(0, 10);
}

function formatDateTime(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

type LeaveForm = {
  startDate: string;
  endDate: string;
  reason: string;
};

export default function LeavesPage() {
  const { hasPermission } = usePermissions();
  const canManage = hasPermission(PERMISSIONS.LEAVE_READ_ALL);
  const canApprove = hasPermission(PERMISSIONS.LEAVE_APPROVE);
  const canReject = hasPermission(PERMISSIONS.LEAVE_REJECT);
  const { applyLeave, getMyLeaves, getAllLeaves, approveLeave, rejectLeave, cancelLeave } =
    useLeaves();
  const { getAllEmployees } = useEmployees();

  const [myRows, setMyRows] = useState<LeaveRequest[]>([]);
  const [myTotal, setMyTotal] = useState(0);
  const [myPage, setMyPage] = useState(1);
  const [myLimit, setMyLimit] = useState(10);

  const [allRows, setAllRows] = useState<LeaveRequest[]>([]);
  const [allTotal, setAllTotal] = useState(0);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [leaveStatus, setLeaveStatus] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [allPage, setAllPage] = useState(1);
  const [allLimit, setAllLimit] = useState(10);
  const [viewingLeave, setViewingLeave] = useState<LeaveRequest | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [reviewingAction, setReviewingAction] = useState<"approve" | "reject" | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LeaveForm>({
    defaultValues: { startDate: "", endDate: "", reason: "" },
  });

  const refreshMine = (page = myPage, limit = myLimit) => {
    getMyLeaves(setMyRows, { limit, offset: (page - 1) * limit }, setMyTotal);
  };

  const fetchAll = (
    page = allPage,
    limit = allLimit,
    emp = employeeId,
    status = leaveStatus,
    from = startDate,
    to = endDate,
  ) => {
    const params: Record<string, unknown> = { limit, offset: (page - 1) * limit };
    if (emp) params.employeeId = emp;
    if (status) params.leaveStatus = status;
    if (from) params.startDate = from;
    if (to) params.endDate = to;
    getAllLeaves(setAllRows, params, setAllTotal);
  };

  useEffect(() => {
    refreshMine(1, myLimit);
    if (canManage || canApprove || canReject) {
      getAllEmployees(setEmployees);
      fetchAll(1, allLimit, "", "", "", "");
    }
  }, []);

  const onApply = async (form: LeaveForm) => {
    const created = await applyLeave({
      startDate: form.startDate,
      endDate: form.endDate,
      reason: form.reason.trim(),
    });
    if (created) {
      reset();
      refreshMine(1, myLimit);
      setMyPage(1);
    }
  };

  const openLeaveView = (row: LeaveRequest) => {
    setViewingLeave(row);
    setReviewNote(row.reviewNote || "");
    setReviewingAction(null);
  };

  const closeLeaveView = () => {
    setViewingLeave(null);
    setReviewNote("");
    setReviewingAction(null);
  };

  const submitReview = async (action: "approve" | "reject") => {
    if (!viewingLeave || reviewingAction) return;
    setReviewingAction(action);
    const ok =
      action === "approve"
        ? await approveLeave(viewingLeave.id, reviewNote)
        : await rejectLeave(viewingLeave.id, reviewNote);
    setReviewingAction(null);
    if (ok) {
      closeLeaveView();
      fetchAll();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl text-foreground font-bold">Leave</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Apply for leave and track request status. Authorized users can approve or reject requests.
        </p>
      </div>

      <Can permission={PERMISSIONS.LEAVE_CREATE}>
        <form onSubmit={handleSubmit(onApply)} className="bg-card rounded-xl border border-border-main p-6 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Apply for leave</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block ui-form-label">Start date <span className="text-red-500">*</span></label>
              <input type="date" className="common-input" {...register("startDate", { required: "Start date is required" })} />
              {errors.startDate && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.startDate.message}</p>}
            </div>
            <div>
              <label className="mb-2 block ui-form-label">End date <span className="text-red-500">*</span></label>
              <input type="date" className="common-input" {...register("endDate", { required: "End date is required" })} />
              {errors.endDate && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.endDate.message}</p>}
            </div>
          </div>
          <div>
            <label className="mb-2 block ui-form-label">Reason <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              className="common-input"
              {...register("reason", { required: "Reason is required", validate: (v) => v.trim().length > 0 || "Reason is required" })}
            />
            {errors.reason && <p className="mt-1.5 text-xs text-red-500 font-semibold">{errors.reason.message}</p>}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-10 px-5 items-center justify-center gap-2 rounded-md bg-primary font-semibold text-white text-sm cursor-pointer disabled:opacity-60"
          >
            <Plus size={16} />
            Submit request
          </button>
        </form>
      </Can>

      <CanAny permissions={[PERMISSIONS.LEAVE_READ, PERMISSIONS.LEAVE_CREATE]}>
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">My leave requests</h2>
          {myRows.length ? (
            <LeaveTable
              rows={myRows}
              page={myPage}
              limit={myLimit}
              showEmployee={false}
              canCancel
              onView={openLeaveView}
              onCancel={async (id) => {
                if (await cancelLeave(id)) refreshMine();
              }}
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
                refreshMine(info.selected + 1, info.limit);
              }}
            />
          )}
        </div>
      </CanAny>

      {canManage || canApprove || canReject ? (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Leave requests</h2>
          <div className="bg-muted-foreground/5 border border-border-main p-4 rounded-xl flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1 min-w-[180px] flex-1">
              <label className="text-xs font-medium">Employee</label>
              <select className="common-input h-10 text-sm" value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
                <option value="">All employees</option>
                {employees.map((item) => (
                  <option key={item.id} value={item.id}>{item.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1 min-w-[160px]">
              <label className="text-xs font-medium">Status</label>
              <select className="common-input h-10 text-sm" value={leaveStatus} onChange={(e) => setLeaveStatus(e.target.value)}>
                <option value="">All</option>
                {(["pending", "approved", "rejected", "cancelled"] as LeaveStatus[]).map((status) => (
                  <option key={status} value={status}>{statusLabel(status)}</option>
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
              <Button variant="primary" className="h-10 text-xs px-6 font-semibold !py-0" onClick={() => { setAllPage(1); fetchAll(1, allLimit); }}>
                Apply
              </Button>
              <Button variant="secondary" className="h-10 text-xs px-6 font-semibold !py-0" onClick={() => {
                setEmployeeId(""); setLeaveStatus(""); setStartDate(""); setEndDate(""); setAllPage(1);
                fetchAll(1, allLimit, "", "", "", "");
              }}>
                Reset
              </Button>
            </div>
          </div>
          {allRows.length ? (
            <LeaveTable
              rows={allRows}
              page={allPage}
              limit={allLimit}
              showEmployee
              onView={openLeaveView}
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

      {viewingLeave ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={closeLeaveView}
        >
          <div
            className="w-full max-w-lg rounded-xl border border-border-main bg-card shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-border-main px-5 py-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Leave request</h2>
                <p className="text-sm text-muted-foreground">
                  {viewingLeave.employee?.name || "Employee"}
                  {viewingLeave.employee?.email ? ` · ${viewingLeave.employee.email}` : ""}
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted-foreground/10 cursor-pointer"
                onClick={closeLeaveView}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Start date</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{formatDate(viewingLeave.startDate)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">End date</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{formatDate(viewingLeave.endDate)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
                  <p className="mt-1">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${statusClass(viewingLeave.status)}`}>
                      {statusLabel(viewingLeave.status)}
                    </span>
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reviewed</p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {viewingLeave.reviewedBy?.fullName || formatDateTime(viewingLeave.reviewedAt)}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reason</p>
                <p className="mt-1 text-sm font-medium text-foreground whitespace-pre-wrap break-words">
                  {viewingLeave.reason || "--"}
                </p>
              </div>
              {viewingLeave.status !== "pending" && viewingLeave.reviewNote ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Note</p>
                  <p className="mt-1 text-sm font-medium text-foreground whitespace-pre-wrap break-words">
                    {viewingLeave.reviewNote}
                  </p>
                </div>
              ) : null}
              {viewingLeave.status === "pending" && (canApprove || canReject) ? (
                <div>
                  <label className="mb-2 block ui-form-label">Note</label>
                  <textarea
                    rows={3}
                    className="common-input"
                    placeholder="Add a note for the employee (optional)"
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                  />
                </div>
              ) : null}
            </div>
            {viewingLeave.status === "pending" && (canApprove || canReject) ? (
              <div className="flex justify-end gap-2 border-t border-border-main px-5 py-4">
                <Button
                  variant="secondary"
                  className="h-10 text-xs px-5 !py-0"
                  onClick={closeLeaveView}
                  disabled={Boolean(reviewingAction)}
                >
                  Close
                </Button>
                {canReject ? (
                  <Button
                    variant="danger"
                    className="h-10 text-xs px-5 !py-0"
                    onClick={() => submitReview("reject")}
                    disabled={Boolean(reviewingAction)}
                    isLoading={reviewingAction === "reject"}
                  >
                    Reject
                  </Button>
                ) : null}
                {canApprove ? (
                  <Button
                    variant="primary"
                    className="h-10 text-xs px-5 !py-0"
                    onClick={() => submitReview("approve")}
                    disabled={Boolean(reviewingAction)}
                    isLoading={reviewingAction === "approve"}
                  >
                    Approve
                  </Button>
                ) : null}
              </div>
            ) : (
              <div className="flex justify-end border-t border-border-main px-5 py-4">
                <Button variant="secondary" className="h-10 text-xs px-5 !py-0" onClick={closeLeaveView}>
                  Close
                </Button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function LeaveTable({
  rows,
  page,
  limit,
  showEmployee,
  canCancel,
  onView,
  onCancel,
}: {
  rows: LeaveRequest[];
  page: number;
  limit: number;
  showEmployee: boolean;
  canCancel?: boolean;
  onView?: (row: LeaveRequest) => void;
  onCancel?: (id: string) => void;
}) {
  return (
    <div className="bg-card rounded-xl border border-border-main overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-main">
          <thead className="bg-muted-foreground/5">
            <tr>
              {["Sr No.", ...(showEmployee ? ["Employee"] : []), "Start", "End", "Reason", "Status", "Note", "Actions"].map((col) => (
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
                <td className="table-td">{String(row.startDate).slice(0, 10)}</td>
                <td className="table-td">{String(row.endDate).slice(0, 10)}</td>
                <td className="table-td max-w-xs truncate" title={row.reason}>{row.reason}</td>
                <td className="table-td">
                  <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${statusClass(row.status)}`}>
                    {statusLabel(row.status)}
                  </span>
                </td>
                <td className="table-td max-w-[160px] truncate">{row.reviewNote || "--"}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    {onView ? (
                      <button
                        type="button"
                        className="btn-action-view"
                        title="View leave request"
                        onClick={() => onView(row)}
                      >
                        <Eye size={16} />
                      </button>
                    ) : null}
                    {canCancel && row.status === "pending" ? (
                      <button type="button" className="text-xs font-semibold text-muted-foreground hover:text-foreground cursor-pointer" onClick={() => onCancel?.(row.id)}>
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
