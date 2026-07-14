import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search, Trash2, Eye, Users, Pencil } from "lucide-react";
import useVendors from "../useHooks";
import { Vendor } from "@/utils/helpers/models/vendors/vendor.dto";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";

interface VendorFilters {
  search: string;
  vendorType: string;
  city: string;
  page: number;
  limit: number;
}

export default function VendorListing() {
  const navigate = useNavigate();
  const { getVendors, deleteVendor } = useVendors();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [totalElements, setTotalElements] = useState(0);

  const [searchVal, setSearchVal] = useState("");

  // Filters State
  const [filters, setFilters] = useState<VendorFilters>({
    search: "",
    vendorType: "",
    city: "",
    page: 1,
    limit: 10,
  });

  const fetchVendors = (currentFilters: VendorFilters) => {
    const queryParams: any = {
      limit: currentFilters.limit,
      offset: (currentFilters.page - 1) * currentFilters.limit,
    };
    if (currentFilters.search) queryParams.search = currentFilters.search;
    if (currentFilters.vendorType)
      queryParams.vendorType = currentFilters.vendorType;
    if (currentFilters.city) queryParams.city = currentFilters.city;

    getVendors(setVendors, queryParams, setTotalElements);
  };

  // Triggers search on initial mount only
  useEffect(() => {
    fetchVendors({ ...filters, page: 1 });
  }, []);

  const handleChangeFilter = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    const updatedFilters = { ...filters, search: searchVal, page: 1 };
    setFilters(updatedFilters);
    fetchVendors(updatedFilters);
  };

  const handleResetFilters = () => {
    setSearchVal("");
    const cleared = {
      search: "",
      vendorType: "",
      city: "",
      page: 1,
      limit: 10,
    };
    setFilters(cleared);
    fetchVendors(cleared);
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    const nextPage = pageInfo.selected + 1;
    setFilters((prev) => ({
      ...prev,
      page: nextPage,
      limit: pageInfo.limit,
    }));
    fetchVendors({
      ...filters,
      page: nextPage,
      limit: pageInfo.limit,
    });
  };

  const handleDelete = async (id: string, name: string) => {
    await deleteVendor(id, name, () => fetchVendors(filters));
  };

  const getVendorTypeBadgeClass = (type: string) => {
    switch (type) {
      case "vendorMaterial":
      case "Raw Material":
        return "bg-success-bg text-success-text border border-panel-border";
      case "vendorLabour":
      case "Sub Contractor":
        return "bg-accent-bg text-accent-text border border-panel-border";
      default:
        return "bg-info-bg text-info-text border border-panel-border";
    }
  };

  const getVendorTypeLabel = (type: string) => {
    switch (type) {
      case "vendorMaterial":
        return "Raw Material";
      case "vendorLabour":
        return "Sub Contractor";
      default:
        return type || "--";
    }
  };

  const columns = [
    "Sr No.",
    "Name",
    "Job Description",
    "Type",
    "Phone",
    "City",
    "Actions",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
            Vendor Profiles
          </h1>
        </div>
        <Link
          to="/vendors/create"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap self-start sm:self-auto text-sm"
        >
          <Plus size={18} />
          Register New Vendor
        </Link>
      </div>

      {/* Filters Toolbar Card */}
      <div className="bg-muted-foreground/5 border border-border-main p-4 rounded-xl animate-fade-in shadow-xs flex flex-wrap items-end justify-start md:justify-end gap-3 w-full">
        {/* Search */}
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
              name="search"
              placeholder="Search by name, job description, city, phone..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="common-input pl-10 pr-4 text-sm h-10 w-full"
            />
          </div>
        </div>

        {/* Vendor Type */}
        <div className="flex flex-col items-start gap-1 w-full sm:w-auto flex-1 sm:flex-initial min-w-[170px]">
          <label
            htmlFor="vendorType"
            className="text-xs text-foreground font-medium whitespace-nowrap"
          >
            Vendor Type
          </label>
          <select
            name="vendorType"
            id="vendorType"
            value={filters.vendorType}
            onChange={handleChangeFilter}
            className="common-input text-sm h-10 w-full sm:w-40 text-sm"
          >
            <option value="">Status / Type</option>
            <option value="Both">Both</option>
            <option value="vendorMaterial">Raw Material</option>
            <option value="vendorLabour">Sub Contractor</option>
          </select>
        </div>

        {/* Action Buttons */}
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

      {/* Table Container */}
      <div className="w-full flex flex-col gap-4">
        {vendors.length > 0 ? (
          <div className="bg-card rounded-xl border border-border-main overflow-hidden shadow-xs animate-slide-up">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-main">
                {/* Table Header */}
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

                {/* Table Body */}
                <tbody className="divide-y divide-border-main bg-card text-foreground">
                  {vendors.map((vendor, index) => (
                    <tr
                      key={vendor.id}
                      className="hover:bg-muted-foreground/5 transition-colors"
                    >
                      <td className="table-td">
                        {(filters.page - 1) * filters.limit + index + 1}
                      </td>
                      <td className="table-td font-semibold text-foreground">
                        {vendor?.vendorName || "--"}
                      </td>
                      <td className="table-td">
                        {vendor?.jobDescription || "--"}
                      </td>
                      <td className="table-td">
                        <span
                          className={`px-2.5 py-1 text-xs font-bold tracking-wide rounded-md ${getVendorTypeBadgeClass(vendor?.vendorType || "")}`}
                        >
                          {getVendorTypeLabel(vendor?.vendorType || "")}
                        </span>
                      </td>
                      <td className="table-td">{vendor?.phone || "--"}</td>
                      <td className="table-td">{vendor?.city || "--"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Link
                            to={`/vendors/view/${vendor.id}`}
                            className="btn-action-view"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            to={`/vendors/edit/${vendor.id}`}
                            className="btn-action-edit"
                            title="Edit Vendor"
                          >
                            <Pencil size={16} />
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(vendor.id, vendor.vendorName)
                            }
                            className="btn-action-delete"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
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
