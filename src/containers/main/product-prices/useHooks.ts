import { ProductPrices_APIS } from "@/libs/apis/product-prices.api";
import { Gharplans_APIS } from "@/libs/apis/gharplans.api";
import {
  successToaster,
  errorToaster,
} from "@/utils/helpers/common/alert-service";
import {
  ProductPrice,
  ProductPriceHistory,
} from "@/utils/helpers/models/product-prices/product-price.dto";
import { extractSkusFromResponse } from "@/utils/helpers/models/product-sku-options";

const useProductPrices = () => {
  const getProducts = async (
    setData: Function,
    params: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Gharplans_APIS.getProducts(params);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      // One row per SKU (variant); pagination stays product-based.
      setData(extractSkusFromResponse(response));
      setTotalElements?.(response?.total ?? data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const getPriceMap = async (): Promise<Record<string, ProductPrice>> => {
    const response = await ProductPrices_APIS.getMap();
    const { status = false, data = null } = response || {};
    if (status && data) {
      return data as Record<string, ProductPrice>;
    }
    return {};
  };

  const getHistory = async (
    productId: string,
    variantId: string = "",
  ): Promise<ProductPriceHistory[]> => {
    if (!productId) return [];
    const response = await ProductPrices_APIS.getHistory(productId, variantId);
    const { status = false, data = [] } = response || {};
    if (status && Array.isArray(data)) return data as ProductPriceHistory[];
    return [];
  };

  const upsertPrice = async (body: {
    productId: string;
    productName: string;
    variantId: string;
    variantName: string | null;
    rate: number;
    effectiveFrom?: string;
  }) => {
    const response = await ProductPrices_APIS.upsert(body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Product price saved");
      return true;
    }
    if (!response?.error) {
      errorToaster(message || "Failed to save product price");
    }
    return false;
  };

  const clearPrice = async (productId: string, variantId: string = "") => {
    const response = await ProductPrices_APIS.clear(productId, variantId);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Product price removed");
      return true;
    }
    return false;
  };

  return {
    getProducts,
    getPriceMap,
    getHistory,
    upsertPrice,
    clearPrice,
  };
};

export default useProductPrices;
