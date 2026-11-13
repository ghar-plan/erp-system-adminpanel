import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import useCommerceCashflow from "./useHooks";
import CashInForm, { CommerceCashInFormInputs } from "./components/CashInForm";
import CashOutForm, {
  CommerceCashOutFormInputs,
} from "./components/CashOutForm";
import TransactionsTable from "./components/TransactionsTable";
import { CanIf } from "@/components/auth/Can";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";

export default function CommerceCashflow() {
  const { hasPermission } = usePermissions();
  const canRead =
    hasPermission(PERMISSIONS.SALES_READ) ||
    hasPermission(PERMISSIONS.PURCHASES_READ);
  const {
    getCombinedList,
    getOutstandingSales,
    getOutstandingPurchases,
    recordCashIn,
    recordCashOut,
  } = useCommerceCashflow();

  const [sales, setSales] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [submittingIn, setSubmittingIn] = useState(false);
  const [submittingOut, setSubmittingOut] = useState(false);
  const [filterType, setFilterType] = useState("ALL");
  const [filterSearch, setFilterSearch] = useState("");

  const refresh = async () => {
    await Promise.all([
      getCombinedList(setTransactions),
      getOutstandingSales(setSales),
      getOutstandingPurchases(setPurchases),
    ]);
  };

  useEffect(() => {
    if (!canRead) return;
    refresh();
  }, [canRead]);

  const handleCashIn = async (data: CommerceCashInFormInputs) => {
    setSubmittingIn(true);
    await recordCashIn(
      {
        saleId: data.saleId,
        installment: "Full Payment",
        amount: Number(data.amount),
        entryDate: data.entryDate,
        enteredBy: data.enteredBy,
        paymentSource: data.paymentSource,
        ...(data.mediaId ? { mediaId: data.mediaId } : {}),
      },
      () => refresh(),
    );
    setSubmittingIn(false);
  };

  const handleCashOut = async (data: CommerceCashOutFormInputs) => {
    setSubmittingOut(true);
    await recordCashOut(
      {
        purchaseId: data.purchaseId,
        installment: data.installment.trim(),
        amount: Number(data.amount),
        entryDate: data.entryDate,
        enteredBy: data.enteredBy,
        paymentSource: data.paymentSource,
        ...(data.mediaId ? { mediaId: data.mediaId } : {}),
      },
      () => refresh(),
    );
    setSubmittingOut(false);
  };

  if (!canRead) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        You do not have permission to view commerce cashflow.
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Wallet size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">
            Commerce Cash In / Cash Out
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Settle sale receivables (Cash In) and purchase payables (Cash Out).
            Partial, credit, and advance balances adjust against the linked sale
            or purchase.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <CanIf
          permissions={[PERMISSIONS.SALES_CREATE, PERMISSIONS.SALES_UPDATE]}
          mode="any"
          fallback={
            <div className="rounded-xl border border-dashed border-border-main p-8 text-sm text-muted-foreground">
              Sales create/update permission required to record Cash In.
            </div>
          }
        >
          <CashInForm
            sales={sales}
            onSubmit={handleCashIn}
            submitting={submittingIn}
          />
        </CanIf>

        <CanIf
          permissions={[
            PERMISSIONS.PURCHASES_CREATE,
            PERMISSIONS.PURCHASES_UPDATE,
          ]}
          mode="any"
          fallback={
            <div className="rounded-xl border border-dashed border-border-main p-8 text-sm text-muted-foreground">
              Purchases create/update permission required to record Cash Out.
            </div>
          }
        >
          <CashOutForm
            purchases={purchases}
            onSubmit={handleCashOut}
            submitting={submittingOut}
          />
        </CanIf>
      </div>

      <TransactionsTable
        transactions={transactions}
        filterType={filterType}
        setFilterType={setFilterType}
        filterSearch={filterSearch}
        setFilterSearch={setFilterSearch}
      />
    </div>
  );
}
