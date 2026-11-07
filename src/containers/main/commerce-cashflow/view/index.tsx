import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Coins,
  FileText,
  Hash,
  User,
  Wallet,
} from "lucide-react";
import { IoArrowBackOutline } from "react-icons/io5";
import useCommerceCashflow from "../useHooks";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import { getFilePathWithBackendUrl } from "@/utils/helpers/common/http-methods";
import { formatMoney } from "@/utils/helpers/models/purchases/purchase.dto";

const formatDate = (value?: string | Date | null) => {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "--";
  return parsed.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
};

const isImageReceipt = (url?: string) =>
  !!url && /\.(png|jpe?g|gif|webp)(\?|$)/i.test(url);

function DetailItem({
  icon,
  iconClass,
  label,
  value,
}: {
  icon: React.ReactNode;
  iconClass: string;
  label: string;
  value?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className={`p-2.5 rounded-lg shrink-0 ${iconClass}`}>{icon}</div>
      <div className="min-w-0">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
          {label}
        </span>
        <span className="text-sm font-semibold text-foreground mt-0.5 block break-words">
          {value === 0 || value ? value : "--"}
        </span>
      </div>
    </div>
  );
}

export default function CommerceCashflowView() {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const { getInById, getOutById } = useCommerceCashflow();
  const isCashOut = type === "out";
  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const load = isCashOut ? getOutById : getInById;
    load(id, (data: any) => {
      setEntry(data);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, type]);

  if (loading) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        Loading entry...
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="p-8 text-center space-y-3">
        <p className="text-muted-foreground text-sm">Entry not found.</p>
        <button
          type="button"
          onClick={() => navigate(siteRoutes.commerceCashflow)}
          className="text-sm font-semibold text-primary hover:underline cursor-pointer"
        >
          Back to Cash In / Cash Out
        </button>
      </div>
    );
  }

  const receiptUrl = entry.media?.url
    ? getFilePathWithBackendUrl(entry.media.url)
    : null;
  const linkedPurchase = entry.purchase;
  const linkedSale = entry.sale;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(siteRoutes.commerceCashflow)}
            className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
            title="Back"
          >
            <IoArrowBackOutline size={20} className="stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-2xl text-foreground font-bold">
              {isCashOut ? "Cash Out Details" : "Cash In Details"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {entry.installment || "Installment"} · {formatDate(entry.entryDate)}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border ${
            isCashOut
              ? "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20"
              : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20"
          }`}
        >
          {isCashOut ? <ArrowUpCircle size={14} /> : <ArrowDownCircle size={14} />}
          {isCashOut ? "Cash Out" : "Cash In"}
        </span>
      </div>

      <hr className="border-border-main" />

      <div className="bg-card border border-border-main rounded-xl p-6 shadow-xs space-y-6">
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
          <DetailItem
            icon={<Wallet size={18} />}
            iconClass="bg-accent-bg text-accent-text"
            label="Party / Vendor"
            value={
              isCashOut
                ? entry.vendorName || linkedPurchase?.supplierName
                : entry.partyName || linkedSale?.customerName
            }
          />
          <DetailItem
            icon={<Hash size={18} />}
            iconClass="bg-info-bg text-info-text"
            label="Installment"
            value={entry.installment}
          />
          <DetailItem
            icon={<Coins size={18} />}
            iconClass={
              isCashOut
                ? "bg-rose-500/10 text-rose-600"
                : "bg-emerald-500/10 text-emerald-600"
            }
            label="Amount"
            value={formatMoney(entry.amount)}
          />
          <DetailItem
            icon={<Calendar size={18} />}
            iconClass="bg-info-bg text-info-text"
            label="Date"
            value={formatDate(entry.entryDate)}
          />
          <DetailItem
            icon={<User size={18} />}
            iconClass="bg-success-bg text-success-text"
            label="Entered By"
            value={entry.enteredBy}
          />
          <DetailItem
            icon={<Wallet size={18} />}
            iconClass="bg-warning-bg text-warning-text"
            label="Source of Payment"
            value={entry.paymentSource}
          />
          <DetailItem
            icon={<FileText size={18} />}
            iconClass="bg-panel-bg text-muted-foreground"
            label="Status"
            value={entry.status || "Resolved"}
          />
        </div>

        {entry.notes ? (
          <div className="border-t border-border-main pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
              Notes
            </p>
            <p className="text-sm text-foreground whitespace-pre-line">
              {entry.notes}
            </p>
          </div>
        ) : null}

        {receiptUrl ? (
          <div className="border-t border-border-main pt-4">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">
              Receipt
            </p>
            {isImageReceipt(receiptUrl) ? (
              <a href={receiptUrl} target="_blank" rel="noopener noreferrer">
                <img
                  src={receiptUrl}
                  alt="Receipt"
                  className="max-h-64 rounded-lg border border-border-main object-contain"
                />
              </a>
            ) : (
              <a
                href={receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <FileText size={16} />
                View receipt
              </a>
            )}
          </div>
        ) : null}

        {isCashOut && linkedPurchase?.id ? (
          <div className="border-t border-border-main pt-4 space-y-3">
            {Number(linkedPurchase.balanceDue || 0) <= 0.001 ? (
              <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 flex items-center gap-2">
                <CheckCircle2
                  size={16}
                  className="text-emerald-600 dark:text-emerald-400 shrink-0"
                />
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  Purchase settled — no remaining vendor due
                </p>
              </div>
            ) : (
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 flex items-center gap-2">
                <AlertCircle
                  size={16}
                  className="text-amber-600 dark:text-amber-400 shrink-0"
                />
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  Remaining due {formatMoney(linkedPurchase.balanceDue)}
                </p>
              </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Linked Purchase
                </p>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {linkedPurchase.supplierName} · {linkedPurchase.productName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Paid {formatMoney(linkedPurchase.amountPaid)}
                  {Number(linkedPurchase.balanceDue || 0) <= 0.001
                    ? " · Settled"
                    : ` · Due ${formatMoney(linkedPurchase.balanceDue)}`}
                </p>
              </div>
              <Link
                to={`/purchases/view/${linkedPurchase.id}`}
                className="text-sm font-bold text-primary hover:underline"
              >
                View Purchase
              </Link>
            </div>
          </div>
        ) : null}

        {!isCashOut && linkedSale?.id ? (
          <div className="border-t border-border-main pt-4 space-y-3">
            {Number(linkedSale.balance || 0) <= 0.001 &&
            Number(linkedSale.payment || 0) > 0 ? (
              <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/10 px-3 py-2.5 flex items-center gap-2">
                <CheckCircle2
                  size={16}
                  className="text-emerald-600 dark:text-emerald-400 shrink-0"
                />
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  Sale settled — no remaining customer balance
                </p>
              </div>
            ) : Number(linkedSale.balance || 0) > 0.001 ? (
              <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 flex items-center gap-2">
                <AlertCircle
                  size={16}
                  className="text-amber-600 dark:text-amber-400 shrink-0"
                />
                <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
                  Remaining balance {formatMoney(linkedSale.balance)}
                </p>
              </div>
            ) : null}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
                  Linked Sale
                </p>
                <p className="text-sm font-semibold text-foreground mt-0.5">
                  {linkedSale.customerName || "Sale"} · {linkedSale.productName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Paid {formatMoney(linkedSale.payment)}
                  {Number(linkedSale.balance || 0) <= 0.001
                    ? " · Settled"
                    : ` · Balance ${formatMoney(linkedSale.balance)}`}
                </p>
              </div>
              <Link
                to={`/sales/view/${linkedSale.id}`}
                className="text-sm font-bold text-primary hover:underline"
              >
                View Sale
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
