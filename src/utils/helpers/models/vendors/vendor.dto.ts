export interface Vendor {
  id: string;
  vendorName: string;
  jobDescription: string;
  vendorType: "Raw Material" | "Sub Contractor" | "Both";
  address?: string;
  phone?: string;
  city?: string;
  created_at: string;
}
