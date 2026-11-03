import React, { useEffect, useState } from "react";
import {
  X,
  Building2,
  Banknote,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import Button from "@/components/ui/Button";
import useSales from "../useHooks";
import { useAppSelector } from "@/store/hooks";
import { getLoggedInUserDisplayName } from "@/utils/helpers/common/logged-in-user";
import { formatMoney } from "@/utils/helpers/models/purchases/purchase.dto";
import { formatSaleProductsLabel } from "@/utils/helpers/models/sales/sale.dto";

interface RemitPickupPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: any;
  onSuccess: () => void;
}

export default function RemitPickupPointModal({
  isOpen,
  onClose,
  sale,
  onSuccess,
}: RemitPickupPointModalProps) {
  const { remitPickupPoint } = useSales();
  const storeUser = useAppSelector((state) => state.sharedReducer.userData);
  const loggedInName = getLoggedInUserDisplayName(storeUser);

  const [remittedAt, setRemittedAt] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [remittedBy, setRemittedBy] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const payment = Number(sale?.payment || 0);
  const pickupName = sale?.customerType?.name || "Pickup point";
  const customerLabel = sale?.customerName || "End customer";

  useEffect(() => {
    if (isOpen) {
      setRemittedAt(new Date().toISOString().split("T")[0]);
      setRemittedBy(loggedInName);
      setNotes("");
      setError(null);
    }
  }, [isOpen, loggedInName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sale?.id) return;
    if (!remittedAt) {
      setError("Remittance date is required");
      return;
    }
    if (payment <= 0) {
      setError("No payment available to remit");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await remitPickupPoint(sale.id, {
        remittedAt,
        remittedBy: remittedBy || loggedInName,
        remittanceNotes: notes || undefined,
      });
      if (res?.status) {
        onSuccess();
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !sale) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="bg-card border border-border-main rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-scale-up my-8">
        <div className="px-6 py-5 border-b border-border-main flex items-center justify-between bg-muted-foreground/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Building2 size={22} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Remit Payment to Pickup Point
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                {pickupName} · {formatSaleProductsLabel(sale)}
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

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-muted-foreground/5 border border-border-main rounded-xl p-4 space-y-2 text-sm">
            <p>
              <span className="text-muted-foreground">Pickup point:</span>{" "}
              <strong className="text-foreground">{pickupName}</strong>
            </p>
            <p>
              <span className="text-muted-foreground">Customer:</span>{" "}
              <strong className="text-foreground">{customerLabel}</strong>
            </p>
            <p className="flex items-center gap-2 pt-1">
              <Banknote size={14} className="text-emerald-600" />
              <span className="text-muted-foreground">Amount to remit:</span>{" "}
              <strong className="text-emerald-600 dark:text-emerald-400">
                {formatMoney(payment)}
              </strong>
            </p>
            <p className="text-xs text-muted-foreground pt-1">
              Customer paid Ghar Plans admin. Recording this marks that amount as
              paid onward to the pickup point for this order.
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
              <Calendar size={12} /> Remittance Date{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={remittedAt}
              onChange={(e) => setRemittedAt(e.target.value)}
              className="common-input text-sm h-10 w-full bg-card"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1">
              <User size={12} /> Recorded By{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              readOnly
              tabIndex={-1}
              value={remittedBy || loggedInName}
              className="common-input text-sm h-10 w-full bg-muted-foreground/10 cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground uppercase tracking-wider">
              Notes / Remarks
            </label>
            <textarea
              rows={2}
              placeholder="Optional transfer / cheque reference..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="common-input text-sm w-full py-2"
            />
          </div>

          {error ? (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold flex items-center gap-2">
              <AlertTriangle size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-3 pt-2">
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
              variant="primary"
              disabled={loading || payment <= 0}
              className="h-10 text-xs px-6 font-semibold flex items-center gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <CheckCircle2 size={16} />
              )}
              Confirm Remittance
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
