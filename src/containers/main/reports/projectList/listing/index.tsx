import React, { useEffect, useState } from "react";
import { Download, Building2, Banknote, User } from "lucide-react";
import Button from "@/components/ui/Button";

import { Project } from "@/utils/helpers/models/projects/project.dto";
import { Cashflows_APIS } from "@/libs/apis/cashflows.api";
import axios from "@/utils/helpers/common/axios.config";
import { store } from "@/store";
import Pagination from "@/components/particles/table/pagination";

import useReports from "@/containers/main/reports/useHooks";
import { Can } from "@/components/auth/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { Vendor } from "@/utils/helpers/models/vendors/vendor.dto";

interface LedgerSummaryData {
  totalActiveProjects: number;
  totalOutflowYTD: number;
  recentDisbursements: any[];
}

export default function ProjectLedger() {
  const { getProjects, getVendors, getProjectTransactionReport } = useReports();
  const { hasAnyPermission } = usePermissions();
  const canFilterVendors = hasAnyPermission([
    PERMISSIONS.VENDORS_READ,
    PERMISSIONS.REPORTS_VENDOR_FILTER,
  ]);

  const [projects, setProjects] = useState<Project[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState({ page: 1, limit: 10 });
  const [summaryData, setSummaryData] = useState<LedgerSummaryData>({
    totalActiveProjects: 0,
    totalOutflowYTD: 0,
    recentDisbursements: [],
  });

  useEffect(() => {
    getProjects(setProjects);
    if (canFilterVendors) {
      getVendors(setVendors);
    }
    fetchLedgerData(filters, selectedProjectId, canFilterVendors ? selectedVendorId : "");
  }, []);

  useEffect(() => {
    if (filters.page !== 1 || filters.limit !== 10) {
      fetchLedgerData(filters, selectedProjectId, canFilterVendors ? selectedVendorId : "");
    }
  }, [filters.page, filters.limit]);

  const handleApplyFilters = () => {
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchLedgerData(
      { ...filters, page: 1 },
      selectedProjectId,
      canFilterVendors ? selectedVendorId : "",
    );
  };

  const handleResetFilters = () => {
    setSelectedProjectId("");
    setSelectedVendorId("");
    setFilters((prev) => ({ ...prev, page: 1 }));
    fetchLedgerData({ ...filters, page: 1 }, "", "");
  };

  const fetchLedgerData = (
    currentFilters: { page: number; limit: number },
    projectId: string,
    vendorId: string,
  ) => {
    const params: any = {
      limit: currentFilters.limit,
      offset: (currentFilters.page - 1) * currentFilters.limit,
    };
    if (projectId) {
      params.projectId = projectId;
    }
    if (vendorId) {
      params.vendorId = vendorId;
    }
    getProjectTransactionReport(setSummaryData, params, setTotalElements);
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    const nextPage = pageInfo.selected + 1;
    setFilters({ page: nextPage, limit: pageInfo.limit });
    fetchLedgerData(
      { page: nextPage, limit: pageInfo.limit },
      selectedProjectId,
      canFilterVendors ? selectedVendorId : "",
    );
  };

  const handleDownloadReceipt = async (id: string) => {
    try {
      const token = store.getState().sharedReducer.token;
      const response = await axios.get(Cashflows_APIS.downloadReceipt(id, "out"), {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `receipt-out-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading receipt", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (value: number | string) => {
    return new Intl.NumberFormat("en-PK", {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(Number(value));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Project Transaction Ledger
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Financial bird's-eye view of disbursements for{" "}
            <span className="font-semibold text-foreground">Projects</span>.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Active Projects Card */}
        <div className="app-card relative overflow-hidden group">
          <p className="ui-form-label text-muted-foreground mb-2">
            Total Active Projects
          </p>
          <p className="text-4xl font-bold text-foreground">
            {summaryData.totalActiveProjects}
          </p>
        </div>

        {/* Outflow Card */}
        <div className="app-card relative overflow-hidden group">
          <p className="ui-form-label text-muted-foreground mb-2">
            Total Outflow (YTD)
          </p>
          <p className="text-4xl font-bold text-foreground">
            {formatCurrency(summaryData.totalOutflowYTD)
              .replace("PKR", "")
              .trim()}
          </p>
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
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.siteName}
              </option>
            ))}
          </select>
        </div>

        {canFilterVendors && (
          <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[260px]">
            <label
              htmlFor="vendorId"
              className="text-xs text-foreground font-medium whitespace-nowrap"
            >
              Vendor
            </label>
            <select
              id="vendorId"
              value={selectedVendorId}
              onChange={(e) => setSelectedVendorId(e.target.value)}
              className="common-input text-sm h-10 w-full sm:w-64 bg-card"
            >
              <option value="">All Vendors</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.vendorName}
                </option>
              ))}
            </select>
          </div>
        )}

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

      {/* Table Section */}
      <div className="w-full flex flex-col gap-4">
        <div className="bg-card rounded-xl border border-border-main overflow-hidden shadow-xs animate-slide-up">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-main">
              <thead className="bg-muted-foreground/5">
                <tr className="text-left">
                  <th className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Project Name
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Vendor
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Activity
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-right text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Outflow (PKR)
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Date of Entry
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-center text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main bg-card text-foreground">
                {summaryData.recentDisbursements.map((tx, index) => (
                  <tr
                    key={tx.id || index}
                    className="hover:bg-muted-foreground/5 transition-colors"
                  >
                    <td className="table-td">
                      <p className="font-semibold text-foreground">
                        {tx.projectName}
                      </p>
                      <p className="text-xs text-muted-foreground uppercase mt-0.5">
                        {tx.subtext}
                      </p>
                    </td>
                    <td className="table-td">
                      <span className="text-foreground font-semibold ">
                        {tx.vendorName}
                      </span>
                    </td>
                    <td className="table-td">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                        {tx.activityName}
                      </span>
                    </td>
                    <td className="table-td text-right">
                      <span className="font-bold text-foreground font-mono">
                        {formatCurrency(tx.outflow).replace("PKR", "").trim()}
                      </span>
                    </td>
                    <td className="table-td">{formatDate(tx.date)}</td>
                    <td className="table-td text-center">
                      <Can permission={PERMISSIONS.CASH_FLOW_PRINT}>
                        <button
                          onClick={() => handleDownloadReceipt(tx.id)}
                          className="btn-action-download"
                          title="Download Receipt"
                        >
                          <Download size={16} />
                        </button>
                      </Can>
                    </td>
                  </tr>
                ))}

                {summaryData.recentDisbursements.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-8 text-center text-muted-foreground bg-card"
                    >
                      No recent disbursements found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {summaryData.recentDisbursements.length > 0 && (
          <Pagination
            count={totalElements}
            page={filters.page}
            limit={filters.limit}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
}
