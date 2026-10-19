import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Eye, Pencil, Trash2, ShoppingBag } from "lucide-react";
import usePurchases from "../useHooks";
import { Purchase, formatMoney, SOURCE_PAYMENT_OPTIONS } from "@/utils/helpers/models/purchases/purchase.dto";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";

interface PurchaseFilters {
  search: string;
  sourcePayment: string;
  page: number;
  limit: number;
}

const emptyFilters: PurchaseFilters = {
  search: "",
  sourcePayment: "",
  page: 1,
  limit: 10,
};

export default function PurchasesListing() {
  const { hasPermission } = usePermissions();
  const { getPurchases, deletePurchase } = usePurchases();
  const canView = hasPermission(PERMISSIONS.PURCHASES_READ);
  const canUpdate = hasPermission(PERMISSIONS.PURCHASES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.PURCHASES_DELETE);
  const showActions = canView || canUpdate || canDelete;

  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [totalElements, setTotalElements] = useState(0);

  const [searchVal, setSearchVal] = useState("");
  const [filters, setFilters] = useState<PurchaseFilters>(emptyFilters);

  const fetchPurchases = (currentFilters: PurchaseFilters) => {
    const queryParams: any = {
      limit: currentFilters.limit,
      offset: (currentFilters.page - 1) * currentFilters.limit,
    };
    if (currentFilters.search) queryParams.search = currentFilters.search;
    if (currentFilters.sourcePayment)
      queryParams.sourcePayment = currentFilters.sourcePayment;

    getPurchases(setPurchases, queryParams, setTotalElements);
  };

  useEffect(() => {
    fetchPurchases({ ...emptyFilters, page: 1 });
  }, []);

  const handleApplyFilters = () => {
    const updatedFilters = { ...filters, search: searchVal, page: 1 };
    setFilters(updatedFilters);
    fetchPurchases(updatedFilters);
  };

  const handleResetFilters = () => {
    setSearchVal("");
    setFilters(emptyFilters);
    fetchPurchases(emptyFilters);
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    const nextPage = pageInfo.selected + 1;
    const updatedFilters = { ...filters, page: nextPage, limit: pageInfo.limit };
    setFilters(updatedFilters);
    fetchPurchases(updatedFilters);
  };

  const handleDelete = async (id: string, name: string) => {
    await deletePurchase(id, name, () => fetchPurchases(filters));
  };

  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return "--";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return "--";
    }
  };

  const getSourceBadgeClass = (source: string) => {
    switch (source) {
      case "Cash":
        return "bg-success-bg text-success-text border border-panel-border";
      case "Credit":
        return "bg-danger-bg text-danger-text border border-panel-border";
      case "Partial":
        return "bg-warning-bg text-warning-text border border-panel-border";
      case "Advance":
        return "bg-info-bg text-info-text border border-panel-border";
      default:
        return "bg-panel-bg text-muted-foreground border border-panel-border";
    }
  };

  const columns = [
    "Sr No.",
    "Supplier",
    "Product",
    "Quantity",
    "Per Item",
    "Price",
    "Source",
    "Date",
    ...(showActions ? ["Actions"] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
            Purchases
          </h1>
        </div>
        <Can permission={PERMISSIONS.PURCHASES_CREATE}>
          <Link
            to="/purchases/create"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap text-sm"
          >
            <Plus size={18} />
            Record Purchase
          </Link>
        </Can>
      </div>

      {/* Stats */}
      <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-6 animate-fade-in">
        <div className="bg-card border border-border-main p-4 rounded-xl shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">
              Total Purchases
            </span>
            <span className="text-xl font-bold text-foreground mt-0.5 block">
              {totalElements}
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-muted-foreground/5 border border-border-main p-4 rounded-xl animate-fade-in shadow-xs flex flex-wrap items-end justify-start md:justify-end gap-3 w-full">
        <div className="flex flex-col items-start gap-1 w-full sm:max-w-sm flex-1 md:max-w-md min-w-[260px]">
          <label htmlFor="search" className="text-xs text-foreground font-medium whitespace-nowrap">
            Search
          </label>
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground/80" size={16} />
            <input
              type="search"
              placeholder="Search by supplier or product..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="common-input pl-10 pr-4 text-sm h-10 w-full"
            />
          </div>
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label htmlFor="sourcePayment" className="text-xs text-foreground font-medium whitespace-nowrap">
            Source Payment
          </label>
          <select
            id="sourcePayment"
            value={filters.sourcePayment}
            onChange={(e) => setFilters((prev) => ({ ...prev, sourcePayment: e.target.value }))}
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

      {/* Table */}
      <div className="w-full flex flex-col gap-4">
        {purchases.length > 0 ? (
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
                  {purchases.map((purchase, index) => (
                    <tr key={purchase.id} className="hover:bg-muted-foreground/5 transition-colors">
                      <td className="table-td">
                        {(filters.page - 1) * filters.limit + index + 1}
                      </td>
                      <td className="table-td font-semibold text-foreground">
                        {purchase?.supplierName || "--"}
                      </td>
                      <td className="table-td">{purchase?.productName || "--"}</td>
                      <td className="table-td">{purchase?.quantity ?? "--"}</td>
                      <td className="table-td">{formatMoney(purchase?.rate)}</td>
                      <td className="table-td">{formatMoney(purchase?.paymentMade)}</td>
                      <td className="table-td">
                        <span
                          className={`px-2.5 py-1 text-xs font-bold tracking-wide rounded-md ${getSourceBadgeClass(purchase?.sourcePayment || "")}`}
                        >
                          {purchase?.sourcePayment || "--"}
                        </span>
                      </td>
                      <td className="table-td">{formatDate(purchase?.date)}</td>
                      {showActions ? (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {canView ? (
                              <Link
                                to={`/purchases/view/${purchase.id}`}
                                className="btn-action-view"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </Link>
                            ) : null}
                            {canUpdate ? (
                              <Link
                                to={`/purchases/edit/${purchase.id}`}
                                className="btn-action-edit"
                                title="Edit Purchase"
                              >
                                <Pencil size={16} />
                              </Link>
                            ) : null}
                            {canDelete ? (
                              <button
                                onClick={() => handleDelete(purchase.id, purchase.supplierName)}
                                className="btn-action-delete"
                                title="Delete"
                              >
                                <Trash2 size={16} />
                              </button>
                            ) : null}
                          </div>
                        </td>
                      ) : null}
                    </tr>
                  ))}
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
