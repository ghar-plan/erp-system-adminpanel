import React, { useEffect, useState } from "react";
import useCashflow from "./useHooks";
import CashInForm from "./components/CashInForm";
import CashOutForm from "./components/CashOutForm";
import TransactionsTable from "./components/TransactionsTable";

export default function Cashflow() {
  const {
    getProjects,
    getVendors,
    getActivities,
    getCashflowInList,
    getCashflowOutList,
    recordCashIn,
    recordCashOut,
  } = useCashflow();

  // Dropdown states
  const [projects, setProjects] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);

  // List states
  const [cashInList, setCashInList] = useState<any[]>([]);
  const [cashOutList, setCashOutList] = useState<any[]>([]);
  const [submittingIn, setSubmittingIn] = useState(false);
  const [submittingOut, setSubmittingOut] = useState(false);

  // Filters state
  const [filterProject, setFilterProject] = useState("");
  const [filterDate, setFilterDate] = useState("");

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

  // Fetch all initial data
  const fetchData = async () => {
    await Promise.all([
      getProjects(setProjects),
      getVendors(setVendors),
      getActivities(setActivities),
      getCashflowInList(setCashInList),
      getCashflowOutList(setCashOutList),
    ]);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Form submits callbacks
  const handleRecordPayment = async (data: any) => {
    setSubmittingIn(true);
    const payload = {
      projectId: data.projectId,
      installment: data.installment,
      amount: Number(data.amount),
    };
    await recordCashIn(payload, () => {
      fetchData();
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
      fetchData();
    });
    setSubmittingOut(false);
  };

  // Merge and sort transaction list
  const transactions = [
    ...cashInList.map((item) => ({
      id: item.id,
      date: item.created_at,
      project: item.project?.siteName || "N/A",
      projectId: item.projectId,
      type: "CASH IN" as const,
      description: item.installment,
      vendorClient: "Client Payment",
      amount: Number(item.amount),
    })),
    ...cashOutList.map((item) => ({
      id: item.id,
      date: item.created_at,
      project: item.project?.siteName || "N/A",
      projectId: item.projectId,
      type: "CASH OUT" as const,
      description: item.items,
      vendorClient: item.vendor?.vendorName || "N/A",
      amount: Number(item.amount),
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Filters logic
  const filteredTransactions = transactions.filter((t) => {
    const matchesProject = !filterProject || t.projectId === filterProject;
    const matchesDate = !filterDate || formatDateToYMD(t.date) === filterDate;
    return matchesProject && matchesDate;
  });

  // Export to CSV
  const handleCSVExport = () => {
    const headers = [
      "Date",
      "Project",
      "Type",
      "Description",
      "Vendor / Client",
      "Amount (PKR)",
    ];
    const rows = filteredTransactions.map((t) => [
      formatDate(t.date),
      t.project,
      t.type,
      t.description,
      t.vendorClient,
      t.amount,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8,\uFEFF" +
      [
        headers.join(","),
        ...rows.map((e) =>
          e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(","),
        ),
      ].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = formatDateToYMD(new Date()).replace(/-/g, "_");
    link.setAttribute("download", `cashflow_report_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-background transition-colors duration-200 space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl text-foreground font-bold font-sans">
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
      <div className="pt-4 border-t border-border-main/60 animate-fade-in">
        <TransactionsTable
          transactions={filteredTransactions}
          projects={projects}
          filterProject={filterProject}
          setFilterProject={setFilterProject}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          exportToCSV={handleCSVExport}
          formatDate={formatDate}
        />
      </div>
    </div>
  );
}
