import React, { useEffect, useState } from "react";
import { Search, Package, Boxes } from "lucide-react";
import useStocks from "../useHooks";
import { Stock } from "@/utils/helpers/models/stocks/stock.dto";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";

interface StockFilters {
  search: string;
  page: number;
  limit: number;
}

const emptyFilters: StockFilters = {
  search: "",
  page: 1,
  limit: 10,
};

export default function StocksListing() {
  const { getStocks } = useStocks();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [searchVal, setSearchVal] = useState("");
  const [filters, setFilters] = useState<StockFilters>(emptyFilters);

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
    fetchStocks(updatedFilters);
  };

  const handleResetFilters = () => {
    setSearchVal("");
    setFilters(emptyFilters);
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
    fetchStocks(updatedFilters);
  };

  const formatQty = (value?: number | string | null) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return "--";
    return n.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const columns = [
    "Sr No.",
    "Product",
    "Available",
    "Total Purchased",
    "Total Sold",
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
            Stock
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track available quantity from purchases and sales.
          </p>
        </div>
      </div>

      <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 animate-fade-in">
        <div className="bg-card border border-border-main p-4 rounded-xl shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Package size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">
              Products in Stock
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
              Tip
            </span>
            <span className="text-sm font-semibold text-foreground mt-0.5 block">
              Purchases add stock · Sales reduce stock
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
              placeholder="Search by product name or ID..."
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
        {stocks.length > 0 ? (
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
                  {stocks.map((item, index) => {
                    const available = Number(item.quantity);
                    const lowStock = available <= 0;
                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-muted-foreground/5 transition-colors"
                      >
                        <td className="table-td">
                          {(filters.page - 1) * filters.limit + index + 1}
                        </td>
                        <td className="table-td font-semibold text-foreground">
                          {item.productName || "--"}
                        </td>
                        <td className="table-td">
                          <span
                            className={`px-2.5 py-1 text-xs font-bold tracking-wide rounded-md ${
                              lowStock
                                ? "bg-danger-bg text-danger-text border border-panel-border"
                                : "bg-success-bg text-success-text border border-panel-border"
                            }`}
                          >
                            {formatQty(available)}
                          </span>
                        </td>
                        <td className="table-td">
                          {formatQty(item.totalPurchased)}
                        </td>
                        <td className="table-td">
                          {formatQty(item.totalSold)}
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
