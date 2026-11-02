import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Eye, Trash2, Download, FileText } from "lucide-react";
import useDocuments from "../useHooks";
import {
  DocumentType,
  ErpDocument,
  documentTypeLabel,
} from "@/utils/helpers/models/documents/document.dto";
import { formatMoney } from "@/utils/helpers/money";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";

type Props = {
  type: DocumentType;
};

export default function DocumentsListing({ type }: Props) {
  const { hasPermission } = usePermissions();
  const { getDocuments, deleteDocument, downloadPdf } = useDocuments();
  const canCreate = hasPermission(PERMISSIONS.DOCUMENTS_CREATE);
  const canView = hasPermission(PERMISSIONS.DOCUMENTS_READ);
  const canDelete = hasPermission(PERMISSIONS.DOCUMENTS_DELETE);
  const showActions = canView || canDelete;

  const isBill = type === DocumentType.BILL;
  const title = isBill ? "Bills" : "Quotations";
  const createRoute = isBill
    ? siteRoutes.documentsBills
    : siteRoutes.documentsQuotations;

  const [rows, setRows] = useState<ErpDocument[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [searchVal, setSearchVal] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    page: 1,
    limit: 10,
  });

  const fetchRows = (current = filters) => {
    const queryParams: any = {
      type,
      limit: current.limit,
      offset: (current.page - 1) * current.limit,
    };
    if (current.search) queryParams.search = current.search;
    getDocuments(setRows, queryParams, setTotalElements);
  };

  useEffect(() => {
    fetchRows({ search: "", page: 1, limit: 10 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const handleApplyFilters = () => {
    const next = { ...filters, search: searchVal, page: 1 };
    setFilters(next);
    fetchRows(next);
  };

  const handleResetFilters = () => {
    setSearchVal("");
    const next = { search: "", page: 1, limit: 10 };
    setFilters(next);
    fetchRows(next);
  };

  const onPageChange = (pageInfo: { selected: number; limit: number }) => {
    const next = {
      ...filters,
      page: pageInfo.selected + 1,
      limit: pageInfo.limit,
    };
    setFilters(next);
    fetchRows(next);
  };

  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return "--";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "--";
    }
  };

  const columns = [
    "Sr No.",
    isBill ? "Bill No" : "Quotation No",
    "Customer",
    "Phone",
    "Date",
    "Total",
    ...(showActions ? ["Actions"] : []),
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
            {title}
          </h1>
        </div>
        {canCreate ? (
          <Link
            to={createRoute}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap text-sm"
          >
            <Plus size={18} />
            {isBill ? "Generate Bill" : "Generate Quotation"}
          </Link>
        ) : null}
      </div>

      <div className="grid gap-5 grid-cols-2 sm:grid-cols-3 md:grid-cols-6 animate-fade-in">
        <div className="bg-card border border-border-main p-4 rounded-xl shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <FileText size={20} />
          </div>
          <div>
            <span className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider">
              Total {title}
            </span>
            <span className="text-xl font-bold text-foreground mt-0.5 block">
              {totalElements}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-muted-foreground/5 border border-border-main p-4 rounded-xl animate-fade-in shadow-xs flex flex-wrap items-end justify-start md:justify-end gap-3 w-full">
        <div className="flex flex-col items-start gap-1 w-full sm:max-w-sm flex-1 md:max-w-md min-w-[260px]">
          <label className="text-xs text-foreground font-medium">Search</label>
          <div className="relative w-full">
            <Search
              className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground/80"
              size={16}
            />
            <input
              type="search"
              placeholder="Search by number, name, phone..."
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
        {rows.length > 0 ? (
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
                  {rows.map((row, index) => (
                    <tr
                      key={row.id}
                      className="hover:bg-muted-foreground/5 transition-colors"
                    >
                      <td className="table-td">
                        {(filters.page - 1) * filters.limit + index + 1}
                      </td>
                      <td className="table-td font-semibold">
                        {row.documentNo}
                      </td>
                      <td className="table-td">{row.customerName || "--"}</td>
                      <td className="table-td">{row.customerPhone || "--"}</td>
                      <td className="table-td">{formatDate(row.date)}</td>
                      <td className="table-td">{formatMoney(row.total)}</td>
                      {showActions ? (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex gap-2">
                            {canView ? (
                              <Link
                                to={`/documents/view/${row.id}`}
                                className="btn-action-view"
                                title="View"
                              >
                                <Eye size={16} />
                              </Link>
                            ) : null}
                            {canView ? (
                              <button
                                type="button"
                                className="btn-action-edit"
                                title="Download PDF"
                                onClick={() =>
                                  downloadPdf(
                                    row.id,
                                    `${row.type}-${row.documentNo}.pdf`,
                                  )
                                }
                              >
                                <Download size={16} />
                              </button>
                            ) : null}
                            {canDelete ? (
                              <button
                                type="button"
                                className="btn-action-delete"
                                title="Delete"
                                onClick={() =>
                                  deleteDocument(
                                    row.id,
                                    `${documentTypeLabel(row.type)} ${row.documentNo}`,
                                    () => fetchRows(filters),
                                  )
                                }
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
