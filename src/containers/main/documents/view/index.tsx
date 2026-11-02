import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Download,
  Package,
  Calendar,
  User,
  Phone,
  Wallet,
  StickyNote,
  MapPin,
} from "lucide-react";
import { IoArrowBackOutline } from "react-icons/io5";
import useDocuments from "../useHooks";
import {
  ErpDocument,
  documentTypeLabel,
} from "@/utils/helpers/models/documents/document.dto";
import { formatMoney } from "@/utils/helpers/money";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";

export default function DocumentView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getDocumentById, downloadPdf } = useDocuments();
  const [doc, setDoc] = useState<ErpDocument | null>(null);

  useEffect(() => {
    if (id) getDocumentById(id, setDoc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!doc) return null;

  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return "--";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return "--";
    }
  };

  const listRoute =
    doc.type === "bill"
      ? siteRoutes.documentsBillsList
      : siteRoutes.documentsQuotationsList;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap animate-fade-in">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(listRoute)}
            className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
            title="Back"
          >
            <IoArrowBackOutline size={20} className="stroke-[2.5]" />
          </button>
          <h1 className="text-2xl text-foreground font-bold">
            {documentTypeLabel(doc.type)} Overview
          </h1>
        </div>
        <Can permission={PERMISSIONS.DOCUMENTS_READ}>
          <button
            type="button"
            onClick={() =>
              downloadPdf(doc.id, `${doc.type}-${doc.documentNo}.pdf`)
            }
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap text-sm"
          >
            <Download size={16} />
            Download PDF
          </button>
        </Can>
      </div>

      <hr className="border-border-main" />

      <div className="bg-card border border-border-main rounded-xl p-6 shadow-xs space-y-6 animate-slide-up">
        <div className="flex items-center gap-4 border-b border-border-main pb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
            {doc.customerName?.charAt(0) || "D"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {doc.documentNo}
            </h2>
            <p className="text-sm text-muted-foreground">
              {documentTypeLabel(doc.type)} · {formatDate(doc.date)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-info-bg text-info-text">
              <User size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Customer
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {doc.customerName}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-success-bg text-success-text">
              <Phone size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Phone
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {doc.customerPhone}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 sm:col-span-2">
            <div className="p-2.5 rounded-lg bg-warning-bg text-warning-text">
              <MapPin size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Address
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {doc.customerAddress}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-accent-bg text-accent-text">
              <Wallet size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Total
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {formatMoney(doc.total)}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-info-bg text-info-text">
              <Calendar size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Date
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {formatDate(doc.date)}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border-main pt-6 space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package size={18} />
            <span className="text-xs font-bold uppercase tracking-wide">
              Line Items
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border-main">
            <table className="min-w-full divide-y divide-border-main text-sm">
              <thead className="bg-muted-foreground/5">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    #
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Product
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Variant
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Qty
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Rate
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {(doc.items || []).map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="px-3 py-2">{index + 1}</td>
                    <td className="px-3 py-2 font-semibold break-words">
                      {item.productName || "--"}
                    </td>
                    <td className="px-3 py-2 break-words">
                      {item.variantName ? (
                        <span className="font-medium">{item.variantName}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">{item.quantity}</td>
                    <td className="px-3 py-2">{formatMoney(item.rate)}</td>
                    <td className="px-3 py-2">
                      {formatMoney(item.lineTotal ?? item.quantity * item.rate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {doc.remarks ? (
          <div className="border-t border-border-main pt-6">
            <div className="flex items-center gap-2 mb-3 text-muted-foreground">
              <StickyNote size={18} />
              <span className="text-xs font-bold uppercase tracking-wide">
                Remarks
              </span>
            </div>
            <div className="bg-panel-bg border border-panel-border rounded-xl p-4 text-sm text-foreground whitespace-pre-line">
              {doc.remarks}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
