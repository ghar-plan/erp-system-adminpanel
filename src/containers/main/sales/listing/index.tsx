import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Eye, Pencil, Trash2, ShoppingCart } from "lucide-react";
import useSales from "../useHooks";
import { Sale } from "@/utils/helpers/models/sales/sale.dto";
import { formatMoney } from "@/utils/helpers/models/purchases/purchase.dto";
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

interface SaleFilters {
  search: string;
  customerTypeId: string;
  page: number;
  limit: number;
}

const emptyFilters: SaleFilters = {
  search: "",
  customerTypeId: "",
  page: 1,
  limit: 10,
};

export default function SalesListing() {
  const { hasPermission } = usePermissions();
  const { getSales, deleteSale, getCustomerTypes } = useSales();
  const canView = hasPermission(PERMISSIONS.SALES_READ);
  const canUpdate = hasPermission(PERMISSIONS.SALES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.SALES_DELETE);
  const showActions = canView || canUpdate || canDelete;

  const [sales, setSales] = useState<Sale[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [customerTypes, setCustomerTypes] = useState<{ id: string; name: string }[]>([]);

  const [searchVal, setSearchVal] = useState("");
  const [filters, setFilters] = useState<SaleFilters>(emptyFilters);

  const fetchSales = (currentFilters: SaleFilters) => {
    const queryParams: any = {
      limit: currentFilters.limit,
      offset: (currentFilters.page - 1) * currentFilters.limit,
    };
    if (currentFilters.search) queryParams.search = currentFilters.search;
    if (currentFilters.customerTypeId)
      queryParams.customerTypeId = currentFilters.customerTypeId;

    getSales(setSales, queryParams, setTotalElements);
  };

  useEffect(() => {
    getCustomerTypes(setCustomerTypes);
    fetchSales({ ...emptyFilters, page: 1 });
  }, []);

  const handleApplyFilters = () => {
    const updatedFilters = { ...filters, search: searchVal, page: 1 };
    setFilters(updatedFilters);
    fetchSales(updatedFilters);
  };

  const handleResetFilters = () => {
    setSearchVal("");
    setFilters(emptyFilters);
    fetchSales(emptyFilters);
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    const nextPage = pageInfo.selected + 1;
    const updatedFilters = { ...filters, page: nextPage, limit: pageInfo.limit };
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
    "Product",
    "Quantity",
    "Rate",
    "Payment",
    "Balance",
    ...(showActions ? ["Actions"] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
            Sales
          </h1>
        </div>
        <Can permission={PERMISSIONS.SALES_CREATE}>
          <Link
            to="/sales/create"
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
              Total Sales
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
                      <td className="table-td">{sale?.productName || "--"}</td>
                      <td className="table-td">{sale?.quantity ?? "--"}</td>
                      <td className="table-td">{formatMoney(sale?.rate)}</td>
                      <td className="table-td">{formatMoney(sale?.payment)}</td>
                      <td className="table-td font-semibold">
                        {formatMoney(sale?.balance)}
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
