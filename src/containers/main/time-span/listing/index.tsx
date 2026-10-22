import React, { useEffect, useState } from "react";
import { Search, Save, Loader2, TimerReset, Infinity } from "lucide-react";
import useTimeSpan from "../useHooks";
import { GharplansProduct } from "@/utils/helpers/models/purchases/purchase.dto";
import {
  ProductLifespan,
  formatLifespanLabel,
} from "@/utils/helpers/models/product-lifespans/product-lifespan.dto";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { errorToaster } from "@/utils/helpers/common/alert-service";

type RowDraft = {
  years: string;
  months: string;
  days: string;
};

const emptyDraft = (): RowDraft => ({ years: "", months: "", days: "" });

const toPart = (value: string) => {
  if (!value.trim()) return 0;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
};

export default function TimeSpanListing() {
  const { getProducts, getLifespanMap, upsertLifespan, clearLifespan } =
    useTimeSpan();

  const [products, setProducts] = useState<GharplansProduct[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [lifespanMap, setLifespanMap] = useState<
    Record<string, ProductLifespan>
  >({});
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchVal, setSearchVal] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const loadLifespans = async () => {
    const map = await getLifespanMap();
    setLifespanMap(map);
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
          loadLifespans(),
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
        if (next[pid]) continue;
        const saved = lifespanMap[pid];
        next[pid] = {
          years: saved?.years ? String(saved.years) : "",
          months: saved?.months ? String(saved.months) : "",
          days: saved?.days ? String(saved.days) : "",
        };
      }
      return next;
    });
  }, [products, lifespanMap]);

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

  const updateDraft = (productId: string, patch: Partial<RowDraft>) => {
    setDrafts((prev) => ({
      ...prev,
      [productId]: {
        ...emptyDraft(),
        ...prev[productId],
        ...patch,
      },
    }));
  };

  const handleSave = async (product: GharplansProduct) => {
    const pid = String(product.id);
    const draft = drafts[pid] || emptyDraft();
    const years = toPart(draft.years);
    const months = toPart(draft.months);
    const days = toPart(draft.days);

    if (
      (draft.years && years <= 0) ||
      (draft.months && months <= 0) ||
      (draft.days && days <= 0)
    ) {
      errorToaster("Duration values must be whole numbers of at least 1");
      return;
    }

    setSavingId(pid);
    const ok = await upsertLifespan({
      productId: pid,
      productName: product.name,
      years,
      months,
      days,
    });
    setSavingId(null);

    if (ok) {
      await loadLifespans();
      setDrafts((prev) => ({
        ...prev,
        [pid]: {
          years: years ? String(years) : "",
          months: months ? String(months) : "",
          days: days ? String(days) : "",
        },
      }));
    }
  };

  const handleSetLifetime = async (product: GharplansProduct) => {
    const pid = String(product.id);
    setSavingId(pid);
    const existing = lifespanMap[pid];
    let ok = false;
    if (existing) {
      ok = await clearLifespan(pid);
    } else {
      ok = await upsertLifespan({
        productId: pid,
        productName: product.name,
        years: 0,
        months: 0,
        days: 0,
      });
    }
    setSavingId(null);
    if (ok) {
      setDrafts((prev) => ({ ...prev, [pid]: emptyDraft() }));
      await loadLifespans();
    }
  };

  return (
    <div className="space-y-6">
      <div className="animate-fade-in">
        <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
          Time Span
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Set life span as Years + Months + Days (e.g. 1 Year 3 Months 7 Days).
          Leave all empty for lifetime.
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
                    <th className="w-[32%] min-w-[220px] px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th className="w-[38%] min-w-[280px] px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      Duration (Y / M / D)
                    </th>
                    <th className="w-[14%] min-w-[140px] px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Status
                    </th>
                    <th className="w-[16%] min-w-[180px] px-4 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main bg-card text-foreground">
                  {products.map((product, index) => {
                    const pid = String(product.id);
                    const draft = drafts[pid] || emptyDraft();
                    const saved = lifespanMap[pid];
                    const statusLabel = formatLifespanLabel(
                      saved?.years,
                      saved?.months,
                      saved?.days,
                    );
                    const isLifetime = statusLabel === "Lifetime";
                    const isSaving = savingId === pid;

                    return (
                      <tr
                        key={pid}
                        className="hover:bg-muted-foreground/5 transition-colors align-top"
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
                          <div className="flex flex-wrap items-end gap-2">
                            {[
                              {
                                key: "years" as const,
                                label: "Years",
                                value: draft.years,
                              },
                              {
                                key: "months" as const,
                                label: "Months",
                                value: draft.months,
                              },
                              {
                                key: "days" as const,
                                label: "Days",
                                value: draft.days,
                              },
                            ].map((field) => (
                              <div key={field.key} className="flex flex-col gap-1">
                                <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                                  {field.label}
                                </span>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  pattern="[0-9]*"
                                  placeholder="0"
                                  value={field.value}
                                  onChange={(e) => {
                                    const cleaned = e.target.value.replace(
                                      /[^\d]/g,
                                      "",
                                    );
                                    updateDraft(pid, { [field.key]: cleaned });
                                  }}
                                  className="common-input text-sm h-9 w-[72px] text-center appearance-none"
                                />
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex max-w-full items-center gap-1.5 px-2.5 py-1 text-xs font-bold tracking-wide rounded-md whitespace-normal break-words ${
                              isLifetime
                                ? "bg-info-bg text-info-text border border-panel-border"
                                : "bg-warning-bg text-warning-text border border-panel-border"
                            }`}
                          >
                            {isLifetime ? (
                              <Infinity size={12} className="shrink-0" />
                            ) : (
                              <TimerReset size={12} className="shrink-0" />
                            )}
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <Can permission={PERMISSIONS.PRODUCT_LIFESPANS_UPDATE}>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => handleSave(product)}
                                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-primary text-white text-xs font-semibold hover:opacity-90 disabled:opacity-50 cursor-pointer"
                                title="Save time span"
                              >
                                {isSaving ? (
                                  <Loader2 size={14} className="animate-spin" />
                                ) : (
                                  <Save size={14} />
                                )}
                                Save
                              </button>
                              <button
                                type="button"
                                disabled={isSaving}
                                onClick={() => handleSetLifetime(product)}
                                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border-main bg-card text-foreground text-xs font-semibold hover:bg-muted-foreground/5 disabled:opacity-50 cursor-pointer"
                                title="Set as lifetime"
                              >
                                <Infinity size={14} />
                                Lifetime
                              </button>
                            </div>
                          </Can>
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
    </div>
  );
}
