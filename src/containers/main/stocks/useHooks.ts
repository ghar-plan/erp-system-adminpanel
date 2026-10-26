import { Stocks_APIS } from "@/libs/apis/stocks.api";
import {
  StockAvailability,
  StockBatch,
} from "@/utils/helpers/models/stocks/stock.dto";

const useStocks = () => {
  const getStocks = async (
    setData: Function,
    params: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Stocks_APIS.getAll(params);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(data);
      setTotalElements?.(response?.total ?? data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const getStockByProduct = async (
    productId: string,
  ): Promise<StockAvailability | null> => {
    if (!productId) return null;
    const response = await Stocks_APIS.getByProduct(productId);
    const { status = false, data = null } = response || {};
    if (status && data) {
      return data as StockAvailability;
    }
    return null;
  };

  const getBatchesByProduct = async (
    productId: string,
  ): Promise<StockBatch[]> => {
    if (!productId) return [];
    const response = await Stocks_APIS.getBatchesByProduct(productId);
    const { status = false, data = [] } = response || {};
    if (status && Array.isArray(data)) {
      return data as StockBatch[];
    }
    return [];
  };

  return {
    getStocks,
    getStockByProduct,
    getBatchesByProduct,
  };
};

export default useStocks;
