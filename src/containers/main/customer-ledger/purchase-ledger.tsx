import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BookOpen, Banknote, Scale, ShoppingCart, Eye, Search } from "lucide-react";
import Button from "@/components/ui/Button";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import { Purchases_APIS } from "@/libs/apis/purchases.api";
import { PurchaseSuppliers_APIS } from "@/libs/apis/purchase-suppliers.api";
import { formatMoney, SOURCE_PAYMENT_OPTIONS } from "@/utils/helpers/models/purchases/purchase.dto";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";

interface LedgerEntry {
  id: string;
  date: string;
  supplierName: string;
  productName: string;
  quantity: number;
  amount: number | null;
  payment: number | null;
  balance: number | null;
  sourcePayment: string;
  remarks: string | null;
  runningBalance: number | null;
}

interface LedgerSummary {
  totalEntries: number;
  totalAmount: number | null;
  totalPayment: number | null;
  totalBalance: number | null;
}

interface SupplierOption {
  id: string;
  name: string;
}

export default function PurchaseLedger() {
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sourcePayment, setSourcePayment] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [totalElements, setTotalElements] = useState(0);
  const [entries, setEntries] = useState<LedgerEntry[]>([]);
  const [summary, setSummary] = useState<LedgerSummary>({
    totalEntries: 0,
    totalAmount: 0,
    totalPayment: 0,
    totalBalance: 0,
  });
  const [loading, setLoading] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);

  useEffect(() => {
    PurchaseSuppliers_APIS.getAll().then((response: any) => {
      if (response?.status && Array.isArray(response.data)) {
        setSuppliers(response.data);
      }
    });
    fetchLedger(1, limit, "", "", "", "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLedger = async (
    nextPage = page,
    nextLimit = limit,
    supplierName = selectedSupplier,
    from = startDate,
    to = endDate,
    paymentSource = sourcePayment,
  ) => {
    setLoading(true);
    setHasQueried(true);
    try {
      const params: Record<string, any> = {
        limit: nextLimit,
        offset: (nextPage - 1) * nextLimit,
      };
      if (supplierName) params.supplierName = supplierName;
      if (from) params.startDate = from;
      if (to) params.endDate = to;
      if (paymentSource) params.sourcePayment = paymentSource;

      const response: any = await Purchases_APIS.getLedger(params);
      if (response?.status && response.data) {
        setEntries(response.data.entries || []);
        setSummary(
          response.data.summary || {
            totalEntries: 0,
            totalAmount: 0,
            totalPayment: 0,
            totalBalance: 0,
          },
        );
        setTotalElements(response.data.total || 0);
        setPage(nextPage);
        setLimit(nextLimit);
      } else {
        setEntries([]);
        setTotalElements(0);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    fetchLedger(1, limit, selectedSupplier, startDate, endDate, sourcePayment);
  };

  const handleReset = () => {
    setSelectedSupplier("");
    setStartDate("");
    setEndDate("");
    setSourcePayment("");
    setPage(1);
    fetchLedger(1, limit, "", "", "", "");
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    fetchLedger(pageInfo.selected + 1, pageInfo.limit);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "--";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "--";
    }
  };

  const isAllSuppliers = !selectedSupplier;

  return (
    <div className="space-y-6">
      <div className="bg-muted-foreground/5 border border-border-main p-4 rounded-xl shadow-xs flex flex-wrap items-end justify-start md:justify-end gap-3 w-full">
        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[260px]">
          <label htmlFor="supplierName" className="text-xs text-foreground font-medium whitespace-nowrap">
            Supplier
          </label>
          <select
            id="supplierName"
            value={selectedSupplier}
            onChange={(e) => setSelectedSupplier(e.target.value)}
            className="common-input text-sm h-10 w-full sm:w-72 bg-card"
          >
            <option value="">All</option>
            {suppliers.map((supplier) => (
              <option key={supplier.id} value={supplier.name}>
                {supplier.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto min-w-[160px]">
          <label htmlFor="purchaseStartDate" className="text-xs text-foreground font-medium">
            From
          </label>
          <input
            id="purchaseStartDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="common-input text-sm h-10 w-full sm:w-44 bg-card"
          />
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto min-w-[160px]">
          <label htmlFor="purchaseEndDate" className="text-xs text-foreground font-medium">
            To
          </label>
          <input
            id="purchaseEndDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="common-input text-sm h-10 w-full sm:w-44 bg-card"
          />
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto min-w-[170px]">
          <label htmlFor="purchaseSourcePayment" className="text-xs text-foreground font-medium whitespace-nowrap">
            Payment Source
          </label>
          <select
            id="purchaseSourcePayment"
            value={sourcePayment}
            onChange={(e) => setSourcePayment(e.target.value)}
            className="common-input text-sm h-10 w-full sm:w-44 bg-card"
          >
            <option value="">All Sources</option>
            {SOURCE_PAYMENT_OPTIONS.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2 w-full sm:w-auto justify-end min-w-[170px]">
          <Button
            variant="primary"
            onClick={handleApply}
            className="h-10 text-xs px-6 font-semibold flex-1 sm:flex-initial !py-0"
            disabled={loading}
          >
            <Search size={14} className="mr-1.5" />
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

      {hasQueried ? (
        <>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <BookOpen size={16} className="text-primary" />
            <span>
              {isAllSuppliers ? (
                "All suppliers"
              ) : (
                <>
                  Ledger for{" "}
                  <span className="font-semibold text-foreground">
                    {selectedSupplier}
                  </span>
                </>
              )}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-card border border-border-main p-4 rounded-xl shadow-xs">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <ShoppingCart size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Entries
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {summary.totalEntries}
              </p>
            </div>
            <div className="bg-card border border-border-main p-4 rounded-xl shadow-xs">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Banknote size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Total Amount
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatMoney(summary.totalAmount)}
              </p>
            </div>
            <div className="bg-card border border-border-main p-4 rounded-xl shadow-xs">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Banknote size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Total Paid
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatMoney(summary.totalPayment)}
              </p>
            </div>
            <div className="bg-card border border-border-main p-4 rounded-xl shadow-xs">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Scale size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Outstanding
                </span>
              </div>
              <p className="text-2xl font-bold text-foreground">
                {formatMoney(summary.totalBalance)}
              </p>
            </div>
          </div>

          {entries.length > 0 ? (
            <div className="bg-card rounded-xl border border-border-main overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-main">
                  <thead className="bg-muted-foreground/5">
                    <tr className="text-left">
                      <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        Date
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        Supplier
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        Products
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap text-right">
                        Qty
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap text-right">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap text-right">
                        Payment
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap text-right">
                        Balance
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap text-right">
                        Running Bal.
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        Source
                      </th>
                      <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main bg-card text-foreground">
                    {entries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-muted-foreground/5 transition-colors">
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {formatDate(entry.date)}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">
                          {entry.supplierName || "--"}
                        </td>
                        <td className="px-4 py-3 text-sm max-w-[220px]">
                          <span className="line-clamp-2" title={entry.productName}>
                            {entry.productName || "--"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-mono">
                          {entry.quantity ?? "--"}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-mono font-semibold">
                          {formatMoney(entry.amount)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-mono">
                          {formatMoney(entry.payment)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-mono">
                          {formatMoney(entry.balance)}
                        </td>
                        <td className="px-4 py-3 text-sm text-right font-mono font-bold">
                          {formatMoney(entry.runningBalance)}
                        </td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          {entry.sourcePayment || "--"}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Can permission={PERMISSIONS.PURCHASES_READ}>
                            <Link
                              to={siteRoutes.purchasesView.replace(":id", entry.id)}
                              className="btn-action-edit"
                              title="View purchase"
                            >
                              <Eye size={16} />
                            </Link>
                          </Can>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <DataNotFound show={!loading} />
          )}

          {totalElements > 0 && (
            <Pagination
              count={totalElements}
              page={page}
              limit={limit}
              onPageChange={onPageChange}
            />
          )}
        </>
      ) : null}
    </div>
  );
}
