import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Pencil,
  Package,
  Calendar,
  User,
  Phone,
  Hash,
  Wallet,
  StickyNote,
  Tag,
  Layers,
} from "lucide-react";
import { IoArrowBackOutline } from "react-icons/io5";
import useSales from "../useHooks";
import {
  Sale,
  computeSaleSubtotal,
} from "@/utils/helpers/models/sales/sale.dto";
import { formatMoney } from "@/utils/helpers/models/purchases/purchase.dto";
import { customerTypeCategoryLabel } from "@/utils/helpers/models/customer-types/customer-type.dto";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { isErpAdminEmail } from "@/utils/helpers/permissions/erp-admin-access";
import useStore from "@/hooks/useStore";

export default function SaleView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getUser } = useStore();
  const { getSaleById } = useSales();
  const [sale, setSale] = useState<Sale | null>(null);
  const canViewSaleRates = isErpAdminEmail(getUser()?.email);

  useEffect(() => {
    if (id) {
      getSaleById(id, setSale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const goToBack = () => navigate(-1);

  const formatDate = (dateString?: string | Date | null) => {
    if (!dateString) return "--";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        month: "long",
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

  if (!sale) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center gap-4 flex-wrap animate-fade-in">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goToBack}
            className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
            title="Go Back"
          >
            <IoArrowBackOutline size={20} className="stroke-[2.5]" />
          </button>
          <h1 className="text-2xl text-foreground font-bold">Sale Overview</h1>
        </div>
        <Can permission={PERMISSIONS.SALES_UPDATE}>
          <Link
            to={`/sales/edit/${sale.id}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap text-sm"
          >
            <Pencil size={16} />
            Edit Sale
          </Link>
        </Can>
      </div>

      <hr className="border-border-main" />

      <div className="bg-card border border-border-main rounded-xl p-6 shadow-xs space-y-6 animate-slide-up">
        <div className="flex items-center gap-4 border-b border-border-main pb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
            {(sale?.customerName || sale?.customerType?.name)?.charAt(0) || "S"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {sale?.customerName || sale?.customerType?.name || "--"}
            </h2>
            <span
              className={`inline-flex items-center text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full mt-1 uppercase ${getSourceBadgeClass(sale?.sourcePayment || "")}`}
            >
              {sale?.sourcePayment || "--"}
            </span>
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-info-bg text-info-text">
              <Layers size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Customer Type
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {sale?.customerType?.name || "--"}
                {sale?.customerType?.category
                  ? ` (${customerTypeCategoryLabel(sale.customerType.category)})`
                  : ""}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-success-bg text-success-text">
              <Calendar size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Date
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {formatDate(sale?.date)}
              </p>
            </div>
          </div>

          {sale?.customerName ? (
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-accent-bg text-accent-text">
                <User size={18} />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Customer Name
                </label>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {sale.customerName}
                </p>
              </div>
            </div>
          ) : null}

          {sale?.telephone ? (
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-warning-bg text-warning-text">
                <Phone size={18} />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Telephone
                </label>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {sale.telephone}
                </p>
              </div>
            </div>
          ) : null}

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-success-bg text-success-text">
              <Hash size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Total Quantity
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {sale?.quantity ?? "--"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-warning-bg text-warning-text">
              <Tag size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Amount
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {formatMoney(
                  sale?.items?.length
                    ? computeSaleSubtotal(sale.items)
                    : Number(sale?.payment || 0) + Number(sale?.balance || 0),
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-success-bg text-success-text">
              <Wallet size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Payment
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {formatMoney(sale?.payment)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-danger-bg text-danger-text">
              <Wallet size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Balance
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {formatMoney(sale?.balance)}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex items-center gap-2 mb-3">
            <Package size={16} className="text-primary" />
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wide">
              Products
            </h3>
          </div>
          {sale.items && sale.items.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-border-main">
              <table className="min-w-full text-sm">
                <thead className="bg-muted-foreground/5">
                  <tr className="text-left">
                    <th className="px-3 py-2 text-xs font-bold text-muted-foreground">
                      Product
                    </th>
                    <th className="px-3 py-2 text-xs font-bold text-muted-foreground">
                      Qty
                    </th>
                    {canViewSaleRates ? (
                      <>
                        <th className="px-3 py-2 text-xs font-bold text-muted-foreground">
                          Rate
                        </th>
                        <th className="px-3 py-2 text-xs font-bold text-muted-foreground">
                          Line Total
                        </th>
                      </>
                    ) : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main">
                  {sale.items.map((item, index) => (
                    <tr key={item.id || `${item.productId}-${index}`}>
                      <td className="px-3 py-2 font-semibold">
                        {item.productName || "--"}
                      </td>
                      <td className="px-3 py-2">{item.quantity ?? "--"}</td>
                      {canViewSaleRates ? (
                        <>
                          <td className="px-3 py-2">{formatMoney(item.rate)}</td>
                          <td className="px-3 py-2">
                            {formatMoney(
                              item.lineTotal ??
                                Number(item.quantity || 0) *
                                  Number(item.rate || 0),
                            )}
                          </td>
                        </>
                      ) : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {sale.productName || "--"} × {sale.quantity ?? "--"}
              {canViewSaleRates ? <> @ {formatMoney(sale.rate)}</> : null}
            </p>
          )}
        </div>

        {/* Remarks */}
        <div className="border-t border-border-main pt-6">
          <div className="flex items-center gap-2 mb-3 text-muted-foreground">
            <StickyNote size={18} />
            <span className="text-xs font-bold uppercase tracking-wide">
              Remarks
            </span>
          </div>
          <div className="bg-panel-bg border border-panel-border rounded-xl p-4 min-h-[80px] text-sm text-foreground leading-relaxed whitespace-pre-line">
            {sale?.remarks || "No remarks added for this sale."}
          </div>
        </div>
      </div>
    </div>
  );
}
