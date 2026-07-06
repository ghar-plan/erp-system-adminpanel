import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Eye, Pencil, Trash2 } from "lucide-react";
import useProspects from "../useHooks";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";

interface Prospect {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  status: "New" | "Contacted" | "Qualified" | "Lost" | "Converted";
  created_at: string;
}

export default function ProspectsListing() {
  const { getProspects, deleteProspect } = useProspects();
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [totalElements, setTotalElements] = useState(0);

  // Active filters applied to list
  const [activeSearch, setActiveSearch] = useState("");
  const [activeStatus, setActiveStatus] = useState("");

  // Draft filters inside the card
  const [draftSearch, setDraftSearch] = useState("");
  const [draftStatus, setDraftStatus] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const fetchProspectsList = () => {
    getProspects(setProspects);
  };

  useEffect(() => {
    fetchProspectsList();
  }, []);

  const handleApplyFilters = () => {
    setActiveSearch(draftSearch);
    setActiveStatus(draftStatus);
    setPage(1);
  };

  const handleResetFilters = () => {
    setDraftSearch("");
    setDraftStatus("");
    setActiveSearch("");
    setActiveStatus("");
    setPage(1);
  };

  const handleDelete = async (id: string, name: string) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete prospect "${name}"?`,
    );
    if (isConfirmed) {
      await deleteProspect(id, () => {
        fetchProspectsList();
      });
    }
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    setPage(pageInfo.selected + 1);
    setLimit(pageInfo.limit);
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

  const getStatusBadge = (status: string) => {
    let classes =
      "bg-slate-50 text-slate-600 dark:bg-slate-900/20 dark:text-slate-400";
    if (status === "New") {
      classes =
        "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400";
    } else if (status === "Contacted") {
      classes =
        "bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400";
    } else if (status === "Qualified") {
      classes =
        "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400";
    } else if (status === "Lost") {
      classes = "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400";
    } else if (status === "Converted") {
      classes =
        "bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400";
    }

    return (
      <span
        className={`inline-flex items-center font-bold text-[10px] tracking-wider px-2.5 py-1 rounded-full uppercase ${classes}`}
      >
        {status}
      </span>
    );
  };

  // Filter & Paginate prospects locally for fast search feel
  const filteredProspects = prospects.filter((p) => {
    const matchesStatus = !activeStatus || p.status === activeStatus;
    const matchesSearch =
      !activeSearch ||
      p.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
      p.phone.toLowerCase().includes(activeSearch.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(activeSearch.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const paginatedProspects = filteredProspects.slice(
    (page - 1) * limit,
    page * limit,
  );
  const count = filteredProspects.length;

  const columns = [
    "Sr No.",
    "Name",
    "Phone",
    "Email",
    "Status",
    "Date of Entry",
    "Actions",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in  ">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
              Potential Prospects
            </h1>
          </div>
        </div>

        <Link
          to="/prospects/create"
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap text-sm"
        >
          <Plus size={18} />
          Register New Prospect
        </Link>
      </div>

      <hr className="border-border-main" />

      <div className="flex justify-end w-full">
        <div className="relative sm:max-w-md w-full">
          <Search
            className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground/80"
            size={16}
          />
          <input
            type="search"
            placeholder="Search by name, phone or email..."
            value={draftSearch}
            onChange={(e) => setDraftSearch(e.target.value)}
            className="common-input pl-10 pr-4 !rounded-lg text-sm h-10 w-full"
          />
        </div>
      </div>

      {/* Filters Toolbar Card */}
      <div className="bg-muted-foreground/5 border border-border-main p-4 rounded-xl animate-fade-in shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <select
            value={draftStatus}
            onChange={(e) => setDraftStatus(e.target.value)}
            className="common-input h-10 w-full sm:w-44 bg-card"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Lost">Lost</option>
            <option value="Converted">Converted</option>
          </select>

          <div className="flex gap-2 w-full sm:w-auto ml-auto sm:ml-0">
            <Button
              variant="secondary"
              onClick={handleResetFilters}
              className="h-10 text-xs px-6 font-semibold flex-1 sm:flex-initial !py-0"
            >
              Reset
            </Button>
            <Button
              variant="primary"
              onClick={handleApplyFilters}
              className="h-10 text-xs px-6 font-semibold flex-1 sm:flex-initial !py-0"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>

      {/* Table / Grid Container */}
      <div className="w-full flex flex-col gap-4">
        {paginatedProspects.length > 0 ? (
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
                  {paginatedProspects.map((prospect, index) => (
                    <tr
                      key={prospect.id}
                      className="hover:bg-muted-foreground/5 transition-colors"
                    >
                      <td className="table-td">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="table-td font-semibold text-foreground">
                        {prospect?.name || "--"}
                      </td>
                      <td className="table-td font-medium">{prospect?.phone || "--"}</td>
                      <td className="table-td">{prospect?.email || "--"}</td>
                      <td className="table-td">
                        {getStatusBadge(prospect?.status || "")}
                      </td>
                      <td className="table-td">
                        {prospect?.created_at ? formatDate(prospect.created_at) : "--"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <Link
                            to={`/prospects/view/${prospect.id}`}
                            className="btn-action-view"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </Link>
                          <Link
                            to={`/prospects/edit/${prospect.id}`}
                            className="btn-action-edit"
                            title="Edit Prospect"
                          >
                            <Pencil size={16} />
                          </Link>
                          <button
                            onClick={() =>
                              handleDelete(prospect.id, prospect.name)
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

        {count > 0 && (
          <Pagination
            count={count}
            page={page}
            limit={limit}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
}
