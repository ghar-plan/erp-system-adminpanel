import React, { useState, useEffect } from "react";
import {
  X,
  CheckCircle2,
  Clock,
  Coins,
  Wallet,
  Building2,
  Users,
  FileText,
  AlertTriangle,
  History,
  ArrowRight,
  ShieldCheck,
  Calendar,
  User,
} from "lucide-react";
import Button from "@/components/ui/Button";
import useCashflow from "../useHooks";
import useEmployees from "@/containers/main/employees/useHooks";

interface ResolvePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: any;
  onSuccess: () => void;
  employees?: Array<{ id: string; name: string }>;
}

const INSTALLMENT_OPTIONS = [
  "1st Installment",
  "2nd Installment",
  "3rd Installment",
  "4th Installment",
  "5th Installment",
  "6th Installment",
  "7th Installment",
  "8th Installment",
  "9th Installment",
  "10th Installment",
  "Full / Final Payment (All Remaining)",
];

const PAYMENT_SOURCES = [
  "Cash",
  "Online Transfer",
  "Cheque",
];

export default function ResolvePaymentModal({
  isOpen,
  onClose,
  transaction,
  onSuccess,
  employees = [],
}: ResolvePaymentModalProps) {
  const { recordInstallment, getInstallments } = useCashflow();
  const { getAllEmployees } = useEmployees();

  const [installments, setInstallments] = useState<any[]>([]);
  const [employeeList, setEmployeeList] = useState<any[]>(employees);
  const [selectedInstallment, setSelectedInstallment] = useState<string>("2nd Installment");
  const [amount, setAmount] = useState<string>("");
  const [entryDate, setEntryDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [enteredBy, setEnteredBy] = useState<string>("");
  const [paymentSource, setPaymentSource] = useState<string>("Cash");
  const [notes, setNotes] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (employees && employees.length > 0) {
      setEmployeeList(employees);
    } else {
      getAllEmployees(setEmployeeList);
    }
  }, [employees]);

  // Calculate totals
  const totalAmount = Number(transaction?.amount || 0);
  const paidAmount = Number(
    transaction?.paidAmount !== undefined && transaction?.paidAmount !== null
      ? transaction?.paidAmount
      : transaction?.paymentSource === "Credit"
      ? 0
      : totalAmount
  );
  const remainingAmount = Math.max(0, totalAmount - paidAmount);

  // Load installments history
  useEffect(() => {
    if (isOpen && transaction?.id) {
      getInstallments(transaction.id, (data: any[]) => {
        setInstallments(data || []);
        // Determine default next installment
        const count = data?.length || 0;
        if (count === 0) {
          setSelectedInstallment("1st Installment");
        } else if (count === 1) {
          setSelectedInstallment("2nd Installment");
        } else if (count === 2) {
          setSelectedInstallment("3rd Installment");
        } else if (count === 3) {
          setSelectedInstallment("4th Installment");
        } else if (count === 4) {
          setSelectedInstallment("5th Installment");
        } else if (count === 5) {
          setSelectedInstallment("6th Installment");
        } else if (count >= 10) {
          setSelectedInstallment("Full / Final Payment (All Remaining)");
        } else {
          setSelectedInstallment(`${count + 1}th Installment`);
        }
      });
      setAmount("");
      setEnteredBy(transaction?.enteredBy || "");
      setPaymentSource("Cash");
      setNotes("");
      setError(null);
      setEntryDate(new Date().toISOString().split("T")[0]);
    }
  }, [isOpen, transaction?.id]);

  const isFullOrAll =
    selectedInstallment === "Full / Final Payment (All Remaining)" ||
    selectedInstallment.toLowerCase().startsWith("full") ||
    selectedInstallment.toLowerCase().startsWith("all");

  const numericAmount = isFullOrAll ? remainingAmount : Number(amount) || 0;

  // Validation
  useEffect(() => {
    if (isFullOrAll) {
      setError(null);
      return;
    }
    if (numericAmount > remainingAmount) {
      setError(
        `Installment amount (PKR ${numericAmount.toLocaleString()}) cannot exceed the remaining balance of PKR ${remainingAmount.toLocaleString()}`
      );
    } else if (numericAmount <= 0 && amount !== "") {
      setError("Please enter an amount greater than 0");
    } else {
      setError(null);
    }
  }, [numericAmount, remainingAmount, isFullOrAll, amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction?.id) return;

    if (!enteredBy) {
      setError("Please select an employee in Entered By");
      return;
    }

    if (!isFullOrAll && (!numericAmount || numericAmount <= 0)) {
      setError("Please enter a valid installment amount");
      return;
    }

    if (numericAmount > remainingAmount) {
      setError(
        `Installment amount cannot exceed remaining balance of PKR ${remainingAmount.toLocaleString()}`
      );
      return;
    }

    setLoading(true);
    try {
      const payload = {
        installment: selectedInstallment,
        amount: isFullOrAll ? remainingAmount : numericAmount,
        entryDate,
        enteredBy,
        paymentSource,
        notes,
        isFullPayment: isFullOrAll,
      };

      const res = await recordInstallment(transaction.id, payload);
      if (res?.status) {
        onSuccess();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !transaction) return null;

  const newPaidAmount = paidAmount + numericAmount;
  const newRemainingAmount = Math.max(0, remainingAmount - numericAmount);
  const willBeResolved = newRemainingAmount === 0;

  const isFullySettled = remainingAmount <= 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-card border border-border-main rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl animate-scale-up my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border-main flex items-center justify-between bg-muted-foreground/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Coins size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                {isFullySettled
                  ? "Payment Details & Installment History"
                  : "Resolve Payment & Record Installment"}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {transaction.vendorClient || "Vendor"} • {transaction.project || "Project"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Transaction Metadata & Decided Value Card */}
          <div className="bg-muted-foreground/5 border border-border-main rounded-xl p-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Building2 size={14} className="text-primary" />
                <span>Project: <strong className="text-foreground">{transaction.project || "--"}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <Users size={14} className="text-warning-text" />
                <span>Vendor: <strong className="text-foreground">{transaction.vendorClient || "--"}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <FileText size={14} className="text-info-text" />
                <span>Item: <strong className="text-foreground">{transaction.description || "--"}</strong></span>
              </div>
            </div>

            {/* Financial Status Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-border-main">
              <div className="p-3 rounded-lg bg-card border border-border-main flex flex-col">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total Decided
                </span>
                <span className="text-base font-bold text-foreground mt-1">
                  PKR {totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex flex-col">
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 size={12} /> Paid So Far
                </span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                  PKR {paidAmount.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-col">
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock size={12} /> Remaining Due
                </span>
                <span className="text-base font-bold text-amber-600 dark:text-amber-400 mt-1">
                  PKR {remainingAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Previous Installment History (if any) */}
          {installments && installments.length > 0 && (
            <div className="border border-border-main rounded-xl p-4 bg-card space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <History size={14} className="text-primary" />
                  Installment History ({installments.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs divide-y divide-border-main">
                  <thead className="bg-muted-foreground/5 text-muted-foreground font-semibold">
                    <tr>
                      <th className="py-2 px-3 text-left">Installment</th>
                      <th className="py-2 px-3 text-left">Date</th>
                      <th className="py-2 px-3 text-left">Source</th>
                      <th className="py-2 px-3 text-left">Entered By</th>
                      <th className="py-2 px-3 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-main text-foreground">
                    {installments.map((inst, idx) => (
                      <tr key={inst.id || idx} className="hover:bg-muted-foreground/5">
                        <td className="py-2 px-3 font-semibold text-primary">
                          {inst.installment || `Installment #${idx + 1}`}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {inst.entryDate ? new Date(inst.entryDate).toLocaleDateString() : "--"}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {inst.paymentSource || "--"}
                        </td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {inst.enteredBy || "--"}
                        </td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                          PKR {Number(inst.amount).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* If fully settled, show resolved message only; otherwise show installment form */}
          {isFullySettled ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2 animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-base font-bold text-emerald-700 dark:text-emerald-400">
                Payment Fully Settled & Resolved
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                This transaction has been paid in full with PKR 0.00 remaining balance. All installments have been completed.
              </p>
            </div>
          ) : (
            <form id="resolve-payment-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Installment Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Select Installment <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedInstallment}
                    onChange={(e) => setSelectedInstallment(e.target.value)}
                    className="common-input text-sm h-10 w-full bg-card cursor-pointer"
                    required
                  >
                    {INSTALLMENT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-muted-foreground">
                    Choose which installment or select Full/All to clear remaining.
                  </p>
                </div>

                {/* Installment Amount */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Installment Amount (PKR) <span className="text-red-500">*</span>
                  </label>
                  {isFullOrAll ? (
                    <div className="h-10 px-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                      <span>PKR {remainingAmount.toLocaleString()}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 uppercase tracking-wide">
                        Full Auto-Settlement
                      </span>
                    </div>
                  ) : (
                    <input
                      type="number"
                      min="1"
                      max={remainingAmount}
                      step="any"
                      placeholder={`Max: ${remainingAmount}`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="common-input text-sm h-10 w-full"
                      required
                    />
                  )}
                  <p className="text-[11px] text-muted-foreground">
                    {isFullOrAll
                      ? "Amount is automatically set to the full remaining balance."
                      : `Remaining balance: PKR ${remainingAmount.toLocaleString()}`}
                  </p>
                </div>

                {/* Date */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={12} /> Payment Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={(e) => setEntryDate(e.target.value)}
                    className="common-input text-sm h-10 w-full bg-card"
                    required
                  />
                </div>

                {/* Source of Payment */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
                    <Wallet size={12} /> Payment Source <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={paymentSource}
                    onChange={(e) => setPaymentSource(e.target.value)}
                    className="common-input text-sm h-10 w-full bg-card cursor-pointer"
                    required
                  >
                    {PAYMENT_SOURCES.map((src) => (
                      <option key={src} value={src}>
                        {src}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Entered By */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
                    <User size={12} /> Entered By <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={enteredBy}
                    onChange={(e) => setEnteredBy(e.target.value)}
                    className="common-input text-sm h-10 w-full bg-card cursor-pointer"
                    required
                  >
                    <option value="">Select employee</option>
                    {employeeList.map((emp) => (
                      <option key={emp.id} value={emp.name}>
                        {emp.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Notes */}
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Notes / Remarks
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Optional notes or cheque / transfer reference details..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="common-input text-sm w-full py-2"
                  />
                </div>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2 animate-shake">
                  <AlertTriangle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Live Calculation Preview Banner */}
              {numericAmount > 0 && !error && (
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <span className="flex items-center gap-1.5 text-primary">
                      <ShieldCheck size={16} /> Calculation Preview After Payment
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        willBeResolved
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-amber-500/20 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {willBeResolved ? "Status: Resolved" : "Status: Pending"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-foreground font-semibold pt-1 border-t border-primary/10">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">New Total Paid:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        PKR {newPaidAmount.toLocaleString()}
                      </strong>
                    </div>
                    <ArrowRight size={14} className="text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Remaining Balance:</span>
                      <strong className={willBeResolved ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}>
                        PKR {newRemainingAmount.toLocaleString()}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-border-main bg-muted-foreground/5 flex items-center justify-end gap-3">
          {isFullySettled ? (
            <Button
              type="button"
              variant="primary"
              onClick={onClose}
              className="h-10 text-xs px-6 font-semibold"
            >
              Close
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
                className="h-10 text-xs px-5 font-semibold"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="resolve-payment-form"
                variant="primary"
                disabled={loading || !!error || (!isFullOrAll && numericAmount <= 0)}
                className="h-10 text-xs px-6 font-semibold flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : willBeResolved ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Coins size={16} />
                )}
                <span>
                  {isFullOrAll
                    ? "Settle Full & Resolve"
                    : willBeResolved
                    ? "Record Final & Resolve"
                    : "Record Installment"}
                </span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
