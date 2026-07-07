import React, { useEffect, useState } from "react";
import { Users, Loader2 } from "lucide-react";
import { Projects_APIS } from "@/libs/apis/projects.api";
import { Vendors_APIS } from "@/libs/apis/vendors.api";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import { errorToaster } from "@/utils/helpers/common/alert-service";

interface VendorReportRow {
  id: string;
  vendorName: string;
  jobDescription: string;
  created_at: string;
  totalPayment: number;
  projectNames: string;
}

interface ProjectOption {
  id: string;
  siteName: string;
}

export default function VendorListReport() {
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [vendors, setVendors] = useState<VendorReportRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPaymentSum, setTotalPaymentSum] = useState<number>(0);
  
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch all projects for drop-down filter
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await Projects_APIS.getAllWithoutPagination();
        if (response?.status && response?.data) {
          setProjects(response.data);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };
    fetchProjects();
  }, []);

  // Fetch report data based on current page and selected project site
  const fetchReport = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const params: any = { offset, limit };
      if (selectedProjectId) {
        params.projectId = selectedProjectId;
      }
      
      const response = await Vendors_APIS.getReport(params);
      if (response?.status && response?.data) {
        setVendors(response.data.data || []);
        setTotal(response.data.total || 0);
        setTotalPaymentSum(response.data.totalPaymentSum || 0);
      } else {
        setVendors([]);
        setTotal(0);
        setTotalPaymentSum(0);
      }
    } catch (err) {
      errorToaster("Failed to retrieve vendor list report.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [page, selectedProjectId]);

  // Generate vendor code mimicking VND-YYYY-SHORT_HEX format
  const getVendorCode = (row: VendorReportRow) => {
    const year = row.created_at ? new Date(row.created_at).getFullYear() : 2026;
    const shortId = row.id ? row.id.split("-")[0].substring(0, 3).toUpperCase() : "000";
    return `VND-${year}-${shortId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
          Vendor List Report
        </h1>
        
        {/* Project Site Selector */}
        <div className="flex flex-col min-w-[200px]">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">
            Project Site
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setPage(1);
            }}
            className="common-input bg-card h-10 w-full sm:w-64"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.siteName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Vendors Card */}
      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 animate-fade-in">
        <div className="bg-card border border-border-main p-5 rounded-xl shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <span className="text-xs font-bold text-muted-foreground block uppercase tracking-wider">
              Active Vendors
            </span>
            <span className="text-3xl font-extrabold text-foreground mt-0.5 block">
              {total}
            </span>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="w-full flex flex-col gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 bg-card rounded-xl border border-border-main">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="mt-2 text-sm text-muted-foreground font-semibold">
              Loading report details...
            </p>
          </div>
        ) : vendors.length > 0 ? (
          <div className="bg-card rounded-xl border border-border-main overflow-hidden shadow-xs animate-slide-up">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-main">
                <thead className="bg-muted-foreground/5">
                  <tr className="text-left">
                    <th className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider">
                      Vendor Name
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider">
                      Activities
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider">
                      Project Name
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-right text-muted-foreground uppercase tracking-wider">
                      Total Payment (PKR)
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-border-main bg-card text-foreground">
                  {vendors.map((vendor) => (
                    <tr
                      key={vendor.id}
                      className="hover:bg-muted-foreground/5 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          {/* Avatar Circle with Initials */}
                          <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            {vendor.vendorName ? vendor.vendorName.substring(0, 2).toUpperCase() : "VN"}
                          </div>
                          <div>
                            <div className="font-bold text-foreground">
                              {vendor.vendorName}
                            </div>
                            <div className="text-xs text-muted-foreground font-medium mt-0.5">
                              ID: {getVendorCode(vendor)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-muted-foreground">
                        {vendor.jobDescription || "--"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-muted-foreground">
                        {vendor.projectNames}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-foreground text-right">
                        {vendor.totalPayment ? vendor.totalPayment.toLocaleString("en-US") : "0"}
                      </td>
                    </tr>
                  ))}
                  
                  {/* Total Payment Footer Row */}
                  <tr className="bg-muted-foreground/5 font-semibold">
                    <td colSpan={3} className="px-6 py-5 text-sm font-bold text-right text-muted-foreground uppercase tracking-wider">
                      Total Payment
                    </td>
                    <td className="px-6 py-5 text-base font-extrabold text-foreground text-right">
                      PKR {totalPaymentSum.toLocaleString("en-US")}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Pagination Controls */}
            <div className="px-6 py-4 border-t border-border-main bg-card">
              <Pagination
                page={page}
                limit={limit}
                count={total}
                onPageChange={(pageInfo) => setPage(pageInfo.selected + 1)}
              />
            </div>
          </div>
        ) : (
          <DataNotFound show={true} />
        )}
      </div>
    </div>
  );
}
