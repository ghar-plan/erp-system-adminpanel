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
} from "lucide-react";
import { IoArrowBackOutline } from "react-icons/io5";
import usePurchases from "../useHooks";
import {
  Purchase,
  formatMoney,
  formatPurchaseProductsLabel,
} from "@/utils/helpers/models/purchases/purchase.dto";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { canAccessPurchasePrice } from "@/utils/helpers/permissions/purchase-price-access";
import useStore from "@/hooks/useStore";
import ExpiryStatusBadge from "@/components/ui/ExpiryStatusBadge";
import {
  getExpiryStatus,
  getWorstExpiryStatus,
} from "@/utils/helpers/common/expiry-status";

export default function PurchaseView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getUser } = useStore();
  const { getPurchaseById } = usePurchases();
  const [purchase, setPurchase] = useState<Purchase | null>(null);
  const canViewPurchasePrice = canAccessPurchasePrice(getUser()?.email);

  useEffect(() => {
    if (id) {
      getPurchaseById(id, setPurchase);
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
            <span
              className={`inline-flex items-center text-[10px] font-bold tracking-wider px-2.5 py-1 rounded-full mt-1 uppercase ${getSourceBadgeClass(purchase?.sourcePayment || "")}`}
            >
              {purchase?.sourcePayment || "--"}
            </span>
          </div>
        </div>

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
                      {item.productName || "--"}
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
