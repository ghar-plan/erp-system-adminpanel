import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2, Search, X } from "lucide-react";

export interface ProductSearchOption {
  id: string | number;
  name: string;
}

const PAGE_SIZE = 50;

interface ProductSearchSelectProps {
  value: string;
  /** Shown on the closed control when `value` is set but the option is not in the current list */
  selectedName?: string;
  onSelect: (productId: string, productName: string) => void;
  onLoad: (params: {
    name?: string;
    limit?: number;
    offset?: number;
  }) => Promise<{ products: ProductSearchOption[]; total: number }>;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  error?: string;
  disabled?: boolean;
}

export default function ProductSearchSelect({
  value,
  selectedName,
  onSelect,
  onLoad,
  placeholder = "Select a product",
  searchPlaceholder = "Type to search products...",
  emptyText = "No products found",
  error,
  disabled = false,
}: ProductSearchSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const loadingMoreRef = useRef(false);
  const requestIdRef = useRef(0);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<ProductSearchOption[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const hasMore = products.length < total;

  const selectedFromList = useMemo(
    () => products.find((p) => String(p.id) === String(value)) || null,
    [products, value],
  );

  const displayLabel =
    selectedFromList?.name ||
    (value && selectedName ? selectedName : "") ||
    "";

  const fetchPage = async (name: string, offset: number, append: boolean) => {
    const requestId = ++requestIdRef.current;
    if (append) {
      if (loadingMoreRef.current) return;
      loadingMoreRef.current = true;
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const result = await onLoad({
        name: name.trim() || undefined,
        limit: PAGE_SIZE,
        offset,
      });
      if (requestId !== requestIdRef.current) return;

      setTotal(result.total ?? 0);
      setProducts((prev) => {
        if (!append) return result.products || [];
        const seen = new Set(prev.map((p) => String(p.id)));
        const next = (result.products || []).filter(
          (p) => !seen.has(String(p.id)),
        );
        return [...prev, ...next];
      });
    } catch {
      if (requestId !== requestIdRef.current) return;
      if (!append) {
        setProducts([]);
        setTotal(0);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        if (append) {
          loadingMoreRef.current = false;
          setLoadingMore(false);
        } else {
          setLoading(false);
        }
      }
    }
  };

  const resetAndLoad = (name: string) => {
    setProducts([]);
    setTotal(0);
    fetchPage(name, 0, false);
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    resetAndLoad(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      resetAndLoad(query);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleListScroll = () => {
    const el = listRef.current;
    if (!el || !hasMore || loading || loadingMore || loadingMoreRef.current) {
      return;
    }
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 48;
    if (nearBottom) {
      fetchPage(query, products.length, true);
    }
  };

  const handleSelect = (product: ProductSearchOption) => {
    onSelect(String(product.id), product.name);
    setOpen(false);
    setQuery("");
  };

  const clearSelection = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect("", "");
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => !prev);
          if (!open) setQuery("");
        }}
        className={`common-input w-full flex items-center justify-between gap-2 text-left cursor-pointer min-h-[42px] ${
          error ? "border-red-500 focus:border-red-500" : ""
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span
          className={`truncate flex-1 ${
            displayLabel ? "text-foreground" : "text-muted-foreground"
          }`}
          title={displayLabel || undefined}
        >
          {displayLabel || placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0 text-muted-foreground">
          {value ? (
            <span
              role="button"
              tabIndex={0}
              onClick={clearSelection}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  clearSelection(e as unknown as React.MouseEvent);
                }
              }}
              className="p-0.5 rounded hover:bg-muted-foreground/10"
              title="Clear"
            >
              <X size={14} />
            </span>
          ) : null}
          <ChevronDown
            size={16}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open ? (
        <div className="absolute z-40 mt-1 w-full rounded-md border border-border-main bg-card shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border-main">
            <Search size={14} className="text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
            />
            {loading ? (
              <Loader2
                size={14}
                className="animate-spin text-muted-foreground shrink-0"
              />
            ) : null}
          </div>
          <div
            ref={listRef}
            className="max-h-60 overflow-y-auto"
            onScroll={handleListScroll}
          >
            {!loading && products.length === 0 ? (
              <p className="px-3 py-3 text-sm text-muted-foreground">
                {emptyText}
              </p>
            ) : (
              <>
                {products.map((product) => {
                  const isActive = String(product.id) === String(value);
                  return (
                    <button
                      key={String(product.id)}
                      type="button"
                      onClick={() => handleSelect(product)}
                      className={`w-full px-3 py-2.5 text-left text-sm transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-foreground hover:bg-muted-foreground/5"
                      }`}
                      title={product.name}
                    >
                      <span className="line-clamp-2">{product.name}</span>
                    </button>
                  );
                })}
                {loadingMore ? (
                  <div className="flex items-center justify-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                    <Loader2 size={14} className="animate-spin" />
                    Loading more...
                  </div>
                ) : null}
                {!loading && !loadingMore && hasMore ? (
                  <p className="px-3 py-2 text-center text-[11px] text-muted-foreground">
                    Scroll for more products
                  </p>
                ) : null}
                {!loading && !loadingMore && products.length > 0 && !hasMore ? (
                  <p className="px-3 py-2 text-center text-[11px] text-muted-foreground">
                    Showing all {products.length} products
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-1 text-xs text-danger-text font-semibold">{error}</p>
      ) : null}
    </div>
  );
}
