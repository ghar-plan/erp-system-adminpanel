import React, { useEffect, useState } from "react";
import { Users, Loader2 } from "lucide-react";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import useReports from "@/containers/main/reports/useHooks";
import Button from "@/components/ui/Button";

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
  const { getProjects, getVendorReport } = useReports();
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [vendors, setVendors] = useState<VendorReportRow[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [totalPaymentSum, setTotalPaymentSum] = useState<number>(0);

  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  const [loading, setLoading] = useState<boolean>(false);

  // Fetch all projects for drop-down filter
  useEffect(() => {
    getProjects(setProjects);
    fetchReport(filters, selectedProjectId);
  }, []);

  useEffect(() => {
    if (filters.page !== 1 || filters.limit !== 10) {
      fetchReport(filters, selectedProjectId);
    }
  }, [filters.page, filters.limit]);

  const handleApplyFilters = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchReport({ ...filters, page: 1 }, selectedProjectId);
  };

  const handleResetFilters = () => {
    setSelectedProjectId("");
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchReport({ ...filters, page: 1 }, "");
  };

  // Fetch report data based on current page and selected project site
  const fetchReport = async (
    currentFilters: { page: number; limit: number },
    projectId: string,
  ) => {
    const offset = (currentFilters.page - 1) * currentFilters.limit;
    const params: any = { offset, limit: currentFilters.limit };
    if (projectId) {
      params.projectId = projectId;
    }

    await getVendorReport(params, setVendors, setTotal, setTotalPaymentSum);
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    const nextPage = pageInfo.selected + 1;
    setFilters({ page: nextPage, limit: pageInfo.limit });
    fetchReport({ page: nextPage, limit: pageInfo.limit }, selectedProjectId);
  };

  // Generate vendor code mimicking VND-YYYY-SHORT_HEX format
  const getVendorCode = (row: VendorReportRow) => {
    const year = row.created_at ? new Date(row.created_at).getFullYear() : 2026;
    const shortId = row.id
      ? row.id.split("-")[0].substring(0, 3).toUpperCase()
      : "000";
    return `VND-${year}-${shortId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
          Vendor List Report
        </h1>
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

      {/* Filters Toolbar Card */}
      <div className="bg-muted-foreground/5 border border-border-main p-4 rounded-xl animate-fade-in shadow-xs flex flex-wrap items-end justify-start md:justify-end gap-3 w-full">
        {/* Project Site */}
        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[260px]">
          <label
            htmlFor="projectId"
            className="text-xs text-foreground font-medium whitespace-nowrap"
          >
            Project Site
          </label>
          <select
            id="projectId"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="common-input text-sm h-10 w-full sm:w-64 bg-card"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.siteName}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full sm:w-auto justify-end min-w-[170px]">
          <Button
            variant="primary"
            onClick={handleApplyFilters}
            className="h-10 text-xs px-6 font-semibold flex-1 sm:flex-initial !py-0"
          >
            Apply
          </Button>
          <Button
            variant="secondary"
            onClick={handleResetFilters}
            className="h-10 text-xs px-6 font-semibold flex-1 sm:flex-initial !py-0"
          >
            Reset
          </Button>
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
                            {vendor.vendorName
                              ? vendor.vendorName.substring(0, 2).toUpperCase()
                              : "VN"}
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
                        {vendor.totalPayment
                          ? vendor.totalPayment.toLocaleString("en-US")
                          : "0"}
                      </td>
                    </tr>
                  ))}

                  {/* Total Payment Footer Row */}
                  <tr className="bg-muted-foreground/5 font-semibold">
                    <td
                      colSpan={3}
                      className="px-6 py-5 text-sm font-bold text-right text-muted-foreground uppercase tracking-wider"
                    >
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
                page={filters.page}
                limit={filters.limit}
                count={total}
                onPageChange={onPageChange}
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
