import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { FileSpreadsheet } from "lucide-react";

interface Transaction {
  id: string;
  date: string;
  project: string;
  projectId: string;
  type: "CASH IN" | "CASH OUT";
  description: string;
  vendorClient: string;
  amount: number;
}

interface TransactionsTableProps {
  transactions: Transaction[];
  projects: any[];
  filterProject: string;
  setFilterProject: (val: string) => void;
  filterDate: string;
  setFilterDate: (val: string) => void;
  exportToCSV: () => void;
  formatDate: (d: any) => string;
}

export default function TransactionsTable({
  transactions,
  projects,
  filterProject,
  setFilterProject,
  filterDate,
  setFilterDate,
  exportToCSV,
  formatDate,
}: TransactionsTableProps) {
  // Local draft states to allow Apply/Reset behavior
  const [draftProject, setDraftProject] = useState(filterProject);
  const [draftDate, setDraftDate] = useState(filterDate);

  // Sync draft states if parent filters change externally
  useEffect(() => {
    setDraftProject(filterProject);
  }, [filterProject]);

  useEffect(() => {
    setDraftDate(filterDate);
  }, [filterDate]);

  const handleApply = () => {
    setFilterProject(draftProject);
    setFilterDate(draftDate);
  };

  const handleReset = () => {
    setDraftProject("");
    setDraftDate("");
    setFilterProject("");
    setFilterDate("");
  };

  return (
    <div className="space-y-4">
      {/* Table Title */}
      <div className="flex justify-between gap-4 flex-wrap">
        <h2 className="text-xl font-bold text-foreground  ">
          Recent Transactions
        </h2>

        <button
          onClick={exportToCSV}
          className="flex h-10 px-5 items-center justify-center gap-2 rounded-md border border-border-main bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-foreground text-sm font-semibold transition-all cursor-pointer shadow-xs whitespace-nowrap self-start sm:self-auto"
        >
          <FileSpreadsheet size={16} />
          Export CSV
        </button>
      </div>

      {/* Filters Toolbar Card */}
      <div className="bg-muted-foreground/5 border border-border-main p-4 rounded-xl animate-fade-in shadow-xs flex justify-end">
        {/* Right: Filters & Views */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          {/* Project Filter */}
          <select
            value={draftProject}
            onChange={(e) => setDraftProject(e.target.value)}
            className="common-input h-10 w-full sm:w-48 bg-card"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.siteName}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <input
            type="date"
            value={draftDate}
            onChange={(e) => setDraftDate(e.target.value)}
            className="common-input h-10 w-full sm:w-48 bg-card"
          />

          <div className="flex gap-2 w-full sm:w-auto ml-auto sm:ml-0">
            <Button
              variant="primary"
              onClick={handleApply}
              className="h-10 text-xs px-6 font-semibold flex-1 sm:flex-initial !py-0"
            >
              Apply
            </Button>
            <Button
              variant="secondary"
              onClick={handleReset}
              className="h-10 text-xs px-6 font-semibold flex-1 sm:flex-initial !py-0"
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Transactions Table Card */}
      <div className="bg-card rounded-xl border border-border-main overflow-hidden shadow-xs animate-slide-up">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border-main">
            {/* Table Header */}
            <thead className="bg-muted-foreground/5">
              <tr className="text-left">
                <th className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  DATE
                </th>
                <th className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  PROJECT
                </th>
                <th className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  TYPE
                </th>
                <th className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  DESCRIPTION
                </th>
                <th className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  VENDOR / CLIENT
                </th>
                <th className="px-6 py-4 text-xs font-bold text-right text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  AMOUNT
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main bg-card text-foreground">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-muted-foreground/5 transition-colors"
                  >
                    <td className="table-td">
                      {tx?.date ? formatDate(tx.date) : "--"}
                    </td>
                    <td className="table-td font-semibold text-foreground animate-fade-in">
                      {tx?.project || "--"}
                    </td>
                    <td className="table-td">
                      <span
                        className={`inline-flex items-center gap-1 font-bold text-[10px] tracking-wider px-2 py-0.5 rounded border ${
                          tx.type === "CASH IN"
                            ? "bg-success-bg text-success-text border-success-text/10"
                            : "bg-warning-bg text-warning-text border-warning-text/10"
                        }`}
                      >
                        {tx.type === "CASH IN" ? "↓" : "↑"} {tx.type}
                      </span>
                    </td>
                    <td className="table-td text-muted-foreground max-w-[200px] truncate">
                      {tx?.description || "--"}
                    </td>
                    <td className="table-td">{tx?.vendorClient || "--"}</td>
                    <td className="table-td font-bold text-foreground text-right">
                      {tx?.amount !== undefined
                        ? `PKR ${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                        : "--"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-sm text-muted-foreground  "
                  >
                    No transactions recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
