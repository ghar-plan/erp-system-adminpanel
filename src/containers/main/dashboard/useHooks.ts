import { Dashboard_APIS } from "@/libs/apis/dashboard.api";
import { useState } from "react";

const useDashboard = () => {
  const [stats, setStats] = useState<any>(null);

  const getStats = async () => {
    const response = await Dashboard_APIS.getStats();
    const { status = false, data = null } = response || {};
    if (status && data) {
      setStats(data);
    }
  };

  return {
    stats,
    getStats,
  };
};

export default useDashboard;
