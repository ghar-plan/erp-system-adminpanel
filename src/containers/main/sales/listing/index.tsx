import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search, Eye, Pencil, Trash2, ShoppingCart } from "lucide-react";
import useSales from "../useHooks";
import {
  Sale,
  computeSaleSubtotal,
  formatSaleProductsLabel,
} from "@/utils/helpers/models/sales/sale.dto";
import {
  formatMoney,
  SOURCE_PAYMENT_OPTIONS,
  CashOutPaymentSource,
} from "@/utils/helpers/models/purchases/purchase.dto";
import {
  customerTypeCategoryLabel,
  WALK_IN_CUSTOMER_TYPE,
  WALK_IN_CUSTOMER_TYPE_ID,
} from "@/utils/helpers/models/customer-types/customer-type.dto";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import { isErpAdminEmail } from "@/utils/helpers/permissions/erp-admin-access";
import useStore from "@/hooks/useStore";

interface SaleFilters {
  search: string;
  customerTypeId: string;
  sourcePayment: string;
  outstandingOnly: boolean;
  startDate: string;
  endDate: string;
  page: number;
  limit: number;
}

const emptyFilters: SaleFilters = {
  search: "",
  customerTypeId: "",
  sourcePayment: "",
  outstandingOnly: false,
  startDate: "",
  endDate: "",
  page: 1,
  limit: 10,
};

const filtersFromSearchParams = (searchParams: URLSearchParams): SaleFilters => ({
  ...emptyFilters,
  sourcePayment: searchParams.get("sourcePayment") || "",
  outstandingOnly:
    searchParams.get("outstandingOnly") === "true" ||
    searchParams.get("outstandingOnly") === "1",
  startDate: searchParams.get("startDate") || "",
  endDate: searchParams.get("endDate") || "",
  customerTypeId: searchParams.get("customerTypeId") || "",
  page: 1,
});

export default function SalesListing() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermission } = usePermissions();
  const { getUser } = useStore();
  const { getSales, deleteSale, getCustomerTypes } = useSales();
  const canView = hasPermission(PERMISSIONS.SALES_READ);
  const canUpdate = hasPermission(PERMISSIONS.SALES_UPDATE);
  const canDelete =
    hasPermission(PERMISSIONS.SALES_DELETE) &&
    isErpAdminEmail(getUser()?.email);
  const showActions = canView || canUpdate || canDelete;

  const [sales, setSales] = useState<Sale[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [customerTypes, setCustomerTypes] = useState<{ id: string; name: string }[]>([]);

  const [searchVal, setSearchVal] = useState("");
  const [filters, setFilters] = useState<SaleFilters>(() =>
    filtersFromSearchParams(searchParams),
  );

  const syncUrl = (next: SaleFilters) => {
    const params = new URLSearchParams();
    if (next.sourcePayment) params.set("sourcePayment", next.sourcePayment);
    if (next.outstandingOnly) params.set("outstandingOnly", "true");
    if (next.startDate) params.set("startDate", next.startDate);
    if (next.endDate) params.set("endDate", next.endDate);
    if (next.customerTypeId) params.set("customerTypeId", next.customerTypeId);
    setSearchParams(params, { replace: true });
  };

  const fetchSales = (currentFilters: SaleFilters) => {
    const queryParams: any = {
      limit: currentFilters.limit,
      offset: (currentFilters.page - 1) * currentFilters.limit,
    };
    if (currentFilters.search) queryParams.search = currentFilters.search;
    if (currentFilters.customerTypeId)
      queryParams.customerTypeId = currentFilters.customerTypeId;
    if (currentFilters.sourcePayment)
      queryParams.sourcePayment = currentFilters.sourcePayment;
    if (currentFilters.outstandingOnly) queryParams.outstandingOnly = "true";
    if (currentFilters.startDate) queryParams.startDate = currentFilters.startDate;
    if (currentFilters.endDate) queryParams.endDate = currentFilters.endDate;

    getSales(setSales, queryParams, setTotalElements);
  };

  useEffect(() => {
    getCustomerTypes(setCustomerTypes);
    const initial = filtersFromSearchParams(searchParams);
    setFilters(initial);
    fetchSales(initial);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (next: SaleFilters) => {
    setFilters(next);
    syncUrl(next);
    fetchSales(next);
  };

  const handleApplyFilters = () => {
    applyFilters({ ...filters, search: searchVal, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchVal("");
    applyFilters({ ...emptyFilters });
  };

  const applyQuickFilter = (patch: Partial<SaleFilters>) => {
    applyFilters({ ...filters, ...patch, search: searchVal, page: 1 });
  };

  const getSourceBadgeClass = (source: string) => {
    switch (source) {
      case CashOutPaymentSource.CASH:
        return "bg-success-bg text-success-text border border-panel-border";
      case CashOutPaymentSource.CREDIT:
        return "bg-danger-bg text-danger-text border border-panel-border";
      case CashOutPaymentSource.PARTIAL:
        return "bg-warning-bg text-warning-text border border-panel-border";
      case CashOutPaymentSource.ADVANCE:
        return "bg-info-bg text-info-text border border-panel-border";
      default:
        return "bg-panel-bg text-muted-foreground border border-panel-border";
    }
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    const nextPage = pageInfo.selected + 1;
    const updatedFilters = {
      ...filters,
      search: searchVal,
      page: nextPage,
      limit: pageInfo.limit,
    };
    setFilters(updatedFilters);
    fetchSales(updatedFilters);
  };

  const handleDelete = async (id: string, name: string) => {
    await deleteSale(id, name, () => fetchSales(filters));
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

  const columns = [
    "Sr No.",
    "Date",
    "Customer Type",
    "Customer Name",
    "Products",
    "Qty",
    "Amount",
    "Payment",
    "Balance",
    "Source",
    ...(showActions ? ["Actions"] : []),
  ];

  const isCreditQuick =
    filters.sourcePayment === CashOutPaymentSource.CREDIT &&
    !filters.outstandingOnly;
  const isOutstandingQuick = filters.outstandingOnly;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
            Sales
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Filter credit and outstanding dues to follow up regularly.
          </p>
        </div>
        <Can permission={PERMISSIONS.SALES_CREATE}>
          <Link
            to={siteRoutes.sales}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap text-sm"
          >
            <Plus size={18} />
            Record Sale
          </Link>
        </Can>
      </div>

      {/* Stats */}
      <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-6 animate-fade-in">
        <div className="bg-card border border-border-main p-4 rounded-xl shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <ShoppingCart size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">
              Matching Sales
            </span>
            <span className="text-xl font-bold text-foreground mt-0.5 block">
              {totalElements}
            </span>
          </div>
        </div>
      </div>

      {/* Quick follow-up chips */}
      <div className="flex flex-wrap items-center gap-2 animate-fade-in">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
          Quick:
        </span>
        <button
          type="button"
          onClick={() =>
            applyQuickFilter({
              sourcePayment: CashOutPaymentSource.CREDIT,
              outstandingOnly: false,
            })
          }
          className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all cursor-pointer ${
            isCreditQuick
              ? "bg-danger-bg text-danger-text border-panel-border"
              : "bg-card text-foreground border-border-main hover:bg-muted-foreground/5"
          }`}
        >
          Credit Sales
        </button>
        <button
          type="button"
          onClick={() =>
            applyQuickFilter({
              outstandingOnly: true,
              sourcePayment: "",
            })
          }
          className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all cursor-pointer ${
            isOutstandingQuick
              ? "bg-warning-bg text-warning-text border-panel-border"
              : "bg-card text-foreground border-border-main hover:bg-muted-foreground/5"
          }`}
        >
          Outstanding Balance
        </button>
        <button
          type="button"
          onClick={() =>
            applyQuickFilter({
              sourcePayment: CashOutPaymentSource.PARTIAL,
              outstandingOnly: false,
            })
          }
          className={`px-3 py-1.5 rounded-md text-xs font-bold border transition-all cursor-pointer ${
            filters.sourcePayment === CashOutPaymentSource.PARTIAL &&
            !filters.outstandingOnly
              ? "bg-warning-bg text-warning-text border-panel-border"
              : "bg-card text-foreground border-border-main hover:bg-muted-foreground/5"
          }`}
        >
          Partial Payments
        </button>
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
              placeholder="Search by customer or product..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="common-input pl-10 pr-4 text-sm h-10 w-full"
            />
          </div>
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[190px]">
          <label htmlFor="customerTypeId" className="text-xs text-foreground font-medium whitespace-nowrap">
            Customer Type
          </label>
          <select
            id="customerTypeId"
            value={filters.customerTypeId}
            onChange={(e) => setFilters((prev) => ({ ...prev, customerTypeId: e.target.value }))}
            className="common-input text-sm h-10 w-full sm:w-52 bg-card"
          >
            <option value="">All Customer Types</option>
            <option value={WALK_IN_CUSTOMER_TYPE.id}>
              {WALK_IN_CUSTOMER_TYPE.name}
            </option>
            {customerTypes
              .filter((ct: any) => String(ct.id) !== WALK_IN_CUSTOMER_TYPE_ID)
              .map((ct: any) => (
                <option key={ct.id} value={ct.id}>
                  {ct.name} ({customerTypeCategoryLabel(ct.category)})
                </option>
              ))}
          </select>
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label htmlFor="sourcePayment" className="text-xs text-foreground font-medium whitespace-nowrap">
            Payment Source
          </label>
          <select
            id="sourcePayment"
            value={filters.sourcePayment}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, sourcePayment: e.target.value }))
            }
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

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label htmlFor="outstandingOnly" className="text-xs text-foreground font-medium whitespace-nowrap">
            Balance Status
          </label>
          <select
            id="outstandingOnly"
            value={filters.outstandingOnly ? "outstanding" : ""}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                outstandingOnly: e.target.value === "outstanding",
              }))
            }
            className="common-input text-sm h-10 w-full sm:w-44 bg-card"
          >
            <option value="">All Balances</option>
            <option value="outstanding">Outstanding only</option>
          </select>
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[150px]">
          <label htmlFor="startDate" className="text-xs text-foreground font-medium">
            From
          </label>
          <input
            id="startDate"
            type="date"
            value={filters.startDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, startDate: e.target.value }))
            }
            className="common-input text-sm h-10 w-full sm:w-40 bg-card"
          />
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[150px]">
          <label htmlFor="endDate" className="text-xs text-foreground font-medium">
            To
          </label>
          <input
            id="endDate"
            type="date"
            value={filters.endDate}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, endDate: e.target.value }))
            }
            className="common-input text-sm h-10 w-full sm:w-40 bg-card"
          />
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
        {sales.length > 0 ? (
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
                  {sales.map((sale, index) => (
                    <tr key={sale.id} className="hover:bg-muted-foreground/5 transition-colors">
                      <td className="table-td">
                        {(filters.page - 1) * filters.limit + index + 1}
                      </td>
                      <td className="table-td">{formatDate(sale?.date)}</td>
                      <td className="table-td font-semibold text-foreground">
                        {sale?.customerType?.name || "--"}
                      </td>
                      <td className="table-td">{sale?.customerName || "--"}</td>
                      <td className="table-td max-w-[260px]">
                        <span className="line-clamp-2" title={formatSaleProductsLabel(sale)}>
                          {formatSaleProductsLabel(sale)}
                        </span>
                      </td>
                      <td className="table-td">{sale?.quantity ?? "--"}</td>
                      <td className="table-td">
                        {formatMoney(
                          sale?.items?.length
                            ? computeSaleSubtotal(sale.items)
                            : Number(sale?.payment || 0) +
                                Number(sale?.balance || 0),
                        )}
                      </td>
                      <td className="table-td">{formatMoney(sale?.payment)}</td>
                      <td className="table-td font-semibold">
                        {formatMoney(sale?.balance)}
                      </td>
                      <td className="table-td">
                        <span
                          className={`px-2.5 py-1 text-xs font-bold tracking-wide rounded-md ${getSourceBadgeClass(
                            sale?.sourcePayment || "",
                          )}`}
                        >
                          {sale?.sourcePayment || "--"}
                        </span>
                      </td>
                      {showActions ? (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {canView ? (
                              <Link
                                to={`/sales/view/${sale.id}`}
                                className="btn-action-view"
                                title="View Details"
                              >
                                <Eye size={16} />
                              </Link>
                            ) : null}
                            {canUpdate ? (
                              <Link
                                to={`/sales/edit/${sale.id}`}
                                className="btn-action-edit"
                                title="Edit Sale"
                              >
                                <Pencil size={16} />
                              </Link>
                            ) : null}
                            {canDelete ? (
                              <button
                                onClick={() => handleDelete(sale.id, sale.customerName || sale.productName)}
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
