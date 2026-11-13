import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  BookOpen,
  Banknote,
  Scale,
  ShoppingCart,
  ReceiptText,
  Eye,
  Search,
} from "lucide-react";
import PurchaseLedger from "./purchase-ledger";
import { usePermissions } from "@/hooks/usePermissions";
import Button from "@/components/ui/Button";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import { Sales_APIS } from "@/libs/apis/sales.api";
import { CustomerTypes_APIS } from "@/libs/apis/customer-types.api";
import {
  CustomerType,
  customerTypeCategoryLabel,
} from "@/utils/helpers/models/customer-types/customer-type.dto";
import {
  formatMoney,
  SOURCE_PAYMENT_OPTIONS,
} from "@/utils/helpers/models/purchases/purchase.dto";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";

interface LedgerEntry {
  id: string;
  date: string;
  customerName: string | null;
  customerTypeName?: string | null;
  telephone: string | null;
  productName: string;
  quantity: number;
  amount: number;
  payment: number;
  balance: number;
  sourcePayment: string;
  remarks: string | null;
  runningBalance: number;
}

interface LedgerSummary {
  totalEntries: number;
  totalAmount: number;
  totalPayment: number;
  totalBalance: number;
}

interface LedgerCustomerType {
  id: string;
  name: string;
  category: string;
  pickupPointName: string | null;
}

export default function CustomerLedger() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermission } = usePermissions();
  const canSales = hasPermission(PERMISSIONS.SALES_READ);
  const canPurchases = hasPermission(PERMISSIONS.PURCHASES_READ);
  const requestedTab = searchParams.get("tab") === "purchases" ? "purchases" : "sales";
  const tab =
    requestedTab === "purchases" && canPurchases
      ? "purchases"
      : canSales
        ? "sales"
        : "purchases";

  const setTab = (next: "sales" | "purchases") => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", next);
    if (next === "sales") params.delete("supplierName");
    else params.delete("customerTypeId");
    setSearchParams(params, { replace: true });
  };
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);
  const [selectedCustomerTypeId, setSelectedCustomerTypeId] = useState(
    searchParams.get("customerTypeId") || "",
  );
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sourcePayment, setSourcePayment] = useState(
    searchParams.get("sourcePayment") || "",
  );
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
  const [ledgerCustomerType, setLedgerCustomerType] =
    useState<LedgerCustomerType | null>(null);
  const [loading, setLoading] = useState(false);
  const [hasQueried, setHasQueried] = useState(false);

  useEffect(() => {
    if (!canSales) return;
    CustomerTypes_APIS.getAllWithoutPagination().then((response: any) => {
      if (response?.status && Array.isArray(response.data)) {
        const list: CustomerType[] = response.data;
        setCustomerTypes(list);

        const fromUrl = searchParams.get("customerTypeId");
        const urlMatch =
          fromUrl && list.some((ct) => ct.id === fromUrl) ? fromUrl : "";
        setSelectedCustomerTypeId(urlMatch);
        fetchLedger(1, limit, urlMatch, startDate, endDate, sourcePayment);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (searchParams.get("tab") === "purchases") return;
    const fromUrl = searchParams.get("customerTypeId") || "";
    const sourceFromUrl = searchParams.get("sourcePayment") || "";
    if (sourceFromUrl !== sourcePayment) {
      setSourcePayment(sourceFromUrl);
    }
    if (fromUrl !== selectedCustomerTypeId) {
      setSelectedCustomerTypeId(fromUrl);
      fetchLedger(1, limit, fromUrl, startDate, endDate, sourceFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const fetchLedger = async (
    nextPage = page,
    nextLimit = limit,
    customerTypeId = selectedCustomerTypeId,
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
      if (customerTypeId) params.customerTypeId = customerTypeId;
      if (from) params.startDate = from;
      if (to) params.endDate = to;
      if (paymentSource) params.sourcePayment = paymentSource;

      const response: any = await Sales_APIS.getLedger(params);
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
        setLedgerCustomerType(response.data.customerType || null);
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
    const params = new URLSearchParams(searchParams);
    params.set("tab", "sales");
    if (selectedCustomerTypeId) {
      params.set("customerTypeId", selectedCustomerTypeId);
    } else {
      params.delete("customerTypeId");
    }
    if (sourcePayment) {
      params.set("sourcePayment", sourcePayment);
    } else {
      params.delete("sourcePayment");
    }
    setSearchParams(params);
    fetchLedger(
      1,
      limit,
      selectedCustomerTypeId,
      startDate,
      endDate,
      sourcePayment,
    );
  };

  const handleReset = () => {
    setSelectedCustomerTypeId("");
    setStartDate("");
    setEndDate("");
    setSourcePayment("");
    setPage(1);
    const params = new URLSearchParams(searchParams);
    params.set("tab", "sales");
    params.delete("customerTypeId");
    params.delete("sourcePayment");
    setSearchParams(params, { replace: true });
    fetchLedger(1, limit, "", "", "", "");
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    const nextPage = pageInfo.selected + 1;
    fetchLedger(nextPage, pageInfo.limit);
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

  const isAllCustomers = !selectedCustomerTypeId;
  const titleName = isAllCustomers
    ? "All"
    : ledgerCustomerType?.name ||
      customerTypes.find((ct) => ct.id === selectedCustomerTypeId)?.name ||
      "Customer / Pickup Point";

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
            Ledger
          </h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {tab === "purchases"
              ? "Purchases, payments, and running balance for every supplier."
              : "Sales, payments, and running balance for every customer and pickup point."}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-border-main">
        {canSales ? (
          <button
            type="button"
            onClick={() => setTab("sales")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-lg border-b-2 transition-all cursor-pointer ${
              tab === "sales"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <ShoppingCart size={16} />
            Sales Ledger
          </button>
        ) : null}
        {canPurchases ? (
          <button
            type="button"
            onClick={() => setTab("purchases")}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-lg border-b-2 transition-all cursor-pointer ${
              tab === "purchases"
                ? "border-primary text-primary bg-primary/5"
                : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <ReceiptText size={16} />
            Purchase Ledger
          </button>
        ) : null}
      </div>

      {tab === "purchases" ? (
        <PurchaseLedger />
      ) : (
      <>
      {/* Filters */}
      <div className="bg-muted-foreground/5 border border-border-main p-4 rounded-xl shadow-xs flex flex-wrap items-end justify-start md:justify-end gap-3 w-full">
        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[260px]">
          <label
            htmlFor="customerTypeId"
            className="text-xs text-foreground font-medium whitespace-nowrap"
          >
            Customer / Pickup Point
          </label>
          <select
            id="customerTypeId"
            value={selectedCustomerTypeId}
            onChange={(e) => setSelectedCustomerTypeId(e.target.value)}
            className="common-input text-sm h-10 w-full sm:w-72 bg-card"
          >
            <option value="">All</option>
            {customerTypes.map((ct) => (
              <option key={ct.id} value={ct.id}>
                {ct.name}
                {ct.category
                  ? ` (${customerTypeCategoryLabel(ct.category)})`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[160px]">
          <label
            htmlFor="startDate"
            className="text-xs text-foreground font-medium"
          >
            From
          </label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="common-input text-sm h-10 w-full sm:w-44 bg-card"
          />
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[160px]">
          <label
            htmlFor="endDate"
            className="text-xs text-foreground font-medium"
          >
            To
          </label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="common-input text-sm h-10 w-full sm:w-44 bg-card"
          />
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label
            htmlFor="sourcePayment"
            className="text-xs text-foreground font-medium whitespace-nowrap"
          >
            Payment Source
          </label>
          <select
            id="sourcePayment"
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
              {isAllCustomers ? (
                <>
                  All customers and pickup points
                </>
              ) : (
                <>
                  Ledger for{" "}
                  <span className="font-semibold text-foreground">
                    {titleName}
                  </span>
                  {ledgerCustomerType?.category
                    ? ` · ${customerTypeCategoryLabel(ledgerCustomerType.category)}`
                    : ""}
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

          <div className="w-full flex flex-col gap-4">
            {entries.length > 0 ? (
              <div className="bg-card rounded-xl border border-border-main overflow-hidden shadow-xs animate-slide-up">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border-main">
                    <thead className="bg-muted-foreground/5">
                      <tr className="text-left">
                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                          Date
                        </th>
                        {isAllCustomers ? (
                          <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                            Customer / Pickup Point
                          </th>
                        ) : null}
                        <th className="px-4 py-3 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                          Customer
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
                        <tr
                          key={entry.id}
                          className="hover:bg-muted-foreground/5 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm whitespace-nowrap">
                            {formatDate(entry.date)}
                          </td>
                          {isAllCustomers ? (
                            <td className="px-4 py-3 text-sm font-semibold whitespace-nowrap">
                              {entry.customerTypeName || "--"}
                            </td>
                          ) : null}
                          <td className="px-4 py-3 text-sm">
                            <p className="font-semibold">
                              {entry.customerName || "--"}
                            </p>
                            {entry.telephone ? (
                              <p className="text-xs text-muted-foreground">
                                {entry.telephone}
                              </p>
                            ) : null}
                          </td>
                          <td className="px-4 py-3 text-sm max-w-[220px]">
                            <span
                              className="line-clamp-2"
                              title={entry.productName}
                            >
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
                            <Can permission={PERMISSIONS.SALES_READ}>
                              <Link
                                to={siteRoutes.salesView.replace(
                                  ":id",
                                  entry.id,
                                )}
                                className="btn-action-edit"
                                title="View sale"
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
          </div>
        </>
      ) : null}
      </>
      )}
    </div>
  );
}
