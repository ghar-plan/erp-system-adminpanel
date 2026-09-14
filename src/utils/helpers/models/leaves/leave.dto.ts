import type { Employee } from "../employees/employee.dto";

export type LeaveStatus = "pending" | "approved" | "rejected" | "cancelled";

export interface LeaveRequest {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  reviewNote?: string | null;
  reviewedByUserId?: string | null;
  reviewedAt?: string | null;
  created_at?: string;
  updated_at?: string;
  employee?: Employee;
  reviewedBy?: {
    id: string;
    fullName?: string;
  } | null;
}
