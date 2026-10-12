import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Pencil, Trash2, Tags } from "lucide-react";
import useCustomerTypes from "../useHooks";
import {
  CustomerType,
  CustomerTypeCategory,
  CUSTOMER_TYPE_CATEGORY_OPTIONS,
  customerTypeCategoryLabel,
  getCustomerTypeCategoryBadgeClass,
} from "@/utils/helpers/models/customer-types/customer-type.dto";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";

interface PickupPoint {
  id: string | number;
  name: string;
}

interface CustomerTypeFilters {
  search: string;
  category: string;
  page: number;
  limit: number;
}

const emptyFilters: CustomerTypeFilters = {
  search: "",
  category: "",
  page: 1,
  limit: 10,
};

export default function CustomerTypesListing() {
  const { hasPermission } = usePermissions();
  const {
    getCustomerTypes,
    getAllCustomerTypes,
    getPickupPoints,
    deleteCustomerType,
  } = useCustomerTypes();
  const canUpdate = hasPermission(PERMISSIONS.CUSTOMER_TYPES_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.CUSTOMER_TYPES_DELETE);
  const showActions = canUpdate || canDelete;

  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);
  const [allCustomerTypes, setAllCustomerTypes] = useState<CustomerType[]>([]);
  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [totalElements, setTotalElements] = useState(0);

  const [searchVal, setSearchVal] = useState("");
  const [filters, setFilters] = useState<CustomerTypeFilters>(emptyFilters);

  const fetchCustomerTypes = (currentFilters: CustomerTypeFilters) => {
    const queryParams: any = {
      limit: currentFilters.limit,
      offset: (currentFilters.page - 1) * currentFilters.limit,
    };
    if (currentFilters.search) queryParams.search = currentFilters.search;
    if (currentFilters.category) queryParams.category = currentFilters.category;

    getCustomerTypes(setCustomerTypes, queryParams, setTotalElements);
  };

  const refreshCreateEligibility = () => {
    getAllCustomerTypes(setAllCustomerTypes);
    getPickupPoints(setPickupPoints);
  };

  useEffect(() => {
    fetchCustomerTypes({ ...emptyFilters, page: 1 });
    refreshCreateEligibility();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showCreateButton = useMemo(() => {
    const hasCustomer = allCustomerTypes.some(
      (ct) => ct.category === CustomerTypeCategory.CUSTOMER,
    );
    const hasGpConstruction = allCustomerTypes.some(
      (ct) => ct.category === CustomerTypeCategory.GP_CONSTRUCTION,
    );
    const usedPickupIds = new Set(
      allCustomerTypes
        .filter(
          (ct) =>
            ct.category === CustomerTypeCategory.PICKUP_POINT &&
            ct.pickupPointId,
        )
        .map((ct) => String(ct.pickupPointId)),
    );
    const hasUnlinkedPickupPoint = pickupPoints.some(
      (pp) => !usedPickupIds.has(String(pp.id)),
    );

    return !hasCustomer || !hasGpConstruction || hasUnlinkedPickupPoint;
  }, [allCustomerTypes, pickupPoints]);

  const handleApplyFilters = () => {
    const updatedFilters = { ...filters, search: searchVal, page: 1 };
    setFilters(updatedFilters);
    fetchCustomerTypes(updatedFilters);
  };

  const handleResetFilters = () => {
    setSearchVal("");
    setFilters(emptyFilters);
    fetchCustomerTypes(emptyFilters);
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    const nextPage = pageInfo.selected + 1;
    const updatedFilters = { ...filters, page: nextPage, limit: pageInfo.limit };
    setFilters(updatedFilters);
    fetchCustomerTypes(updatedFilters);
  };

  const handleDelete = async (id: string, name: string) => {
    await deleteCustomerType(id, name, () => {
      fetchCustomerTypes(filters);
      refreshCreateEligibility();
    });
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
    "Name",
    "Category",
    "Pickup Point",
    "Created",
    ...(showActions ? ["Actions"] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
            Customer Types
          </h1>
        </div>
        {showCreateButton ? (
          <Can permission={PERMISSIONS.CUSTOMER_TYPES_CREATE}>
            <Link
              to="/customer-types/create"
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap text-sm"
            >
              <Plus size={18} />
              Create Customer Type
            </Link>
          </Can>
        ) : null}
      </div>

      {/* Stats */}
      <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-6 animate-fade-in">
        <div className="bg-card border border-border-main p-4 rounded-xl shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Tags size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">
              Total Customer Types
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
              placeholder="Search by name..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="common-input pl-10 pr-4 text-sm h-10 w-full"
            />
          </div>
        </div>

        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label htmlFor="category" className="text-xs text-foreground font-medium whitespace-nowrap">
            Category
          </label>
          <select
            id="category"
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
            className="common-input text-sm h-10 w-full sm:w-48 bg-card"
          >
            <option value="">All Categories</option>
            {CUSTOMER_TYPE_CATEGORY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
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
        {customerTypes.length > 0 ? (
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
                  {customerTypes.map((customerType, index) => (
                    <tr key={customerType.id} className="hover:bg-muted-foreground/5 transition-colors">
                      <td className="table-td">
                        {(filters.page - 1) * filters.limit + index + 1}
                      </td>
                      <td className="table-td font-semibold text-foreground">
                        {customerType?.name || "--"}
                      </td>
                      <td className="table-td">
                        <span
                          className={`px-2.5 py-1 text-xs font-bold tracking-wide rounded-md ${getCustomerTypeCategoryBadgeClass(customerType?.category)}`}
                        >
                          {customerTypeCategoryLabel(customerType?.category)}
                        </span>
                      </td>
                      <td className="table-td">
                        {customerType?.pickupPointName || "--"}
                      </td>
                      <td className="table-td">
                        {formatDate(customerType?.created_at)}
                      </td>
                      {showActions ? (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {canUpdate ? (
                              <Link
                                to={`/customer-types/edit/${customerType.id}`}
                                className="btn-action-edit"
                                title="Edit Customer Type"
                              >
                                <Pencil size={16} />
                              </Link>
                            ) : null}
                            {canDelete ? (
                              <button
                                onClick={() => handleDelete(customerType.id, customerType.name)}
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
