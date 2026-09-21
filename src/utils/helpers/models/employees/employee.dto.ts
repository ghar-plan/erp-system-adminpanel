export type EmployeeType = "Permanent" | "Temporary";

export interface Employee {
  id: string;
  userId: string;
  name: string;
  email: string;
  address: string;
  lat: number;
  lng: number;
  radius: number;
  mobileNumber: string;
  designation: string;
  employeeType?: EmployeeType;
  projectId?: string | null;
  project?: {
    id: string;
    siteName?: string;
    status?: string;
  } | null;
  salaryStatus?: string;
  salaryChargedToProject?: boolean;
  created_at?: string;
  updated_at?: string;
  user?: {
    id: string;
    fullName?: string;
    email?: string;
    status?: boolean;
  };
}
