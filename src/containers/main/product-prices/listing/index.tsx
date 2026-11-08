import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ChevronDown,
  ChevronRight,
  Search,
  Save,
  Loader2,
  History,
  X,
  Tag,
} from "lucide-react";
import useProductPrices from "../useHooks";
import {
  ProductSku,
  groupSkusByProduct,
} from "@/utils/helpers/models/product-sku";
import { formatSkuDetails } from "@/utils/helpers/models/product-sku-options";
import {
  ProductPrice,
  ProductPriceHistory,
  computeMarginPercent,
  formatMarginPercent,
} from "@/utils/helpers/models/product-prices/product-price.dto";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { errorToaster } from "@/utils/helpers/common/alert-service";

/** Keep decimals on this screen (e.g. 4.5) — do not round. */
const formatPrice = (value?: number | string | null) => {
  if (value === null || value === undefined || value === "") return "—";
  const amount = Number(value);
  if (!Number.isFinite(amount)) return "—";
  return `PKR ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

const marginToneClass = (margin: number | null): string => {
  if (margin === null) return "text-muted-foreground";
  if (margin > 0) return "text-success-text font-semibold";
  if (margin < 0) return "text-danger-text font-semibold";
  return "text-muted-foreground font-semibold";
};

const today = () => new Date().toISOString().slice(0, 10);

const formatDate = (value?: string | Date | null) => {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

export default function ProductPricesListing() {
  const { getProducts, getPriceMap, getHistory, upsertPrice } =
    useProductPrices();

  const [products, setProducts] = useState<ProductSku[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [priceMap, setPriceMap] = useState<Record<string, ProductPrice>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const groups = useMemo(() => groupSkusByProduct(products), [products]);

  const [searchVal, setSearchVal] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [historyProduct, setHistoryProduct] = useState<{
    id: string;
    variantId: string;
    productName: string;
    variantName: string | null;
  } | null>(null);
  const [historyRows, setHistoryRows] = useState<ProductPriceHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const loadPrices = async () => {
    const map = await getPriceMap();
    setPriceMap(map);
  };

  const loadProducts = async (
    currentPage = page,
    currentLimit = limit,
    search = appliedSearch,
    options: { manageLoading?: boolean } = { manageLoading: true },
  ) => {
    const manageLoading = options.manageLoading !== false;
    if (manageLoading) setLoading(true);
    try {
      await getProducts(
        setProducts,
        {
          limit: currentLimit,
          offset: (currentPage - 1) * currentLimit,
          ...(search ? { name: search } : {}),
        },
        setTotalElements,
      );
    } finally {
      if (manageLoading) setLoading(false);
    }
  };

  useEffect(() => {
    const bootstrap = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadPrices(),
          loadProducts(1, limit, "", { manageLoading: false }),
        ]);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setDrafts((prev) => {
      const next = { ...prev };
      for (const sku of products) {
        const pid = sku.skuKey;
        if (next[pid] !== undefined) continue;
        const saved = priceMap[pid];
        next[pid] =
          saved?.rate != null && Number(saved.rate) > 0
            ? String(Number(saved.rate))
            : "";
      }
      return next;
    });
  }, [products, priceMap]);

  const handleApplyFilters = () => {
    setAppliedSearch(searchVal);
    setPage(1);
    loadProducts(1, limit, searchVal);
  };

  const handleResetFilters = () => {
    setSearchVal("");
    setAppliedSearch("");
    setPage(1);
    loadProducts(1, limit, "");
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    const nextPage = pageInfo.selected + 1;
    setPage(nextPage);
    setLimit(pageInfo.limit);
    loadProducts(nextPage, pageInfo.limit, appliedSearch);
  };

  const handleSave = async (sku: ProductSku) => {
    const pid = sku.skuKey;
    const raw = (drafts[pid] || "").trim();
    const rate = Number(raw);
    if (!raw || !Number.isFinite(rate) || rate <= 0) {
      errorToaster("Enter a per-item price greater than 0 (decimals allowed, e.g. 4.5)");
      return;
    }

    const sellingRaw = Number(sku.price);
    const sellingPrice =
      Number.isFinite(sellingRaw) && sellingRaw >= 0 ? sellingRaw : null;

    setSavingId(pid);
    const ok = await upsertPrice({
      productId: sku.productId,
      productName: sku.productName,
      variantId: sku.variantId,
      variantName: sku.variantName,
      rate,
      sellingPrice,
      effectiveFrom: today(),
    });
    setSavingId(null);

    if (ok) {
      await loadPrices();
      setDrafts((prev) => ({
        ...prev,
        [pid]: String(rate),
      }));
    }
  };

  const openHistory = async (
    sku: ProductSku,
    event?: React.MouseEvent,
  ) => {
    event?.preventDefault();
    event?.stopPropagation();
    setHistoryProduct({
      id: sku.productId,
      variantId: sku.variantId,
      productName: sku.productName,
      variantName: sku.variantName,
    });
    setHistoryLoading(true);
    const rows = await getHistory(sku.productId, sku.variantId);
    setHistoryRows(rows);
    setHistoryLoading(false);
  };

  const closeHistory = () => {
    setHistoryProduct(null);
    setHistoryRows([]);
  };

  const toggleExpanded = (productId: string) =>
    setExpanded((prev) => ({ ...prev, [productId]: !prev[productId] }));

  const renderVariantRow = (sku: ProductSku) => {
    const pid = sku.skuKey;
    const draft = drafts[pid] ?? "";
    const saved = priceMap[pid];
    const isSaving = savingId === pid;
    // Selling = website (GP) price; cost = ERP rate entered here (variant-wise)
    const cost = draft.trim() !== "" ? draft : saved?.rate;
    const margin = computeMarginPercent(sku.price, cost);

    return (
      <tr key={pid} className="align-middle">
        <td className="px-3 py-3 text-sm font-medium break-words whitespace-normal">
          {sku.variantName || <span className="text-muted-foreground">—</span>}
        </td>
        <td className="px-3 py-3 text-xs text-muted-foreground break-words whitespace-normal">
          {formatSkuDetails(sku) || "—"}
        </td>
        <td className="px-3 py-3 text-sm text-muted-foreground whitespace-nowrap">
          {formatPrice(sku.price)}
        </td>
        <td className="px-3 py-3">
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="e.g. 4.5"
            value={draft}
            onChange={(e) => {
              const cleaned = e.target.value
                .replace(/[^\d.]/g, "")
                .replace(/(\..*)\./g, "$1");
              setDrafts((prev) => ({ ...prev, [pid]: cleaned }));
            }}
            className="common-input text-sm h-9 w-full max-w-[140px]"
          />
        </td>
        <td
          className={`px-3 py-3 text-sm whitespace-nowrap ${marginToneClass(margin)}`}
          title="(GP selling price − ERP cost) × 100 ÷ ERP cost"
        >
          {formatMarginPercent(sku.price, cost)}
        </td>
        <td className="px-3 py-3 text-sm text-muted-foreground whitespace-nowrap">
          {saved ? formatDate(saved.effectiveFrom) : "—"}
        </td>
        <td className="px-3 py-3">
          <div className="flex flex-wrap gap-2">
            <Can permission={PERMISSIONS.PRODUCT_PRICES_UPDATE}>
              <button
                type="button"
                disabled={isSaving}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSave(sku);
                }}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer"
                title="Save price"
              >
                {isSaving ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Save size={14} />
                )}
                Save
              </button>
            </Can>
            <button
              type="button"
              onClick={(e) => openHistory(sku, e)}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border-main bg-card text-foreground text-xs font-semibold hover:bg-muted-foreground/5 cursor-pointer"
              title="View price history"
            >
              <History size={14} />
              History
            </button>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
          Product Prices
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Set cost (ERP rate) per variant. Margin % uses the website selling
          price from Gharplans: (GP price − ERP cost) × 100 ÷ ERP cost.
          Changing a rate later only applies to new purchases.
        </p>
      </div>

      <div className="bg-muted-foreground/5 border border-border-main p-4 rounded-xl animate-fade-in shadow-xs flex flex-wrap items-end justify-start md:justify-end gap-3 w-full">
        <div className="flex flex-col items-start gap-1 w-full sm:max-w-sm flex-1 md:max-w-md min-w-[260px]">
          <label
            htmlFor="search"
            className="text-xs text-foreground font-medium whitespace-nowrap"
          >
            Search products
          </label>
          <div className="relative w-full">
            <Search
              className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground/80"
              size={16}
            />
            <input
              type="search"
              placeholder="Search by product name..."
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
            disabled={loading}
            className="h-10 text-xs px-6 font-semibold flex-1 sm:flex-initial !py-0"
          >
            Apply
          </Button>
          <Button
            variant="secondary"
            onClick={handleResetFilters}
            disabled={loading}
            className="h-10 text-xs px-6 font-semibold flex-1 sm:flex-initial !py-0"
          >
            Reset
          </Button>
        </div>
      </div>

      <div className="w-full flex flex-col gap-4">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-20 bg-card rounded-xl border border-border-main">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="mt-3 text-sm text-muted-foreground font-semibold">
              Loading products from Gharplans...
            </p>
          </div>
        ) : groups.length > 0 ? (
          <div className="bg-card rounded-xl border border-border-main overflow-hidden shadow-xs animate-slide-up">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-main">
                <thead className="bg-muted-foreground/5">
                  <tr className="text-left">
                    {["", "Sr", "Product", "Variants", "ERP rates set"].map(
                      (column, idx) => (
                        <th
                          key={idx}
                          className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                        >
                          {column}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main bg-card text-foreground">
                  {groups.map((group, index) => {
                    const isExpanded = !!expanded[group.productId];
                    const variantCount = group.variants.length;
                    const ratesSet = group.variants.filter(
                      (v) => !!priceMap[v.skuKey],
                    ).length;
                    const allSet = ratesSet === variantCount;

                    return (
                      <React.Fragment key={group.productId}>
                        <tr
                          className="hover:bg-muted-foreground/5 transition-colors cursor-pointer"
                          onClick={() => toggleExpanded(group.productId)}
                        >
                          <td className="table-td w-10 text-muted-foreground">
                            {isExpanded ? (
                              <ChevronDown size={16} />
                            ) : (
                              <ChevronRight size={16} />
                            )}
                          </td>
                          <td className="table-td">
                            {(page - 1) * limit + index + 1}
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
                              className={`px-2.5 py-1 text-xs font-bold tracking-wide rounded-md border border-panel-border ${
                                allSet
                                  ? "bg-success-bg text-success-text"
                                  : ratesSet > 0
                                    ? "bg-warning-bg text-warning-text"
                                    : "bg-muted-foreground/5 text-muted-foreground"
                              }`}
                            >
                              {ratesSet} / {variantCount} set
                            </span>
                          </td>
                        </tr>
                        {isExpanded && (
                          <tr className="bg-muted-foreground/[0.03]">
                            <td colSpan={5} className="px-6 py-4">
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                  Variant prices
                                </p>
                                <div className="overflow-x-auto rounded-lg border border-border-main">
                                  <table className="min-w-full text-sm">
                                    <thead className="bg-muted-foreground/5">
                                      <tr>
                                        {[
                                          "Variant",
                                          "Details",
                                          "Selling (GP)",
                                          "Cost (ERP)",
                                          "Margin %",
                                          "Effective From",
                                          "Actions",
                                        ].map((column) => (
                                          <th
                                            key={column}
                                            className="px-3 py-2 text-left text-xs font-bold text-muted-foreground whitespace-nowrap"
                                            title={
                                              column === "Margin %"
                                                ? "(Selling − Cost) × 100 ÷ Cost"
                                                : column === "Selling (GP)"
                                                  ? "Website selling price from Gharplans"
                                                  : column === "Cost (ERP)"
                                                    ? "Your product cost for this variant"
                                                    : undefined
                                            }
                                          >
                                            {column}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-main">
                                      {group.variants.map(renderVariantRow)}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
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

        {!loading && totalElements > 0 && (
          <Pagination
            count={totalElements}
            page={page}
            limit={limit}
            onPageChange={onPageChange}
          />
        )}
      </div>

      {historyProduct && typeof document !== "undefined"
        ? createPortal(
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
              <div
                className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
                onClick={closeHistory}
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="price-history-title"
                className="bg-card border border-border-main w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden relative animate-scale-up"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-6 py-4 border-b border-border-main flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <h3
                      id="price-history-title"
                      className="text-lg font-bold text-foreground flex items-center gap-2"
                    >
                      <Tag size={18} className="text-primary shrink-0" />
                      Price History
                    </h3>
                    {historyProduct.variantName ? (
                      <p className="text-sm font-semibold text-foreground mt-1 truncate">
                        {historyProduct.variantName}
                      </p>
                    ) : null}
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                      {historyProduct.productName}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeHistory}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted-foreground/5 cursor-pointer shrink-0"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                  {historyLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="animate-spin text-primary" size={28} />
                    </div>
                  ) : historyRows.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No price history yet. Save a price to start tracking.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm">
                        <thead>
                          <tr className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border-main">
                            <th className="pb-2 pr-3">Selling (GP)</th>
                            <th className="pb-2 pr-3">Cost (ERP)</th>
                            <th className="pb-2 pr-3">From</th>
                            <th className="pb-2">To</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border-main">
                          {historyRows.map((row) => (
                            <tr key={row.id}>
                              <td className="py-2.5 pr-3 font-semibold whitespace-nowrap">
                                {formatPrice(row.sellingPrice)}
                                {!row.effectiveTo ? (
                                  <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-success-text bg-success-bg px-1.5 py-0.5 rounded">
                                    Current
                                  </span>
                                ) : null}
                              </td>
                              <td className="py-2.5 pr-3 font-semibold whitespace-nowrap">
                                {formatPrice(row.rate)}
                              </td>
                              <td className="py-2.5 pr-3 text-muted-foreground whitespace-nowrap">
                                {formatDate(row.effectiveFrom)}
                              </td>
                              <td className="py-2.5 text-muted-foreground whitespace-nowrap">
                                {row.effectiveTo
                                  ? formatDate(row.effectiveTo)
                                  : "Present"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
