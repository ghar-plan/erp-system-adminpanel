import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Pencil,
  Package,
  Calendar,
  Truck,
  Hash,
  Wallet,
  StickyNote,
  Layers,
  CheckCircle2,
  AlertCircle,
  Eye,
  History,
} from "lucide-react";
import { IoArrowBackOutline } from "react-icons/io5";
import usePurchases from "../useHooks";
import useCommerceCashflow from "@/containers/main/commerce-cashflow/useHooks";
import {
  Purchase,
  formatMoney,
  formatPurchaseProductsLabel,
} from "@/utils/helpers/models/purchases/purchase.dto";
import { formatSkuLabel } from "@/utils/helpers/models/product-sku";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { canAccessPurchasePrice } from "@/utils/helpers/permissions/purchase-price-access";
import useStore from "@/hooks/useStore";
import ExpiryStatusBadge from "@/components/ui/ExpiryStatusBadge";
import {
  getExpiryStatus,
  getWorstExpiryStatus,
} from "@/utils/helpers/common/expiry-status";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";

export default function PurchaseView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getUser } = useStore();
  const { getPurchaseById } = usePurchases();
  const { getOutByPurchase } = useCommerceCashflow();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const [cashOuts, setCashOuts] = useState<any[]>([]);
  const canViewPurchasePrice = canAccessPurchasePrice(getUser()?.email);

  useEffect(() => {
    if (id) {
      getPurchaseById(id, setPurchase);
      getOutByPurchase(id, setCashOuts);
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

  if (!purchase) {
    return null;
  }

  const lines =
    purchase.items && purchase.items.length > 0
      ? purchase.items
      : [
          {
            productId: purchase.productId,
            productName: purchase.productName,
            variantId: purchase.variantId,
            variantName: purchase.variantName,
            quantity: purchase.quantity,
            rate: purchase.rate,
            lineTotal: purchase.paymentMade,
            expiryDate: purchase.expiryDate,
          },
        ];

  const hasPrice =
    canViewPurchasePrice &&
    purchase.paymentMade != null &&
    Number.isFinite(Number(purchase.paymentMade));

  const amountPaid = Number(purchase.amountPaid || 0);
  const balanceDue = Number(purchase.balanceDue || 0);
  const isSettled = balanceDue <= 0.001 && (amountPaid > 0 || Number(purchase.paymentMade || 0) === 0);
  const hasOutstanding = balanceDue > 0.001;

  const overallExpiry = getWorstExpiryStatus(
    lines.map((item) => item.expiryDate),
  );

  return (
    <div className="space-y-6">
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
          <h1 className="text-2xl text-foreground font-bold">
            Purchase Overview
          </h1>
        </div>
        <Can permission={PERMISSIONS.PURCHASES_UPDATE}>
          <Link
            to={`/purchases/edit/${purchase.id}`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap text-sm"
          >
            <Pencil size={16} />
            Edit Purchase
          </Link>
        </Can>
      </div>

      <hr className="border-border-main" />

      <div className="bg-card border border-border-main rounded-xl p-6 shadow-xs space-y-6 animate-slide-up">
        <div className="flex items-center gap-4 border-b border-border-main pb-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
            {purchase?.supplierName?.charAt(0) || "P"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {purchase?.supplierName || "--"}
            </h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span
                className={`inline-flex items-center text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase ${getSourceBadgeClass(purchase?.sourcePayment || "")}`}
              >
                {purchase?.sourcePayment || "--"}
              </span>
              {hasPrice || amountPaid > 0 || hasOutstanding ? (
                isSettled ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                    <CheckCircle2 size={12} />
                    Settled
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full uppercase bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                    <AlertCircle size={12} />
                    Remaining {formatMoney(balanceDue)}
                  </span>
                )
              ) : null}
            </div>
          </div>
        </div>

        {(hasPrice || amountPaid > 0 || hasOutstanding) && (
          <div
            className={`rounded-xl border px-4 py-3 flex flex-wrap items-center justify-between gap-3 ${
              isSettled
                ? "bg-emerald-500/10 border-emerald-500/25"
                : "bg-amber-500/10 border-amber-500/25"
            }`}
          >
            <div className="flex items-start gap-2.5">
              {isSettled ? (
                <CheckCircle2
                  size={18}
                  className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0"
                />
              ) : (
                <AlertCircle
                  size={18}
                  className="text-amber-600 dark:text-amber-400 mt-0.5 shrink-0"
                />
              )}
              <div>
                <p
                  className={`text-sm font-bold ${
                    isSettled
                      ? "text-emerald-700 dark:text-emerald-400"
                      : "text-amber-700 dark:text-amber-400"
                  }`}
                >
                  {isSettled
                    ? "Vendor payment settled"
                    : "Outstanding payable to vendor"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Paid {formatMoney(amountPaid)}
                  {hasOutstanding
                    ? ` · Remaining due ${formatMoney(balanceDue)}`
                    : " · No remaining balance"}
                  {hasPrice ? ` · Invoice ${formatMoney(purchase.paymentMade)}` : ""}
                </p>
              </div>
            </div>
            {hasOutstanding ? (
              <Link
                to={siteRoutes.commerceCashflow}
                className="text-xs font-bold text-primary hover:underline whitespace-nowrap"
              >
                Record Cash Out →
              </Link>
            ) : null}
          </div>
        )}

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-info-bg text-info-text">
              <Package size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Products
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {formatPurchaseProductsLabel(purchase)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-success-bg text-success-text">
              <Hash size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Total Quantity
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {purchase?.quantity ?? "--"}
              </p>
            </div>
          </div>

          {hasPrice ? (
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-lg bg-accent-bg text-accent-text">
                <Wallet size={18} />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                  Total Price
                </label>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {formatMoney(purchase?.paymentMade)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Paid {formatMoney(amountPaid)}
                  {hasOutstanding
                    ? ` · Remaining ${formatMoney(balanceDue)}`
                    : " · Settled"}
                </p>
              </div>
            </div>
          ) : null}

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-info-bg text-info-text">
              <Calendar size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Purchase Date
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {formatDate(purchase?.date)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-warning-bg text-warning-text">
              <Calendar size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Expiry Status
              </label>
              <div className="mt-1">
                <ExpiryStatusBadge info={overallExpiry} />
              </div>
              {lines.length > 1 ? (
                <p className="text-xs text-muted-foreground mt-1">
                  Worst status across {lines.length} products
                </p>
              ) : null}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-accent-bg text-accent-text">
              <Truck size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Registered On
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {purchase?.created_at ? formatDate(purchase.created_at) : "--"}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-border-main pt-6 space-y-3">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Layers size={18} />
            <span className="text-xs font-bold uppercase tracking-wide">
              Line Items
            </span>
          </div>
          <div className="overflow-x-auto rounded-xl border border-border-main">
            <table className="min-w-full divide-y divide-border-main text-sm">
              <thead className="bg-muted-foreground/5">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Product
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Qty
                  </th>
                  {canViewPurchasePrice ? (
                    <>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Rate
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        Line Total
                      </th>
                    </>
                  ) : null}
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Expiry Date
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-main">
                {lines.map((item, index) => {
                  const lineExpiry = getExpiryStatus(item.expiryDate);
                  return (
                  <tr
                    key={item.productId + "-" + index}
                    className={lineExpiry.toneClass}
                  >
                    <td className="px-3 py-2 font-semibold text-foreground">
                      {item.productName
                        ? formatSkuLabel(item.productName, item.variantName)
                        : "--"}
                    </td>
                    <td className="px-3 py-2">{item.quantity ?? "--"}</td>
                    {canViewPurchasePrice ? (
                      <>
                        <td className="px-3 py-2">
                          {item.rate != null ? formatMoney(item.rate) : "—"}
                        </td>
                        <td className="px-3 py-2">
                          {item.lineTotal != null
                            ? formatMoney(item.lineTotal)
                            : "—"}
                        </td>
                      </>
                    ) : null}
                    <td className="px-3 py-2">
                      {item.expiryDate ? formatDate(item.expiryDate) : "--"}
                    </td>
                    <td className="px-3 py-2">
                      <ExpiryStatusBadge info={lineExpiry} />
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="border-t border-border-main pt-6 space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-muted-foreground">
              <History size={18} />
              <span className="text-xs font-bold uppercase tracking-wide">
                Cash Out History ({cashOuts.length})
              </span>
            </div>
            <Link
              to={siteRoutes.commerceCashflow}
              className="text-xs font-bold text-primary hover:underline"
            >
              Open Cash In / Cash Out
            </Link>
          </div>
          {cashOuts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No cash-out entries recorded for this purchase yet.
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
                  {cashOuts.map((row) => (
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
                          to={`/commerce/cashflow/view/out/${row.id}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg btn-action-view"
                          title="View Cash Out Details"
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

        <div className="border-t border-border-main pt-6">
          <div className="flex items-center gap-2 mb-3 text-muted-foreground">
            <StickyNote size={18} />
            <span className="text-xs font-bold uppercase tracking-wide">
              Remarks
            </span>
          </div>
          <div className="bg-panel-bg border border-panel-border rounded-xl p-4 min-h-[80px] text-sm text-foreground leading-relaxed whitespace-pre-line">
            {purchase?.remarks || "No remarks added for this purchase."}
          </div>
        </div>
      </div>
    </div>
  );
}
