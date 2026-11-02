import { ProductLifespans_APIS } from "@/libs/apis/product-lifespans.api";
import { Gharplans_APIS } from "@/libs/apis/gharplans.api";
import {
  successToaster,
  errorToaster,
} from "@/utils/helpers/common/alert-service";
import {
  ProductLifespan,
  ProductLifespanAvailability,
} from "@/utils/helpers/models/product-lifespans/product-lifespan.dto";
import { extractSkusFromResponse } from "@/utils/helpers/models/product-sku-options";

const useTimeSpan = () => {
  const getProducts = async (
    setData: Function,
    params: any = {},
    setTotalElements?: Function,
  ) => {
    const response = await Gharplans_APIS.getProducts(params);
    const { status = false, data = [] } = response || {};
    if (status && data) {
      setData(extractSkusFromResponse(response));
      setTotalElements?.(response?.total ?? data.length);
    } else {
      setData([]);
      setTotalElements?.(0);
    }
  };

  const getLifespanMap = async (): Promise<Record<string, ProductLifespan>> => {
    const response = await ProductLifespans_APIS.getMap();
    const { status = false, data = null } = response || {};
    if (status && data) {
      return data as Record<string, ProductLifespan>;
    }
    return {};
  };

  const getByProduct = async (
    productId: string,
    variantId: string = "",
  ): Promise<ProductLifespanAvailability | null> => {
    if (!productId) return null;
    const response = await ProductLifespans_APIS.getByProduct(
      productId,
      variantId,
    );
    const { status = false, data = null } = response || {};
    if (status && data) return data as ProductLifespanAvailability;
    return null;
  };

  const upsertLifespan = async (body: {
    productId: string;
    productName: string;
    variantId: string;
    variantName: string | null;
    years?: number;
    months?: number;
    days?: number;
  }) => {
    const response = await ProductLifespans_APIS.upsert(body);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Time span saved");
      return true;
    }
    if (!response?.error) {
      errorToaster(message || "Failed to save time span");
    }
    return false;
  };

  const clearLifespan = async (productId: string, variantId: string = "") => {
    const response = await ProductLifespans_APIS.clear(productId, variantId);
    const { status = false, message = "" } = response || {};
    if (status) {
      successToaster(message || "Set to lifetime");
      return true;
    }
    return false;
  };

  return {
    getProducts,
    getLifespanMap,
    getByProduct,
    upsertLifespan,
    clearLifespan,
  };
};

export default useTimeSpan;
