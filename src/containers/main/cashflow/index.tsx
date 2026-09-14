import { useEffect, useRef, useState } from "react";
import useCashflow from "./useHooks";
import CashInForm from "./components/CashInForm";
import CashOutForm from "./components/CashOutForm";
import TransactionsTable from "./components/TransactionsTable";
import Pagination from "@/components/particles/table/pagination";
import { buildPaymentDetailsPayload } from "@/utils/helpers/models/cashflow/cashflow.dto";
import { CanIf } from "@/components/auth/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { FileText } from "lucide-react";

export default function Cashflow() {
  const { hasPermission } = usePermissions();
  const canRead = hasPermission(PERMISSIONS.CASH_FLOW_READ);
  const canExport = hasPermission(PERMISSIONS.CASH_FLOW_EXPORT);
  const canLoadVendorOptions =
    hasPermission(PERMISSIONS.VENDORS_READ) ||
    hasPermission(PERMISSIONS.REPORTS_VENDOR_FILTER) ||
    hasPermission(PERMISSIONS.CASH_FLOW_OUT);
  const canLoadActivityOptions =
    hasPermission(PERMISSIONS.ACTIVITY_READ) ||
    hasPermission(PERMISSIONS.CASH_FLOW_OUT);
  const {
    getProjects,
    getVendors,
    getActivities,
    getCashflowCombinedList,
    recordCashIn,
    recordCashOut,
    deleteCashflow,
    exportCashflowCsv,
    exportCashflowPdf,
    downloadReceipt,
  } = useCashflow();

  const formsSectionRef = useRef<HTMLDivElement>(null);
  const cashInFormRef = useRef<HTMLDivElement>(null);
  const cashOutFormRef = useRef<HTMLDivElement>(null);

  // Dropdown states
  const [projects, setProjects] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  // List states
  const [transactions, setTransactions] = useState<any[]>([]);
  const [submittingIn, setSubmittingIn] = useState(false);
  const [submittingOut, setSubmittingOut] = useState(false);
  const [totals, setTotals] = useState({ totalIn: 0, totalOut: 0 });

  // Edit states
  const [editDataIn, setEditDataIn] = useState<any>(null);
  const [editDataOut, setEditDataOut] = useState<any>(null);

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
      canLoadVendorOptions ? getVendors(setVendors) : Promise.resolve(),
      canLoadActivityOptions ? getActivities(setActivities) : Promise.resolve(),
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

    await getCashflowCombinedList(setTransactions, queryParams, setTotalElements, setTotals);
  };

  useEffect(() => {
    if (!canRead) return;
    fetchMetadata();
  }, [canRead]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filterProject, filterType, filterSearch, filterStartDate, filterEndDate]);

  useEffect(() => {
    if (!canRead) return;
    fetchTransactions({
      projectId: filterProject,
      type: filterType,
      search: filterSearch,
      startDate: filterStartDate,
      endDate: filterEndDate,
      page,
      limit,
    });
  }, [canRead, filterProject, filterType, filterSearch, filterStartDate, filterEndDate, page, limit]);

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
      ...buildPaymentDetailsPayload(data),
    };
    if (editDataIn) {
      await useCashflow().editCashIn(editDataIn.id, payload, () => {
        setEditDataIn(null);
        refreshTransactions();
      });
    } else {
      await recordCashIn(payload, () => {
        refreshTransactions();
      });
    }
    setSubmittingIn(false);
  };

  const handleRecordExpense = async (data: any) => {
    setSubmittingOut(true);

    // DB stores unit price in `amount`; total shown in UI is quantity × price
    const payload = {
      projectId: data.projectId,
      vendorId: data.vendorId,
      activityId: data.activityId,
      items: data.items,
      category: data.category,
      quantity: Number(data.quantity),
      uom: data.uom,
      amount: Number(data.price),
      ...buildPaymentDetailsPayload(data),
    };
    if (editDataOut) {
      await useCashflow().editCashOut(editDataOut.id, payload, () => {
        setEditDataOut(null);
        refreshTransactions();
      });
    } else {
      await recordCashOut(payload, () => {
        refreshTransactions();
      });
    }
    setSubmittingOut(false);
  };

  const handleEdit = (tx: any) => {
    if (tx.type === "CASH IN") {
      setEditDataOut(null);
      setEditDataIn(tx);
    } else {
      setEditDataIn(null);
      setEditDataOut(tx);
    }

    // Scroll the relevant form into view (main layout scrolls inside <main>, not window)
    requestAnimationFrame(() => {
      const target =
        tx.type === "CASH IN"
          ? cashInFormRef.current
          : cashOutFormRef.current;
      (target || formsSectionRef.current)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };



  // Export to PDF from backend
  const handlePdfExport = async () => {
    const queryParams: any = {};
    if (filterProject) queryParams.projectId = filterProject;
    if (filterType && filterType !== "ALL") queryParams.type = filterType;
    if (filterSearch) queryParams.search = filterSearch;
    if (filterStartDate) queryParams.startDate = filterStartDate;
    if (filterEndDate) queryParams.endDate = filterEndDate;

    await exportCashflowPdf(queryParams);
  };

  const handleDelete = async (
    id: string,
    type: "CASH IN" | "CASH OUT",
    label: string,
  ) => {
    await deleteCashflow(id, type, label, refreshTransactions);
  };

  const handleDownloadReceipt = async (
    id: string,
    type: "CASH IN" | "CASH OUT",
  ) => {
    await downloadReceipt(id, type);
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

      {canRead ? (
        <>
      {/* Forms Grid Layout */}
      <CanIf permissions={[PERMISSIONS.CASH_FLOW_IN, PERMISSIONS.CASH_FLOW_OUT, PERMISSIONS.CASH_FLOW_UPDATE]}>
      <div
        ref={formsSectionRef}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start animate-slide-up scroll-mt-4"
      >
        <CanIf permissions={[PERMISSIONS.CASH_FLOW_IN, PERMISSIONS.CASH_FLOW_UPDATE]}>
          <div ref={cashInFormRef} className="scroll-mt-4">
            <CashInForm
              projects={projects}
              onSubmit={handleRecordPayment}
              submitting={submittingIn}
              editData={editDataIn}
              onCancelEdit={() => setEditDataIn(null)}
            />
          </div>
        </CanIf>

        <CanIf permissions={[PERMISSIONS.CASH_FLOW_OUT, PERMISSIONS.CASH_FLOW_UPDATE]}>
          <div ref={cashOutFormRef} className="scroll-mt-4 lg:col-span-2">
            <CashOutForm
              projects={projects}
              vendors={vendors}
              activities={activities}
              onSubmit={handleRecordExpense}
              submitting={submittingOut}
              editData={editDataOut}
              onCancelEdit={() => setEditDataOut(null)}
            />
          </div>
        </CanIf>
      </div>
      </CanIf>

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
          exportData={handlePdfExport}
          formatDate={formatDate}
          onDelete={handleDelete}
          onDownloadReceipt={handleDownloadReceipt}
          onEdit={handleEdit}
          totals={totals}
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
        </>
      ) : canExport ? (
        <div className="flex justify-start">
          <button
            type="button"
            onClick={handlePdfExport}
            className="flex h-10 px-5 items-center justify-center gap-2 rounded-md border border-border-main bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-foreground text-sm font-semibold transition-all cursor-pointer shadow-xs whitespace-nowrap"
          >
            <FileText size={16} />
            Export PDF
          </button>
        </div>
      ) : null}
    </div>
  );
}
