import { Link } from "react-router-dom";
import { ArrowDownCircle, ArrowUpCircle, Eye } from "lucide-react";

interface CommerceTx {
  id: string;
  type: "CASH IN" | "CASH OUT";
  date: string | Date | null;
  party: string;
  description: string;
  amount: number;
  paymentSource: string | null;
  enteredBy: string | null;
  refId?: string | null;
  isAdvance?: boolean;
  receiptGroupId?: string | null;
  receiptTotal?: number | null;
  receiptDueAmount?: number | null;
  receiptAdvanceAmount?: number | null;
}

interface TransactionsTableProps {
  transactions: CommerceTx[];
  filterType: string;
  setFilterType: (v: string) => void;
  filterSearch: string;
  setFilterSearch: (v: string) => void;
}

const formatDate = (dateString: string | Date | null) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

export default function TransactionsTable({
  transactions,
  filterType,
  setFilterType,
  filterSearch,
  setFilterSearch,
}: TransactionsTableProps) {
  const filtered = transactions.filter((tx) => {
    if (filterType && filterType !== "ALL" && tx.type !== filterType) {
      return false;
    }
    if (filterSearch.trim()) {
      const q = filterSearch.trim().toLowerCase();
      const hay = `${tx.party} ${tx.paymentSource || ""} ${tx.enteredBy || ""} ${tx.description || ""} ${tx.isAdvance ? "advance" : ""}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const totalIn = filtered
    .filter((t) => t.type === "CASH IN")
    .reduce((s, t) => s + Number(t.amount || 0), 0);
  const totalOut = filtered
    .filter((t) => t.type === "CASH OUT")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  return (
    <div className="bg-card border border-border-main rounded-xl shadow-xs overflow-hidden">
      <div className="p-4 border-b border-border-main flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <h3 className="text-base font-bold text-foreground">
          Commerce Cashflow History
        </h3>
        <div className="flex flex-wrap gap-2">
          <select
            className="common-input !w-auto min-w-[140px] cursor-pointer text-sm"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">All Types</option>
            <option value="CASH IN">Cash In</option>
            <option value="CASH OUT">Cash Out</option>
          </select>
          <input
            type="search"
            placeholder="Search customer, source..."
            className="common-input !w-auto min-w-[200px] text-sm"
            value={filterSearch}
            onChange={(e) => setFilterSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 border-b border-border-main bg-muted/20">
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-4 py-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Total Cash In
          </p>
          <p className="text-lg font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
            PKR {totalIn.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-rose-500/20 bg-rose-500/5 px-4 py-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Total Cash Out
          </p>
          <p className="text-lg font-bold text-rose-700 dark:text-rose-400 mt-0.5">
            PKR {totalOut.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border-main bg-muted/30 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-semibold">Type</th>
              <th className="px-4 py-3 font-semibold">Date</th>
              <th className="px-4 py-3 font-semibold">Customer</th>
              <th className="px-4 py-3 font-semibold">Source</th>
              <th className="px-4 py-3 font-semibold text-right">Amount</th>
              <th className="px-4 py-3 font-semibold">Entered By</th>
              <th className="px-4 py-3 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-10 text-center text-muted-foreground"
                >
                  No commerce cashflow entries yet
                </td>
              </tr>
            ) : (
              filtered.map((tx) => (
                <tr
                  key={`${tx.type}-${tx.id}`}
                  className="border-b border-border-main/60 hover:bg-muted/20"
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="inline-flex flex-wrap items-center gap-1.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                          tx.type === "CASH IN"
                            ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
                        }`}
                      >
                        {tx.type === "CASH IN" ? (
                          <ArrowDownCircle size={12} />
                        ) : (
                          <ArrowUpCircle size={12} />
                        )}
                        {tx.type === "CASH IN" ? "Cash In" : "Cash Out"}
                      </span>
                      {tx.type === "CASH IN" && tx.isAdvance ? (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/30"
                          title={
                            String(tx.description || "")
                              .toLowerCase()
                              .includes("applied")
                              ? "Advance applied to a sale"
                              : "Customer advance deposit"
                          }
                        >
                          {String(tx.description || "")
                            .toLowerCase()
                            .includes("applied")
                            ? "Advance Applied"
                            : "Advance"}
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-foreground">
                    {formatDate(tx.date)}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    {tx.party || "—"}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {tx.paymentSource || "—"}
                  </td>
                  <td className="px-4 py-3 text-right text-foreground whitespace-nowrap">
                    <div className="font-bold">
                      PKR {Number(tx.amount || 0).toLocaleString()}
                    </div>
                    {tx.type === "CASH IN" &&
                    Number(tx.receiptTotal || 0) > 0 &&
                    Number(tx.receiptAdvanceAmount || 0) > 0 ? (
                      <div className="mt-0.5 text-[10px] font-semibold text-muted-foreground leading-snug">
                        Receipt PKR{" "}
                        {Number(tx.receiptTotal).toLocaleString()}
                        <br />
                        Due {Number(tx.receiptDueAmount || 0).toLocaleString()}{" "}
                        · Advance{" "}
                        {Number(tx.receiptAdvanceAmount).toLocaleString()}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {tx.enteredBy || "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      to={`/commerce/cashflow/view/${tx.type === "CASH IN" ? "in" : "out"}/${tx.id}`}
                      className="inline-flex items-center justify-center w-8 h-8 rounded-lg btn-action-view"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
