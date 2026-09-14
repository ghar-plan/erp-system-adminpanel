import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Building2,
  Calendar,
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
} from "lucide-react";
import { IoArrowBackOutline } from "react-icons/io5";
import useCashflow from "../useHooks";
import { getFilePathWithBackendUrl } from "@/utils/helpers/common/http-methods";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";

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

  useEffect(() => {
    const load = async () => {
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
    load();
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

  return (
    <div className="space-y-6">
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
              {isCashOut ? "Cash Out Details" : "Cash In Details"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Full record of this transaction.
            </p>
          </div>
        </div>

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

      <hr className="border-border-main" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-up">
        <div className="app-card border border-border-main shadow-xs flex flex-col justify-center">
          <div className="flex items-center gap-4">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
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
              <p className="text-sm font-semibold text-muted-foreground">
                Transaction Type
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                {transactionType}
              </h3>
            </div>
          </div>
        </div>

        <div className="app-card border border-border-main shadow-xs flex flex-col justify-center md:col-span-2">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success-bg flex items-center justify-center text-success-text">
              <Wallet size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                {isCashOut ? "Total Amount (PKR)" : "Amount Received (PKR)"}
              </p>
              <h3 className="text-2xl font-bold text-foreground">
                {formatMoney(totalAmount).replace("PKR ", "")}
              </h3>
            </div>
          </div>
        </div>
      </div>

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
              icon={<Hash size={20} />}
              iconClass="bg-panel-bg text-muted-foreground border border-panel-border"
              label="Cheque No"
              value={entry.chequeNo}
            />
            <DetailItem
              icon={<Hash size={20} />}
              iconClass="bg-panel-bg text-muted-foreground border border-panel-border"
              label="Transaction ID"
              value={entry.transactionId}
            />

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
                  icon={<Layers size={20} />}
                  iconClass="bg-info-bg text-info-text"
                  label="Activity"
                  value={entry.activity?.name}
                />
                <DetailItem
                  icon={<Layers size={20} />}
                  iconClass="bg-accent-bg text-accent-text"
                  label="Work Stage"
                  value={entry.activity?.workStage}
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
                  label="Total"
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

      <div className="app-card border border-border-main max-w-4xl shadow-xs animate-slide-up">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Payment Receipt
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Uploaded receipt attached to this transaction.
            </p>
          </div>
          <hr className="border-border-main" />

          {receiptUrl ? (
            isImageReceipt(receiptUrl) ? (
              <a
                href={receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl overflow-hidden border border-border-main max-w-lg"
              >
                <img
                  src={receiptUrl}
                  alt="Payment receipt"
                  className="w-full max-h-[420px] object-contain bg-panel-bg"
                />
              </a>
            ) : (
              <a
                href={receiptUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 p-4 rounded-xl border border-border-main bg-panel-bg hover:border-primary/40 transition-colors"
              >
                <div className="h-12 w-12 rounded-md bg-primary/10 text-primary flex items-center justify-center">
                  <FileText size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">
                    Receipt attached
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Click to open the uploaded file
                  </p>
                </div>
              </a>
            )
          ) : (
            <p className="text-sm font-semibold text-muted-foreground">
              No receipt uploaded.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
