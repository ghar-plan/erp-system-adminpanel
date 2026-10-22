import { Dashboard_APIS } from "@/libs/apis/dashboard.api";
import { useState } from "react";

export type ModuleAnalytics = {
  totalCashIn: number;
  totalCashOut: number;
  totalCost: number;
  netProfit: number;
  netLoss: number;
  totalSale?: number;
};

export type DashboardAnalytics = {
  construction: ModuleAnalytics;
  shop: ModuleAnalytics;
  design: ModuleAnalytics;
  consolidation: ModuleAnalytics;
  startDate?: string | null;
  endDate?: string | null;
};

const emptyModule = (): ModuleAnalytics => ({
  totalCashIn: 0,
  totalCashOut: 0,
  totalCost: 0,
  netProfit: 0,
  netLoss: 0,
  totalSale: 0,
});

const useDashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);

  const getStats = async () => {
    const response = await Dashboard_APIS.getStats();
    const { status = false, data = null } = response || {};
    if (status && data) {
      setStats(data);
    }
  };

  const getAnalytics = async (
    params: {
      startDate?: string;
      endDate?: string;
    } = {},
  ) => {
    const response = await Dashboard_APIS.getAnalytics(params);
    const { status = false, data = null } = response || {};
    if (status && data) {
      const normalized: DashboardAnalytics = {
        construction: data.construction || emptyModule(),
        shop: data.shop || emptyModule(),
        design: data.design || emptyModule(),
        consolidation: data.consolidation || emptyModule(),
        startDate: data.startDate ?? null,
        endDate: data.endDate ?? null,
      };
      setAnalytics(normalized);
      return normalized;
    }
    return null;
  };

  return {
    stats,
    analytics,
    getStats,
    getAnalytics,
  };
};

export default useDashboard;
