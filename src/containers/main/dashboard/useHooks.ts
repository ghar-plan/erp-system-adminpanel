import { Dashboard_APIS } from "@/libs/apis/dashboard.api";
import { useState } from "react";

export type DashboardAnalytics = {
  totalCashIn: number;
  totalCashOut: number;
  totalCost: number;
  netProfit: number;
  startDate?: string | null;
  endDate?: string | null;
};

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

  const getAnalytics = async (params: {
    startDate?: string;
    endDate?: string;
  } = {}) => {
    const response = await Dashboard_APIS.getAnalytics(params);
    const { status = false, data = null } = response || {};
    if (status && data) {
      setAnalytics(data);
      return data as DashboardAnalytics;
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
