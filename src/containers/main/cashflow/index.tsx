import React, { useEffect, useState } from "react";
import useCashflow from "./useHooks";
import CashInForm from "./components/CashInForm";
import CashOutForm from "./components/CashOutForm";
import TransactionsTable from "./components/TransactionsTable";
import Pagination from "@/components/particles/table/pagination";

export default function Cashflow() {
  const {
    getProjects,
    getVendors,
    getActivities,
    getCashflowCombinedList,
    recordCashIn,
    recordCashOut,
    exportCashflowCsv,
  } = useCashflow();

  // Dropdown states
  const [projects, setProjects] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  // List states
  const [transactions, setTransactions] = useState<any[]>([]);
  const [submittingIn, setSubmittingIn] = useState(false);
  const [submittingOut, setSubmittingOut] = useState(false);

  // Pagination states
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Filters state
  const [filterProject, setFilterProject] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  // Helper date formatters
  const formatDate = (dateString: string | Date) => {
    try {
      const dateObj = new Date(dateString);
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return "N/A";
    }
  };

  const formatDateToYMD = (dateString: string | Date) => {
    try {
      const dateObj = new Date(dateString);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, "0");
      const day = String(dateObj.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch (e) {
      return "";
    }
  };

  // Fetch metadata dropdown options
  const fetchMetadata = async () => {
    await Promise.all([
      getProjects(setProjects),
      getVendors(setVendors),
      getActivities(setActivities),
    ]);
  };

  // Fetch transactions from backend with active filters
  const fetchTransactions = async (currentFilters: {
    projectId?: string;
    type?: string;
    search?: string;
    startDate?: string;
    endDate?: string;
    page: number;
    limit: number;
  }) => {
    const { projectId, type, search, startDate, endDate, page, limit } = currentFilters;

    const queryParams: any = {
      offset: (page - 1) * limit,
      limit,
    };
    if (projectId) queryParams.projectId = projectId;
    if (type) queryParams.type = type;
    if (search) queryParams.search = search;
    if (startDate) queryParams.startDate = startDate;
    if (endDate) queryParams.endDate = endDate;

    await getCashflowCombinedList(setTransactions, queryParams, setTotalElements);
  };

  useEffect(() => {
    fetchMetadata();
  }, []);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filterProject, filterType, filterSearch, filterStartDate, filterEndDate]);

  useEffect(() => {
    fetchTransactions({
      projectId: filterProject,
      type: filterType,
      search: filterSearch,
      startDate: filterStartDate,
      endDate: filterEndDate,
      page,
      limit,
    });
  }, [filterProject, filterType, filterSearch, filterStartDate, filterEndDate, page, limit]);

  const refreshTransactions = () => {
    fetchTransactions({
      projectId: filterProject,
      type: filterType,
      search: filterSearch,
      startDate: filterStartDate,
      endDate: filterEndDate,
      page,
      limit,
    });
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    setPage(pageInfo.selected + 1);
    setLimit(pageInfo.limit);
  };

  // Form submits callbacks
  const handleRecordPayment = async (data: any) => {
    setSubmittingIn(true);
    const payload = {
      projectId: data.projectId,
      installment: data.installment,
      amount: Number(data.amount),
    };
    await recordCashIn(payload, () => {
      refreshTransactions();
    });
    setSubmittingIn(false);
  };

  const handleRecordExpense = async (data: any) => {
    setSubmittingOut(true);
    const payload = {
      projectId: data.projectId,
      vendorId: data.vendorId,
      activityId: data.activityId,
      items: data.items,
      category: data.category,
      quantity: Number(data.quantity),
      uom: data.uom,
      amount: Number(data.amount),
    };
    await recordCashOut(payload, () => {
      refreshTransactions();
    });
    setSubmittingOut(false);
  };



  // Export to CSV from backend
  const handleCSVExport = async () => {
    const csvData = await exportCashflowCsv();
    if (csvData && !csvData.error) {
      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;\uFEFF" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      const dateStr = formatDateToYMD(new Date()).replace(/-/g, "_");
      link.setAttribute("download", `cashflow_report_${dateStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl text-foreground font-bold  ">
              Cashflow Management
            </h1>
          </div>
        </div>
      </div>

      <hr className="border-border-main" />

      {/* Forms Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-slide-up">
        {/* CASH IN FORM */}
        <CashInForm
          projects={projects}
          onSubmit={handleRecordPayment}
          submitting={submittingIn}
        />

        {/* CASH OUT FORM */}
        <CashOutForm
          projects={projects}
          vendors={vendors}
          activities={activities}
          onSubmit={handleRecordExpense}
          submitting={submittingOut}
        />
      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <div className="pt-4 border-t border-border-main/60 animate-fade-in space-y-4">
        <TransactionsTable
          transactions={transactions}
          projects={projects}
          filterProject={filterProject}
          setFilterProject={setFilterProject}
          filterType={filterType}
          setFilterType={setFilterType}
          filterSearch={filterSearch}
          setFilterSearch={setFilterSearch}
          filterStartDate={filterStartDate}
          setFilterStartDate={setFilterStartDate}
          filterEndDate={filterEndDate}
          setFilterEndDate={setFilterEndDate}
          exportToCSV={handleCSVExport}
          formatDate={formatDate}
        />

        {totalElements > 0 && (
          <Pagination
            count={totalElements}
            page={page}
            limit={limit}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
}
