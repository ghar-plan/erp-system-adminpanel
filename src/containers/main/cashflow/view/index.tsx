import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
  Download,
  FileText,
  Hash,
  Landmark,
  Layers,
  Loader2,
  Package,
  User,
  Users,
  Wallet,
  Briefcase,
  History,
} from "lucide-react";
import { IoArrowBackOutline } from "react-icons/io5";
import useCashflow from "../useHooks";
import { getFilePathWithBackendUrl } from "@/utils/helpers/common/http-methods";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import ResolvePaymentModal from "../components/ResolvePaymentModal";

const formatMoney = (value?: number | string | null) => {
  const amount = Number(value);
  if (value === null || value === undefined || Number.isNaN(amount)) {
    return "--";
  }
  return `PKR ${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (value?: string | Date | null) => {
  if (!value) return "--";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "--";
  return parsed.toLocaleDateString("en-US", {
    month: "short",
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

export default function CashflowView() {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const { getCashInById, getCashOutById, downloadReceipt } = useCashflow();

  const isCashOut = type === "out";
  const transactionType = isCashOut ? "CASH OUT" : "CASH IN";

  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);

  const loadData = async () => {
    if (!id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    if (isCashOut) {
      await getCashOutById(id, setEntry);
    } else {
      await getCashInById(id, setEntry);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id, type]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="animate-spin mr-2" size={22} />
        <span className="text-sm font-semibold">Loading transaction...</span>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={() => navigate(siteRoutes.cashflow)}
          className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
          title="Go Back"
        >
          <IoArrowBackOutline size={20} className="stroke-[2.5]" />
        </button>
        <p className="text-sm font-semibold text-muted-foreground">
          Transaction not found.
        </p>
      </div>
    );
  }

  const receiptUrl = entry.media?.url
    ? getFilePathWithBackendUrl(entry.media.url)
    : "";
  const unitPrice = Number(entry.amount);
  const quantity = Number(entry.quantity || 1);
  const totalAmount = isCashOut ? unitPrice * quantity : unitPrice;
  const status = entry.status || (entry.paymentSource === "Credit" || entry.paymentSource === "Partial" ? "Pending" : "Resolved");
  const isPending = status === "Pending";

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(siteRoutes.cashflow)}
            className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
            title="Go Back"
          >
            <IoArrowBackOutline size={20} className="stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-2xl text-foreground font-bold leading-tight">
              {isCashOut ? "Cash Out / Material In Details" : "Cash In Details"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Full record of this transaction.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isCashOut && (
            <Can permission={PERMISSIONS.CASH_FLOW_UPDATE}>
              <button
                type="button"
                onClick={() => setIsResolveModalOpen(true)}
                className={`flex h-10 px-4 items-center justify-center gap-2 rounded-md font-semibold text-sm transition-all cursor-pointer shadow-sm ${
                  isPending
                    ? "bg-amber-600 hover:bg-amber-700 text-white"
                    : "bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                }`}
              >
                <Coins size={16} />
                {isPending ? "Resolve Payment" : "Add Installment"}
              </button>
            </Can>
          )}

          <Can permission={PERMISSIONS.CASH_FLOW_PRINT}>
            <button
              type="button"
              onClick={() => downloadReceipt(entry.id, transactionType)}
              className="flex h-10 px-5 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm"
            >
              <Download size={16} />
              Download Receipt
            </button>
          </Can>
        </div>
      </div>

      <hr className="border-border-main" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
        {/* Type & Status */}
        <div className="app-card border border-border-main shadow-xs flex flex-col justify-center">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                isCashOut
                  ? "bg-warning-bg text-warning-text"
                  : "bg-primary/10 text-primary"
              }`}
            >
              {isCashOut ? (
                <ArrowUpCircle size={24} />
              ) : (
                <ArrowDownCircle size={24} />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Type & Status
              </p>
              <h3 className="text-lg font-bold text-foreground mt-0.5">
                {transactionType}
              </h3>
              <div className="mt-1">
                {isPending ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    <Clock size={12} />
                    Pending
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <CheckCircle2 size={12} />
                    Resolved
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className="app-card border border-border-main shadow-xs flex flex-col justify-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success-bg flex items-center justify-center text-success-text shrink-0">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                {isCashOut ? "Total Decided (PKR)" : "Amount Received (PKR)"}
              </p>
              <h3 className="text-xl font-bold text-foreground mt-0.5">
                {formatMoney(totalAmount).replace("PKR ", "")}
              </h3>
              <span className="text-[11px] text-muted-foreground">
                Source: {entry.paymentSource || "--"}
              </span>
            </div>
          </div>
        </div>

        {/* Paid & Remaining breakdown for Partial / Credit */}
        {isCashOut && (entry.paymentSource === "Partial" || entry.paymentSource === "Credit") ? (
          <div className="app-card border border-border-main shadow-xs flex flex-col justify-center sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Coins size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Paid / Remaining Balance
                </p>
                <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    Paid: {formatMoney(entry.paidAmount || 0)}
                  </span>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                    Rem: {formatMoney(entry.remainingAmount ?? totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="app-card border border-border-main shadow-xs flex flex-col justify-center sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                <CheckCircle2 size={24} />
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                  Payment Balance
                </p>
                <h3 className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  Fully Settled (PKR 0.00 Due)
                </h3>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Fields */}
      <div className="app-card border border-border-main max-w-4xl shadow-xs animate-slide-up">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Transaction Details
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Every field recorded for this {isCashOut ? "expense" : "payment"}.
            </p>
          </div>
          <hr className="border-border-main" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailItem
              icon={<Calendar size={20} />}
              iconClass="bg-warning-bg text-warning-text"
              label="Date"
              value={formatDate(entry.entryDate || entry.date || entry.created_at)}
            />
            <DetailItem
              icon={<Building2 size={20} />}
              iconClass="bg-info-bg text-info-text"
              label="Project"
              value={entry.project?.siteName}
            />
            <DetailItem
              icon={<User size={20} />}
              iconClass="bg-accent-bg text-accent-text"
              label="Entered By"
              value={entry.enteredBy}
            />
            <DetailItem
              icon={<Landmark size={20} />}
              iconClass="bg-primary/10 text-primary"
              label="Source of Payment"
              value={entry.paymentSource}
            />
            <DetailItem
              icon={<Clock size={20} />}
              iconClass={isPending ? "bg-amber-500/10 text-amber-600" : "bg-emerald-500/10 text-emerald-600"}
              label="Status"
              value={
                <span className={`inline-flex items-center gap-1 font-bold ${isPending ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                  {isPending ? "Pending" : "Resolved"}
                </span>
              }
            />

            {/* If Partial or Credit, show paid and remaining amounts */}
            {isCashOut && (entry.paymentSource === "Partial" || entry.paymentSource === "Credit") && (
              <>
                <DetailItem
                  icon={<Coins size={20} />}
                  iconClass="bg-emerald-500/10 text-emerald-600"
                  label="Paid / First Installment"
                  value={formatMoney(entry.paidAmount || 0)}
                />
                <DetailItem
                  icon={<Coins size={20} />}
                  iconClass="bg-amber-500/10 text-amber-600"
                  label="Remaining Balance Due"
                  value={formatMoney(entry.remainingAmount ?? totalAmount)}
                />
              </>
            )}

            {entry.chequeNo && (
              <DetailItem
                icon={<Hash size={20} />}
                iconClass="bg-panel-bg text-muted-foreground border border-panel-border"
                label="Cheque No"
                value={entry.chequeNo}
              />
            )}
            {entry.transactionId && (
              <DetailItem
                icon={<Hash size={20} />}
                iconClass="bg-panel-bg text-muted-foreground border border-panel-border"
                label="Transaction ID"
                value={entry.transactionId}
              />
            )}

            {!isCashOut && (
              <>
                <DetailItem
                  icon={<FileText size={20} />}
                  iconClass="bg-success-bg text-success-text"
                  label="Installment"
                  value={entry.installment}
                />
                <DetailItem
                  icon={<Coins size={20} />}
                  iconClass="bg-success-bg text-success-text"
                  label="Amount"
                  value={formatMoney(entry.amount)}
                />
              </>
            )}

            {isCashOut && (
              <>
                <DetailItem
                  icon={<Users size={20} />}
                  iconClass="bg-success-bg text-success-text"
                  label="Vendor"
                  value={entry.vendor?.vendorName}
                />
                <DetailItem
                  icon={<Briefcase size={20} />}
                  iconClass="bg-primary/10 text-primary"
                  label="Job"
                  value={entry.job?.name || entry.activity?.name}
                />
                <DetailItem
                  icon={<Layers size={20} />}
                  iconClass="bg-accent-bg text-accent-text"
                  label="Work Stage"
                  value={entry.workStage?.name || entry.activity?.workStage}
                />
                <DetailItem
                  icon={<Package size={20} />}
                  iconClass="bg-warning-bg text-warning-text"
                  label="Category"
                  value={entry.category}
                />
                <DetailItem
                  icon={<Hash size={20} />}
                  iconClass="bg-primary/10 text-primary"
                  label="Quantity"
                  value={entry.quantity}
                />
                <DetailItem
                  icon={<Package size={20} />}
                  iconClass="bg-panel-bg text-muted-foreground border border-panel-border"
                  label="UOM (Unit)"
                  value={entry.uom}
                />
                <DetailItem
                  icon={<Coins size={20} />}
                  iconClass="bg-warning-bg text-warning-text"
                  label="Price (Per Item)"
                  value={formatMoney(entry.amount)}
                />
                <DetailItem
                  icon={<Wallet size={20} />}
                  iconClass="bg-success-bg text-success-text"
                  label="Total Decided Amount"
                  value={formatMoney(totalAmount)}
                />
              </>
            )}
          </div>

          {isCashOut && (
            <>
              <hr className="border-border-main" />
              <DetailItem
                icon={<FileText size={20} />}
                iconClass="bg-danger-bg text-danger-text"
                label="Item Name / Description"
                value={entry.items}
              />
            </>
          )}
        </div>
      </div>

      {/* Installments History Card */}
      {isCashOut && entry.installments && entry.installments.length > 0 && (
        <div className="app-card border border-border-main max-w-4xl shadow-xs animate-slide-up">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  <History size={20} className="text-primary" />
                  Installment Payments History
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Record of all partial/credit installments paid for this transaction.
                </p>
              </div>
            </div>
            <hr className="border-border-main" />

            <div className="overflow-x-auto rounded-lg border border-border-main">
              <table className="min-w-full text-xs divide-y divide-border-main">
                <thead className="bg-muted-foreground/5 text-muted-foreground font-bold">
                  <tr>
                    <th className="py-3 px-4 text-left">INSTALLMENT</th>
                    <th className="py-3 px-4 text-left">DATE</th>
                    <th className="py-3 px-4 text-left">SOURCE</th>
                    <th className="py-3 px-4 text-left">ENTERED BY</th>
                    <th className="py-3 px-4 text-left">NOTES</th>
                    <th className="py-3 px-4 text-right">AMOUNT PAID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main bg-card text-foreground">
                  {entry.installments.map((inst: any, idx: number) => (
                    <tr key={inst.id || idx} className="hover:bg-muted-foreground/5 transition-colors">
                      <td className="py-3 px-4 font-semibold text-primary">
                        {inst.installment || `Installment #${idx + 1}`}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {formatDate(inst.entryDate || inst.created_at)}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-muted-foreground/10 text-foreground font-semibold">
                          {inst.paymentSource || "--"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {inst.enteredBy || "--"}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground max-w-[200px] truncate">
                        {inst.notes || "--"}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {formatMoney(inst.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Payment Receipt */}
      <div className="app-card border border-border-main max-w-4xl shadow-xs animate-slide-up">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Payment Receipt
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Uploaded document or voucher image.
            </p>
          </div>
          <hr className="border-border-main" />

          {receiptUrl ? (
            <div className="space-y-4">
              {isImageReceipt(receiptUrl) ? (
                <div className="border border-border-main rounded-xl overflow-hidden bg-bg-input/50 p-2 inline-block">
                  <img
                    src={receiptUrl}
                    alt="Payment receipt preview"
                    className="max-h-96 w-auto rounded-lg object-contain"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl border border-border-main bg-card">
                  <FileText size={32} className="text-primary" />
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      Document Receipt Attached
                    </p>
                    <a
                      href={receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-primary hover:underline mt-1 inline-block"
                    >
                      Open receipt in new tab
                    </a>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm font-semibold text-muted-foreground">
              No receipt uploaded for this transaction.
            </p>
          )}
        </div>
      </div>

      {/* Resolve Payment Modal */}
      {isResolveModalOpen && entry && (
        <ResolvePaymentModal
          isOpen={isResolveModalOpen}
          onClose={() => setIsResolveModalOpen(false)}
          transaction={{
            id: entry.id,
            project: entry.project?.siteName,
            vendorClient: entry.vendor?.vendorName,
            description: entry.items,
            amount: totalAmount,
            paidAmount: entry.paidAmount,
            remainingAmount: entry.remainingAmount,
            enteredBy: entry.enteredBy,
            paymentSource: entry.paymentSource,
            status: entry.status,
          }}
          onSuccess={() => {
            loadData();
          }}
        />
      )}
    </div>
  );
}
