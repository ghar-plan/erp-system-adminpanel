import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Tag, Timer } from "lucide-react";
import ProductPricesListing from "@/containers/main/product-prices/listing";
import TimeSpanListing from "@/containers/main/time-span/listing";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";

type CatalogTab = "prices" | "timespan";

export default function ProductCatalogHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasPermission } = usePermissions();

  const canPrices = hasPermission(PERMISSIONS.PRODUCT_PRICES_READ);
  const canTimeSpan = hasPermission(PERMISSIONS.PRODUCT_LIFESPANS_READ);

  const tabs = useMemo(() => {
    const list: Array<{
      id: CatalogTab;
      label: string;
      icon: typeof Tag;
    }> = [];
    if (canPrices) {
      list.push({ id: "prices", label: "Product Prices", icon: Tag });
    }
    if (canTimeSpan) {
      list.push({ id: "timespan", label: "Time Span", icon: Timer });
    }
    return list;
  }, [canPrices, canTimeSpan]);

  const requested = (searchParams.get("tab") || "prices") as CatalogTab;
  const activeTab: CatalogTab =
    tabs.find((t) => t.id === requested)?.id || tabs[0]?.id || "prices";

  const setTab = (tab: CatalogTab) => {
    setSearchParams(tab === "prices" ? {} : { tab }, { replace: true });
  };

  if (!tabs.length) {
    return (
      <div className="p-8 text-center text-muted-foreground text-sm">
        You do not have permission to view product prices or time span.
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
        {activeTab === "prices" ? <ProductPricesListing /> : null}
        {activeTab === "timespan" ? <TimeSpanListing /> : null}
      </div>
    </div>
  );
}
