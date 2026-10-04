export interface DesignVendor {
  id: string;
  vendorName: string;
  jobDescription: string;
  address?: string;
  phone?: string;
  city?: string;
  services?: { id: string; name: string }[];
  created_at: string;
  contracts?: any[];
  cashflowsOut?: any[];
}
