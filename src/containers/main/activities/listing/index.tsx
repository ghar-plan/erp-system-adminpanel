import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Upload,
  FileSpreadsheet,
  Loader2,
  List,
} from "lucide-react";
import useActivities from "../useHooks";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import { useDebounce } from "@/hooks/useDebounce";

interface ActivityFilters {
  search: string;
  page: number;
  limit: number;
}

export default function ActivitiesListing() {
  const navigate = useNavigate();
  const { getActivities, uploadActivitiesCsv } = useActivities();
  const [activities, setActivities] = useState<any[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [csvUploading, setCsvUploading] = useState(false);

  // Filters State
  const [filters, setFilters] = useState<ActivityFilters>({
    search: "",
    page: 1,
    limit: 10,
  });

  const debounceSearch = useDebounce(filters.search, 1000);

  const fetchActivities = (currentFilters: ActivityFilters) => {
    const queryParams: any = {
      limit: currentFilters.limit,
      offset: (currentFilters.page - 1) * currentFilters.limit,
    };
    if (currentFilters.search) queryParams.search = currentFilters.search;

    getActivities(setActivities, queryParams, setTotalElements);
  };

  // Triggers search on debounce search change
  useEffect(() => {
    fetchActivities({ ...filters, page: 1 });
  }, [debounceSearch]);

  const handleChangeFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
      page: 1,
    }));
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    const nextPage = pageInfo.selected + 1;
    setFilters((prev) => ({
      ...prev,
      page: nextPage,
      limit: pageInfo.limit,
    }));
    fetchActivities({
      ...filters,
      page: nextPage,
      limit: pageInfo.limit,
    });
  };

  const handleCsvUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvUploading(true);
    await uploadActivitiesCsv(file);
    fetchActivities({ ...filters, page: 1 });
    setCsvUploading(false);
  };

  const formatDate = (dateString: string | Date) => {
    try {
      const dateObj = new Date(dateString);
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (e) {
      return "N/A";
    }
  };

  const columns = ["Sr No.", "Activity ID", "Activity Name", "Date of Entry"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in  ">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
              Activities
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto flex-wrap">
          {/* CSV Import */}
          <label className="flex h-10 px-4 items-center justify-center gap-2 rounded-md border border-border-main bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-foreground text-sm font-semibold transition-all cursor-pointer shadow-xs disabled:opacity-50">
            {csvUploading ? (
              <Loader2 className="animate-spin text-primary" size={16} />
            ) : (
              <Upload size={16} />
            )}
            {csvUploading ? "Uploading..." : "Import CSV"}
            <input
              type="file"
              accept=".csv"
              onChange={handleCsvUpload}
              className="hidden"
              disabled={csvUploading}
            />
          </label>

          {/* Add Activity Button */}
          <Link
            to="/activity/create"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap text-sm"
          >
            <Plus size={18} />
            Register New Activity
          </Link>
        </div>
      </div>

      <hr className="border-border-main" />

      {/* Filter and Search Bar */}
      <div className="flex justify-end w-full animate-fade-in">
        <div className="relative sm:max-w-md w-full">
          <Search
            className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground/80"
            size={16}
          />
          <input
            type="search"
            name="search"
            placeholder="Search activities..."
            value={filters.search}
            onChange={handleChangeFilter}
            className="common-input pl-10 pr-4 !rounded-lg text-sm h-10 w-full"
          />
        </div>
      </div>

      {/* Table / Grid Container */}
      <div className="w-full flex flex-col gap-4">
        {activities.length > 0 ? (
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
                  {activities.map((act, index) => (
                    <tr
                      key={act.id}
                      className="hover:bg-muted-foreground/5 transition-colors"
                    >
                      <td className="table-td">
                        {(filters.page - 1) * filters.limit + index + 1}
                      </td>
                      <td className="table-td font-mono">{act.id}</td>
                      <td className="table-td font-semibold text-foreground">
                        {act.name}
                      </td>
                      <td className="table-td">{formatDate(act.created_at)}</td>
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
