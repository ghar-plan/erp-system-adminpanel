import React, { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { FileSpreadsheet, Search, Trash2 } from "lucide-react";

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
  filterType: string;
  setFilterType: (val: string) => void;
  filterSearch: string;
  setFilterSearch: (val: string) => void;
  filterStartDate: string;
  setFilterStartDate: (val: string) => void;
  filterEndDate: string;
  setFilterEndDate: (val: string) => void;
  exportToCSV: () => void;
  formatDate: (d: any) => string;
  onDelete: (id: string, type: "CASH IN" | "CASH OUT", label: string) => void;
}

export default function TransactionsTable({
  transactions,
  projects,
  filterProject,
  setFilterProject,
  filterType,
  setFilterType,
  filterSearch,
  setFilterSearch,
  filterStartDate,
  setFilterStartDate,
  filterEndDate,
  setFilterEndDate,
  exportToCSV,
  formatDate,
  onDelete,
}: TransactionsTableProps) {
  // Local draft states to allow Apply/Reset behavior
  const [draftProject, setDraftProject] = useState(filterProject);
  const [draftType, setDraftType] = useState(filterType);
  const [draftSearch, setDraftSearch] = useState(filterSearch);
  const [draftStartDate, setDraftStartDate] = useState(filterStartDate);
  const [draftEndDate, setDraftEndDate] = useState(filterEndDate);

  // Sync draft states if parent filters change externally
  useEffect(() => {
    setDraftProject(filterProject);
  }, [filterProject]);

  useEffect(() => {
    setDraftType(filterType);
  }, [filterType]);

  useEffect(() => {
    setDraftSearch(filterSearch);
  }, [filterSearch]);

  useEffect(() => {
    setDraftStartDate(filterStartDate);
  }, [filterStartDate]);

  useEffect(() => {
    setDraftEndDate(filterEndDate);
  }, [filterEndDate]);

  const handleApply = () => {
    setFilterProject(draftProject);
    setFilterType(draftType);
    setFilterSearch(draftSearch);
    setFilterStartDate(draftStartDate);
    setFilterEndDate(draftEndDate);
  };

  const handleReset = () => {
    setDraftProject("");
    setDraftType("");
    setDraftSearch("");
    setDraftStartDate("");
    setDraftEndDate("");
    setFilterProject("");
    setFilterType("");
    setFilterSearch("");
    setFilterStartDate("");
    setFilterEndDate("");
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
      <div className="bg-muted-foreground/5 border border-border-main p-4 rounded-xl animate-fade-in shadow-xs flex flex-wrap items-end justify-start md:justify-end gap-3 w-full">
        {/* Search */}
        <div className="flex flex-col items-start gap-1 w-full sm:max-w-sm flex-1 md:max-w-md min-w-[260px]">
          <label
            htmlFor="search"
            className="text-xs text-foreground font-medium whitespace-nowrap"
          >
            Search
          </label>
          <div className="relative w-full">
            <Search
              className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground/80"
              size={16}
            />
            <input
              type="search"
              placeholder="Search by description, vendor/client, amount..."
              value={draftSearch}
              onChange={(e) => setDraftSearch(e.target.value)}
              className="common-input pl-10 pr-4 text-sm h-10 w-full"
            />
          </div>
        </div>

        {/* Project Filter */}
        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label
            htmlFor="project"
            className="text-xs text-foreground font-medium whitespace-nowrap"
          >
            Project
          </label>
          <select
            id="project"
            value={draftProject}
            onChange={(e) => setDraftProject(e.target.value)}
            className="common-input text-sm h-10 w-full sm:w-40 bg-card"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.siteName}
              </option>
            ))}
          </select>
        </div>

        {/* Type Filter */}
        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label
            htmlFor="type"
            className="text-xs text-foreground font-medium whitespace-nowrap"
          >
            Type
          </label>
          <select
            id="type"
            value={draftType}
            onChange={(e) => setDraftType(e.target.value)}
            className="common-input text-sm h-10 w-full sm:w-40 bg-card"
          >
            <option value="">All Types</option>
            <option value="CASH IN">Cash In</option>
            <option value="CASH OUT">Cash Out</option>
          </select>
        </div>

        {/* From Date */}
        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label
            htmlFor="startDate"
            className="text-xs text-foreground font-medium whitespace-nowrap"
          >
            From
          </label>
          <input
            type="date"
            id="startDate"
            value={draftStartDate}
            onChange={(e) => setDraftStartDate(e.target.value)}
            className="common-input text-sm h-10 w-full sm:w-40 bg-card"
          />
        </div>

        {/* To Date */}
        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label
            htmlFor="endDate"
            className="text-xs text-foreground font-medium whitespace-nowrap"
          >
            To
          </label>
          <input
            type="date"
            id="endDate"
            value={draftEndDate}
            onChange={(e) => setDraftEndDate(e.target.value)}
            className="common-input text-sm h-10 w-full sm:w-40 bg-card"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 w-full sm:w-auto justify-end min-w-[170px]">
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
                <th className="px-6 py-4 text-xs font-bold text-center text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main bg-card text-foreground">
              {transactions.length > 0 ? (
                transactions.map((tx) => (
                  <tr
                    key={`${tx.type}-${tx.id}`}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex justify-center">
                        <button
                          onClick={() =>
                            onDelete(tx.id, tx.type, tx.description || tx.type)
                          }
                          className="btn-action-delete"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
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
