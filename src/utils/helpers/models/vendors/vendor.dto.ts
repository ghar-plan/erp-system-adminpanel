export interface Vendor {
  id: string;
  vendorName: string;
  jobDescription: string;
  vendorType: "vendorMaterial" | "vendorLabour" | "Both" | "Raw Material" | "Sub Contractor" | "Labour";
  address?: string;
  phone?: string;
  city?: string;
  materials?: { id: string; name: string }[];
  created_at: string;
  contracts?: any[];
  cashflowsOut?: any[];
}
