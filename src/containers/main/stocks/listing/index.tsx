import React, { useEffect, useMemo, useState } from "react";
import { Search, Package, Boxes, ChevronDown, ChevronRight } from "lucide-react";
import useStocks from "../useHooks";
import { Stock, StockBatch } from "@/utils/helpers/models/stocks/stock.dto";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";
import { formatMoney } from "@/utils/helpers/models/purchases/purchase.dto";
import {
  normalizeVariantId,
  skuMapKey,
} from "@/utils/helpers/models/product-sku";
import { canAccessPurchasePrice } from "@/utils/helpers/permissions/purchase-price-access";
import useStore from "@/hooks/useStore";
import ExpiryStatusBadge from "@/components/ui/ExpiryStatusBadge";
import { getExpiryStatus } from "@/utils/helpers/common/expiry-status";

interface StockFilters {
  search: string;
  page: number;
  limit: number;
}

type StockProductGroup = {
  productId: string;
  productName: string;
  variants: Stock[];
  available: number;
  totalPurchased: number;
  totalSold: number;
};

const emptyFilters: StockFilters = {
  search: "",
  page: 1,
  limit: 10,
};

const formatDate = (value?: string | null) => {
  if (!value) return "--";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value).slice(0, 10);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatQty = (value?: number | string | null) => {
  const n = Number(value);
  if (!Number.isFinite(n)) return "--";
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

const groupStocksByProduct = (stocks: Stock[]): StockProductGroup[] => {
  const order: string[] = [];
  const map = new Map<string, StockProductGroup>();

  for (const row of stocks || []) {
    const productId = String(row.productId);
    let group = map.get(productId);
    if (!group) {
      group = {
        productId,
        productName: row.productName || productId,
        variants: [],
        available: 0,
        totalPurchased: 0,
        totalSold: 0,
      };
      map.set(productId, group);
      order.push(productId);
    }
    group.variants.push(row);
    group.available += Number(row.quantity) || 0;
    group.totalPurchased += Number(row.totalPurchased) || 0;
    group.totalSold += Number(row.totalSold) || 0;
    // Prefer a non-empty product name if later rows have a better one
    if (row.productName?.trim()) group.productName = row.productName.trim();
  }

  return order.map((id) => map.get(id)!);
};

export default function StocksListing() {
  const { getStocks, getBatchesByProduct } = useStocks();
  const { getUser } = useStore();
  const canViewPurchasePrice = canAccessPurchasePrice(getUser()?.email);
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [searchVal, setSearchVal] = useState("");
  const [filters, setFilters] = useState<StockFilters>(emptyFilters);
  /** Expanded product accordion */
  const [expandedProductId, setExpandedProductId] = useState<string | null>(
    null,
  );
  /** Expanded variant → FIFO batches */
  const [expandedVariantKey, setExpandedVariantKey] = useState<string | null>(
    null,
  );
  const [batchesBySku, setBatchesBySku] = useState<
    Record<string, StockBatch[]>
  >({});
  const [loadingBatchesFor, setLoadingBatchesFor] = useState<string | null>(
    null,
  );

  const groups = useMemo(() => groupStocksByProduct(stocks), [stocks]);

  const fetchStocks = (currentFilters: StockFilters) => {
    const queryParams: any = {
      limit: currentFilters.limit,
      offset: (currentFilters.page - 1) * currentFilters.limit,
    };
    if (currentFilters.search) queryParams.search = currentFilters.search;
    getStocks(setStocks, queryParams, setTotalElements);
  };

  useEffect(() => {
    fetchStocks({ ...emptyFilters, page: 1 });
  }, []);

  const handleApplyFilters = () => {
    const updatedFilters = { ...filters, search: searchVal, page: 1 };
    setFilters(updatedFilters);
    setExpandedProductId(null);
    setExpandedVariantKey(null);
    fetchStocks(updatedFilters);
  };

  const handleResetFilters = () => {
    setSearchVal("");
    setFilters(emptyFilters);
    setExpandedProductId(null);
    setExpandedVariantKey(null);
    fetchStocks(emptyFilters);
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    const nextPage = pageInfo.selected + 1;
    const updatedFilters = {
      ...filters,
      page: nextPage,
      limit: pageInfo.limit,
    };
    setFilters(updatedFilters);
    setExpandedProductId(null);
    setExpandedVariantKey(null);
    fetchStocks(updatedFilters);
  };

  const toggleProduct = (productId: string) => {
    setExpandedProductId((prev) => (prev === productId ? null : productId));
    setExpandedVariantKey(null);
  };

  const toggleVariantBatches = async (item: Stock) => {
    const key = skuMapKey(item.productId, item.variantId);
    if (expandedVariantKey === key) {
      setExpandedVariantKey(null);
      return;
    }
    setExpandedVariantKey(key);
    if (batchesBySku[key]) return;

    setLoadingBatchesFor(key);
    const batches = await getBatchesByProduct(
      item.productId,
      normalizeVariantId(item.variantId),
    );
    setBatchesBySku((prev) => ({ ...prev, [key]: batches }));
    setLoadingBatchesFor(null);
  };

  const columns = [
    "",
    "Sr No.",
    "Product",
    "Variants",
    "Available",
    "Total Purchased",
    "Total Sold",
  ];

  const renderBatches = (item: Stock) => {
    const key = skuMapKey(item.productId, item.variantId);
    const batches = batchesBySku[key] || [];
    const loading = loadingBatchesFor === key;

    if (loading) {
      return (
        <p className="text-sm text-muted-foreground px-3 py-2">
          Loading FIFO batches…
        </p>
      );
    }
    if (!batches.length) {
      return (
        <p className="text-sm text-muted-foreground px-3 py-2">
          No purchase batches for this variant yet.
        </p>
      );
    }

    return (
      <div className="space-y-2 px-1 py-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          FIFO batches — oldest sold first (this variant only)
        </p>
        <div className="overflow-x-auto rounded-lg border border-border-main">
          <table className="min-w-full text-sm">
            <thead className="bg-muted-foreground/5">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-bold text-muted-foreground">
                  Purchased on
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold text-muted-foreground">
                  Expires on
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold text-muted-foreground">
                  Expiry status
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold text-muted-foreground">
                  Qty purchased
                </th>
                <th className="px-3 py-2 text-left text-xs font-bold text-muted-foreground">
                  Qty left in stock
                </th>
                {canViewPurchasePrice ? (
                  <th className="px-3 py-2 text-left text-xs font-bold text-muted-foreground">
                    Per Item
                  </th>
                ) : null}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-main">
              {batches.map((batch) => {
                const expiry = getExpiryStatus(batch.expiryDate);
                return (
                  <tr key={batch.id} className={expiry.toneClass}>
                    <td className="px-3 py-2">
                      {formatDate(batch.purchaseDate)}
                    </td>
                    <td className="px-3 py-2">
                      {formatDate(batch.expiryDate)}
                    </td>
                    <td className="px-3 py-2">
                      <ExpiryStatusBadge info={expiry} />
                    </td>
                    <td className="px-3 py-2">{formatQty(batch.quantity)}</td>
                    <td className="px-3 py-2 font-semibold">
                      {formatQty(batch.remainingQuantity)}
                    </td>
                    {canViewPurchasePrice ? (
                      <td className="px-3 py-2">{formatMoney(batch.rate)}</td>
                    ) : null}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
            Stock
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stock is tracked per product variant. Sales use FIFO within that
            variant — oldest purchase batch is sold first.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs animate-fade-in">
        <span className="font-semibold text-muted-foreground uppercase tracking-wider">
          Expiry key
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-success-bg text-success-text border border-panel-border font-bold">
            Fresh
          </span>
          <span className="text-muted-foreground">&gt; 30 days left</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-warning-bg text-warning-text border border-panel-border font-bold">
            Near expiry
          </span>
          <span className="text-muted-foreground">≤ 30 days left</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded-md bg-danger-bg text-danger-text border border-panel-border font-bold">
            Expired
          </span>
          <span className="text-muted-foreground">Past expiry date</span>
        </span>
      </div>

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 animate-fade-in">
        <div className="bg-card border border-border-main p-4 rounded-xl shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Package size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">
              SKUs in Stock
            </span>
            <span className="text-xl font-bold text-foreground mt-0.5 block">
              {totalElements}
            </span>
          </div>
        </div>
        <div className="bg-card border border-border-main p-4 rounded-xl shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <Boxes size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">
              How to read
            </span>
            <span className="text-sm font-semibold text-foreground mt-0.5 block">
              Expand product → variants → FIFO batches
            </span>
          </div>
        </div>
      </div>

      <div className="bg-muted-foreground/5 border border-border-main p-4 rounded-xl animate-fade-in shadow-xs flex flex-wrap items-end justify-start md:justify-end gap-3 w-full">
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
              placeholder="Search by product or variant name..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="common-input pl-10 pr-4 text-sm h-10 w-full"
            />
          </div>
        </div>

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

      <div className="w-full flex flex-col gap-4">
        {groups.length > 0 ? (
          <div className="bg-card rounded-xl border border-border-main overflow-hidden shadow-xs animate-slide-up">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-main">
                <thead className="bg-muted-foreground/5">
                  <tr className="text-left">
                    {columns.map((column, index) => (
                      <th
                        className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                        key={index}
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main bg-card text-foreground">
                  {groups.map((group, index) => {
                    const isExpanded = expandedProductId === group.productId;
                    const lowStock = group.available <= 0;
                    const variantCount = group.variants.length;

                    return (
                      <React.Fragment key={group.productId}>
                        <tr
                          className="hover:bg-muted-foreground/5 transition-colors cursor-pointer"
                          onClick={() => toggleProduct(group.productId)}
                        >
                          <td className="table-td w-10 text-muted-foreground">
                            {isExpanded ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </td>
                          <td className="table-td">
                            {(filters.page - 1) * filters.limit + index + 1}
                          </td>
                          <td className="table-td font-semibold text-foreground">
                            {group.productName}
                          </td>
                          <td className="table-td">
                            <span className="px-2.5 py-1 text-xs font-bold tracking-wide rounded-md bg-info-bg text-info-text border border-panel-border">
                              {variantCount}{" "}
                              {variantCount === 1 ? "variant" : "variants"}
                            </span>
                          </td>
                          <td className="table-td">
                            <span
                              className={`px-2.5 py-1 text-xs font-bold tracking-wide rounded-md ${
                                lowStock
                                  ? "bg-danger-bg text-danger-text border border-panel-border"
                                  : "bg-success-bg text-success-text border border-panel-border"
                              }`}
                            >
                              {formatQty(group.available)}
                            </span>
                          </td>
                          <td className="table-td">
                            {formatQty(group.totalPurchased)}
                          </td>
                          <td className="table-td">
                            {formatQty(group.totalSold)}
                          </td>
                        </tr>

                        {isExpanded ? (
                          <tr className="bg-muted-foreground/[0.03]">
                            <td colSpan={columns.length} className="px-6 py-4">
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  Variants — click a row for FIFO batches
                                </p>
                                <div className="overflow-x-auto rounded-lg border border-border-main">
                                  <table className="min-w-full text-sm">
                                    <thead className="bg-muted-foreground/5">
                                      <tr>
                                        <th className="w-8 px-3 py-2" />
                                        <th className="px-3 py-2 text-left text-xs font-bold text-muted-foreground">
                                          Variant
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-muted-foreground">
                                          Available
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-muted-foreground">
                                          Purchased
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-bold text-muted-foreground">
                                          Sold
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-main">
                                      {group.variants.map((item) => {
                                        const key = skuMapKey(
                                          item.productId,
                                          item.variantId,
                                        );
                                        const isVariantOpen =
                                          expandedVariantKey === key;
                                        const available = Number(item.quantity);
                                        const variantLow = available <= 0;

                                        return (
                                          <React.Fragment key={item.id}>
                                            <tr
                                              className="hover:bg-muted-foreground/5 transition-colors cursor-pointer"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleVariantBatches(item);
                                              }}
                                            >
                                              <td className="px-3 py-2 text-muted-foreground">
                                                {isVariantOpen ? (
                                                  <ChevronDown size={14} />
                                                ) : (
                                                  <ChevronRight size={14} />
                                                )}
                                              </td>
                                              <td className="px-3 py-2 font-medium">
                                                {item.variantName || (
                                                  <span className="text-muted-foreground">
                                                    — (product-level)
                                                  </span>
                                                )}
                                              </td>
                                              <td className="px-3 py-2">
                                                <span
                                                  className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                                                    variantLow
                                                      ? "bg-danger-bg text-danger-text"
                                                      : "bg-success-bg text-success-text"
                                                  }`}
                                                >
                                                  {formatQty(available)}
                                                </span>
                                              </td>
                                              <td className="px-3 py-2">
                                                {formatQty(item.totalPurchased)}
                                              </td>
                                              <td className="px-3 py-2">
                                                {formatQty(item.totalSold)}
                                              </td>
                                            </tr>
                                            {isVariantOpen ? (
                                              <tr>
                                                <td
                                                  colSpan={5}
                                                  className="bg-card px-3 py-2"
                                                >
                                                  {renderBatches(item)}
                                                </td>
                                              </tr>
                                            ) : null}
                                          </React.Fragment>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <DataNotFound show={true} />
        )}

        {totalElements > 0 && (
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
