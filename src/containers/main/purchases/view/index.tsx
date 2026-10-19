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
  Tag,
  CalendarClock,
} from "lucide-react";
import { IoArrowBackOutline } from "react-icons/io5";
import usePurchases from "../useHooks";
import { Purchase, formatMoney } from "@/utils/helpers/models/purchases/purchase.dto";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";

export default function PurchaseView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPurchaseById } = usePurchases();
  const [purchase, setPurchase] = useState<Purchase | null>(null);

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

  const total = Number(purchase.quantity || 0) * Number(purchase.rate || 0);
  const remaining = Math.max(total - Number(purchase.paymentMade || 0), 0);

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
                Product
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {purchase?.productName || "--"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-success-bg text-success-text">
              <Hash size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Quantity
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {purchase?.quantity ?? "--"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-warning-bg text-warning-text">
              <Tag size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Per Item
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {formatMoney(purchase?.rate)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-accent-bg text-accent-text">
              <Wallet size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Total Amount
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {formatMoney(total)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-success-bg text-success-text">
              <Wallet size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Price
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {formatMoney(purchase?.paymentMade)}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-danger-bg text-danger-text">
              <Wallet size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Remaining
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {formatMoney(remaining)}
              </p>
            </div>
          </div>

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
              <CalendarClock size={18} />
            </div>
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Expiry Date
              </label>
              <p className="text-sm font-semibold text-foreground mt-0.5">
                {purchase?.expiryDate ? formatDate(purchase.expiryDate) : "--"}
              </p>
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

        {/* Remarks */}
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
