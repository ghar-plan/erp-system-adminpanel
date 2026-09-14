import type { Employee } from "../employees/employee.dto";

export type AttendanceStatus = "checked_in" | "checked_out";

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkInAt?: string | null;
  checkOutAt?: string | null;
  checkInLat?: number | null;
  checkInLng?: number | null;
  checkOutLat?: number | null;
  checkOutLng?: number | null;
  status: AttendanceStatus;
  created_at?: string;
  updated_at?: string;
  employee?: Employee;
}
