export interface Vendor {
  id: string;
  vendorName: string;
  jobDescription: string;
  vendorType: "vendorMaterial" | "vendorLabour" | "Both" | "Raw Material" | "Sub Contractor";
  address?: string;
  phone?: string;
  city?: string;
  created_at: string;
}
