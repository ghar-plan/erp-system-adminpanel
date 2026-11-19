import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ShoppingCart, ReceiptText, Wallet } from "lucide-react";
import SaleCreate from "@/containers/main/sales/create";
import PurchaseCreate from "@/containers/main/purchases/create";
import SalesListing from "@/containers/main/sales/listing";
import PurchasesListing from "@/containers/main/purchases/listing";
import CommerceCashflow from "@/containers/main/commerce-cashflow";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";

type CommerceTab = "sales" | "purchases" | "cashflow";

export default function CommerceHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermission, hasAnyPermission } = usePermissions();

  const canSalesCreate = hasPermission(PERMISSIONS.SALES_CREATE);
  const canSalesRead = hasPermission(PERMISSIONS.SALES_READ);
  const canSales = canSalesCreate || canSalesRead;

  const canPurchasesCreate = hasPermission(PERMISSIONS.PURCHASES_CREATE);
  const canPurchasesRead = hasPermission(PERMISSIONS.PURCHASES_READ);
  const canPurchases = canPurchasesCreate || canPurchasesRead;

  const canCashflow = hasAnyPermission([
    PERMISSIONS.COMMERCE_CASH_FLOW_READ,
    PERMISSIONS.COMMERCE_CASH_FLOW_IN,
    PERMISSIONS.COMMERCE_CASH_FLOW_OUT,
    PERMISSIONS.SALES_READ,
    PERMISSIONS.PURCHASES_READ,
  ]);

  const tabs = useMemo(() => {
    const list: Array<{
      id: CommerceTab;
      label: string;
      icon: typeof ShoppingCart;
    }> = [];
    if (canSales) {
      list.push({ id: "sales", label: "Sale", icon: ShoppingCart });
    }
    if (canPurchases) {
      list.push({ id: "purchases", label: "Purchase", icon: ReceiptText });
    }
    if (canCashflow) {
      list.push({ id: "cashflow", label: "Cash In / Cash Out", icon: Wallet });
    }
    return list;
  }, [canSales, canPurchases, canCashflow]);

  const requested = (searchParams.get("tab") || "sales") as CommerceTab;
  const activeTab: CommerceTab =
    tabs.find((t) => t.id === requested)?.id || tabs[0]?.id || "sales";

  const setTab = (tab: CommerceTab) => {
    setSearchParams(tab === "sales" ? {} : { tab }, { replace: true });
  };

  if (!tabs.length) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        You do not have permission to view sales, purchases, or cashflow.
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-center gap-2 border-b border-border-main pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setTab(tab.id)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-t-lg border-b-2 transition-all cursor-pointer ${
                isActive
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div key={activeTab}>
        {activeTab === "sales" ? (
          canSalesCreate ? (
            <SaleCreate />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  You can view sales. Create permission is required to record a
                  new sale.
                </p>
                <Link
                  to={siteRoutes.salesList}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Open full sales list
                </Link>
              </div>
              <SalesListing />
            </div>
          )
        ) : null}
        {activeTab === "purchases" ? (
          canPurchasesCreate ? (
            <PurchaseCreate />
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">
                  You can view purchases. Create permission is required to
                  record a new purchase.
                </p>
                <Link
                  to={siteRoutes.purchasesList}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Open full purchases list
                </Link>
              </div>
              <PurchasesListing />
            </div>
          )
        ) : null}
        {activeTab === "cashflow" ? <CommerceCashflow /> : null}
      </div>
    </div>
  );
}
