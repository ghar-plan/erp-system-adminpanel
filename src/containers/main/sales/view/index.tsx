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
  Building2,
  CheckCircle2,
  AlertCircle,
  Eye,
  History,
} from "lucide-react";
import { IoArrowBackOutline } from "react-icons/io5";
import useSales from "../useHooks";
// Resolve Payment / Installment History moved to Commerce Cash In
// import ResolvePaymentModal from "../components/ResolvePaymentModal";
import useCommerceCashflow from "@/containers/main/commerce-cashflow/useHooks";
import {
  Sale,
  PaymentCollectedBy,
  computeSaleSubtotal,
  isDraftEntry,
} from "@/utils/helpers/models/sales/sale.dto";
import { formatMoney } from "@/utils/helpers/models/purchases/purchase.dto";
import {
  CustomerTypeCategory,
  customerTypeCategoryLabel,
} from "@/utils/helpers/models/customer-types/customer-type.dto";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { isErpAdminEmail } from "@/utils/helpers/permissions/erp-admin-access";
import useStore from "@/hooks/useStore";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";

export default function SaleView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getUser } = useStore();
  const { getSaleById } = useSales();
  const { getInBySale } = useCommerceCashflow();
  const [sale, setSale] = useState<Sale | null>(null);
  const [cashIns, setCashIns] = useState<any[]>([]);
  // const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const canViewSaleRates = isErpAdminEmail(getUser()?.email);

  useEffect(() => {
    if (id) {
      getSaleById(id, setSale);
      getInBySale(id, setCashIns);
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

  const paidAmount = Number(sale.payment || 0);
  const balanceAmount = Number(sale.balance || 0);
  const invoiceTotal =
    sale.items?.length
      ? computeSaleSubtotal(sale.items)
      : paidAmount + balanceAmount;
  const isSettled = balanceAmount <= 0.001 && paidAmount > 0;
  const hasOutstanding = balanceAmount > 0.001;

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
        <div className="flex items-center gap-2 flex-wrap">
          {/* Payment Details & Installment History — use Commerce Cash In
          <Can permission={PERMISSIONS.SALES_UPDATE}>
            {!isDraftEntry(sale.status) ? (
              <button ... Resolve Payment / Installment History />
            ) : null}
          </Can>
          */}
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
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase ${getSourceBadgeClass(sale?.sourcePayment || "")}`}
              >
                {sale?.sourcePayment || "--"}
              </span>
              {isSettled ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 size={12} />
                  Settled
                </span>
              ) : hasOutstanding ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                  <AlertCircle size={12} />
                  Remaining {formatMoney(balanceAmount)}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className={`rounded-xl border px-4 py-3 flex flex-wrap items-center justify-between gap-3 ${
            isSettled
              ? "bg-emerald-500/10 border-emerald-500/25"
              : hasOutstanding
                ? "bg-amber-500/10 border-amber-500/25"
                : "bg-muted/30 border-border-main"
          }`}
        >
          <div className="flex items-start gap-2.5">
            {isSettled ? (
              <CheckCircle2
                size={18}
                className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0"
              />
            ) : hasOutstanding ? (
              <AlertCircle
                size={18}
                className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0"
              />
            ) : (
              <Wallet size={18} className="text-muted-foreground mt-0.5 shrink-0" />
            )}
            <div>
              <p
                className={`text-sm font-bold ${
                  isSettled
                    ? "text-emerald-700 dark:text-emerald-400"
                    : hasOutstanding
                      ? "text-amber-700 dark:text-amber-400"
                      : "text-foreground"
                }`}
              >
                {isSettled
                  ? "Customer payment settled"
                  : hasOutstanding
                    ? "Outstanding receivable"
                    : "Payment status"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Paid {formatMoney(paidAmount)}
                {hasOutstanding
                  ? ` · Remaining balance ${formatMoney(balanceAmount)}`
                  : isSettled
                    ? " · No remaining balance"
                    : ""}
                {` · Invoice ${formatMoney(invoiceTotal)}`}
              </p>
            </div>
          </div>
          {hasOutstanding ? (
            <Link
              to={siteRoutes.commerceCashflow}
              className="text-xs font-bold text-primary hover:underline whitespace-nowrap"
            >
              Record Cash In →
            </Link>
          ) : null}
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
              <p className="text-xs text-muted-foreground mt-1">
                {isSettled
                  ? "Settled in full"
                  : hasOutstanding
                    ? `Remaining ${formatMoney(balanceAmount)}`
                    : null}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-lg ${
                isSettled
                  ? "bg-success-bg text-success-text"
                  : "bg-danger-bg text-danger-text"
              }`}
            >
              {isSettled ? <CheckCircle2 size={18} /> : <Wallet size={18} />}
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Balance
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {isSettled ? "Settled (PKR 0)" : formatMoney(sale?.balance)}
              </p>
            </div>
          </div>

          {sale?.customerType?.category ===
          CustomerTypeCategory.PICKUP_POINT ? (
            <>
              <div className="flex items-start gap-3">
                <div className="p-2.5 rounded-lg bg-info-bg text-info-text">
                  <Building2 size={18} />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Payment Collected By
                  </label>
                  <p className="text-sm font-semibold text-foreground mt-0.5">
                    {sale.paymentCollectedBy === PaymentCollectedBy.ADMIN
                      ? "Admin (Ghar Plans)"
                      : "Pickup Point"}
                  </p>
                </div>
              </div>
            </>
          ) : null}
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
                      Variant
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

        <div className="border-t border-border-main pt-6 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-muted-foreground">
              <History size={18} />
              <span className="text-xs font-bold uppercase tracking-wide">
                Cash In History ({cashIns.length})
              </span>
            </div>
            <Link
              to={siteRoutes.commerceCashflow}
              className="text-xs font-bold text-primary hover:underline"
            >
              Open Cash In / Cash Out
            </Link>
          </div>
          {cashIns.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No cash-in entries recorded for this sale yet.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border-main">
              <table className="min-w-full divide-y divide-border-main text-sm">
                <thead className="bg-muted-foreground/5">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Date
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Installment
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Source
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Amount
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Entered By
                    </th>
                    <th className="px-3 py-2 text-right text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main">
                  {cashIns.map((row) => (
                    <tr key={row.id}>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {formatDate(row.entryDate)}
                      </td>
                      <td className="px-3 py-2">{row.installment || "—"}</td>
                      <td className="px-3 py-2">{row.paymentSource || "—"}</td>
                      <td className="px-3 py-2 text-right font-semibold">
                        {formatMoney(row.amount)}
                      </td>
                      <td className="px-3 py-2">{row.enteredBy || "—"}</td>
                      <td className="px-3 py-2 text-right">
                        <Link
                          to={`/commerce/cashflow/view/in/${row.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg btn-action-view"
                          title="View Cash In Details"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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

      {/* Payment Details & Installment History — handled via Commerce Cash In
      {isResolveModalOpen ? (
        <ResolvePaymentModal ... />
      ) : null}
      */}

    </div>
  );
}
