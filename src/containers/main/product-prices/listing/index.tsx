import React, { useEffect, useState } from "react";
import {
  Search,
  Save,
  Loader2,
  History,
  X,
  Tag,
  Trash2,
} from "lucide-react";
import useProductPrices from "../useHooks";
import { GharplansProduct, formatMoney } from "@/utils/helpers/models/purchases/purchase.dto";
import {
  ProductPrice,
  ProductPriceHistory,
} from "@/utils/helpers/models/product-prices/product-price.dto";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { errorToaster } from "@/utils/helpers/common/alert-service";

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
  const { getProducts, getPriceMap, getHistory, upsertPrice, clearPrice } =
    useProductPrices();

  const [products, setProducts] = useState<GharplansProduct[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [priceMap, setPriceMap] = useState<Record<string, ProductPrice>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchVal, setSearchVal] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [historyProduct, setHistoryProduct] = useState<{
    id: string;
    name: string;
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
      for (const product of products) {
        const pid = String(product.id);
        if (next[pid] !== undefined) continue;
        const saved = priceMap[pid];
        next[pid] =
          saved?.rate != null && Number(saved.rate) > 0
            ? String(Math.round(Number(saved.rate)))
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

  const handleSave = async (product: GharplansProduct) => {
    const pid = String(product.id);
    const raw = (drafts[pid] || "").trim();
    const rate = Number(raw);
    if (!raw || !Number.isFinite(rate) || rate < 1) {
      errorToaster("Enter a per-item price of at least 1");
      return;
    }

    setSavingId(pid);
    const ok = await upsertPrice({
      productId: pid,
      productName: product.name,
      rate: Math.round(rate),
      effectiveFrom: today(),
    });
    setSavingId(null);

    if (ok) {
      await loadPrices();
      setDrafts((prev) => ({
        ...prev,
        [pid]: String(Math.round(rate)),
      }));
    }
  };

  const handleClear = async (product: GharplansProduct) => {
    const pid = String(product.id);
    if (!priceMap[pid]) return;
    setSavingId(pid);
    const ok = await clearPrice(pid);
    setSavingId(null);
    if (ok) {
      setDrafts((prev) => ({ ...prev, [pid]: "" }));
      await loadPrices();
    }
  };

  const openHistory = async (product: GharplansProduct) => {
    const pid = String(product.id);
    setHistoryProduct({ id: pid, name: product.name });
    setHistoryLoading(true);
    const rows = await getHistory(pid);
    setHistoryRows(rows);
    setHistoryLoading(false);
  };

  const closeHistory = () => {
    setHistoryProduct(null);
    setHistoryRows([]);
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
          Product Prices
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Set the per-item purchase price for each product. When staff records a
          purchase, that price is saved on the purchase. Changing a price later
          only applies to new purchases — older stock keeps the previous price.
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
        ) : products.length > 0 ? (
          <div className="bg-card rounded-xl border border-border-main overflow-hidden shadow-xs animate-slide-up">
            <div className="overflow-x-auto">
              <table className="min-w-full table-fixed divide-y divide-border-main">
                <thead className="bg-muted-foreground/5">
                  <tr className="text-left">
                    <th className="w-16 px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Sr
                    </th>
                    <th className="w-[40%] min-w-[220px] px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th className="w-[18%] min-w-[140px] px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Per Item
                    </th>
                    <th className="w-[16%] min-w-[120px] px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Effective From
                    </th>
                    <th className="w-[26%] min-w-[200px] px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main bg-card text-foreground">
                  {products.map((product, index) => {
                    const pid = String(product.id);
                    const draft = drafts[pid] ?? "";
                    const saved = priceMap[pid];
                    const isSaving = savingId === pid;

                    return (
                      <tr
                        key={pid}
                        className="hover:bg-muted-foreground/5 transition-colors align-middle"
                      >
                        <td className="px-4 py-4 text-sm whitespace-nowrap">
                          {(page - 1) * limit + index + 1}
                        </td>
                        <td className="px-4 py-4">
                          <p
                            className="text-sm font-semibold text-foreground leading-snug break-words whitespace-normal"
                            title={product.name}
                          >
                            {product.name}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <input
                            type="number"
                            step="1"
                            min="1"
                            placeholder="e.g. 2000"
                            value={draft}
                            onChange={(e) =>
                              setDrafts((prev) => ({
                                ...prev,
                                [pid]: e.target.value.replace(/[^\d]/g, ""),
                              }))
                            }
                            className="common-input text-sm h-9 w-full max-w-[140px]"
                          />
                        </td>
                        <td className="px-4 py-4 text-sm text-muted-foreground whitespace-nowrap">
                          {saved ? formatDate(saved.effectiveFrom) : "—"}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <Can permission={PERMISSIONS.PRODUCT_PRICES_UPDATE}>
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => handleSave(product)}
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
                              {saved ? (
                                <button
                                  type="button"
                                  disabled={isSaving}
                                  onClick={() => handleClear(product)}
                                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border-main bg-card text-foreground text-xs font-semibold hover:bg-muted-foreground/5 disabled:opacity-50 cursor-pointer"
                                  title="Remove current price"
                                >
                                  <Trash2 size={14} />
                                  Clear
                                </button>
                              ) : null}
                            </Can>
                            <button
                              type="button"
                              onClick={() => openHistory(product)}
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

      {historyProduct ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={closeHistory}
          />
          <div className="bg-card border border-border-main w-full max-w-lg rounded-2xl shadow-xl overflow-hidden z-10 animate-scale-up relative">
            <div className="px-6 py-4 border-b border-border-main flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Tag size={18} className="text-primary" />
                  Price History
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5 break-words">
                  {historyProduct.name}
                </p>
              </div>
              <button
                type="button"
                onClick={closeHistory}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted-foreground/5 cursor-pointer"
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
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs font-bold text-muted-foreground uppercase tracking-wider border-b border-border-main">
                      <th className="pb-2 pr-3">Per Item</th>
                      <th className="pb-2 pr-3">From</th>
                      <th className="pb-2">To</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main">
                    {historyRows.map((row) => (
                      <tr key={row.id}>
                        <td className="py-2.5 pr-3 font-semibold">
                          {formatMoney(row.rate)}
                          {!row.effectiveTo ? (
                            <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-success-text bg-success-bg px-1.5 py-0.5 rounded">
                              Current
                            </span>
                          ) : null}
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
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
