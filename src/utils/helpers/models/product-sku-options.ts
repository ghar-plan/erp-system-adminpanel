import { Gharplans_APIS } from "@/libs/apis/gharplans.api";
import type { ProductSearchOption } from "@/components/ui/ProductSearchSelect";
import {
  ProductSku,
  flattenProductsToSkus,
} from "@/utils/helpers/models/product-sku";

const formatPkr = (value: number) =>
  `PKR ${value.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;

/** "unit · weight · N colors" (optionally prefixed with "PKR x"). */
export const formatSkuDetails = (
  sku: ProductSku,
  options: { includePrice?: boolean } = {},
): string => {
  const parts: string[] = [];
  if (options.includePrice && sku.price !== null) {
    parts.push(formatPkr(sku.price));
  }
  if (sku.unit) parts.push(sku.unit);
  if (sku.weight) parts.push(sku.weight);
  if (sku.colorCount > 0) {
    parts.push(`${sku.colorCount} ${sku.colorCount === 1 ? "color" : "colors"}`);
  }
  return parts.join(" · ");
};

/** Prefer API `skus`; fall back to flattening raw `data` products client-side. */
export const extractSkusFromResponse = (response: any): ProductSku[] => {
  const skus = response?.skus;
  if (Array.isArray(skus) && skus.length > 0) return skus as ProductSku[];
  const products = Array.isArray(response?.data) ? response.data : [];
  return flattenProductsToSkus(products);
};

export const skuToSearchOption = (sku: ProductSku): ProductSearchOption => ({
  id: sku.skuKey,
  name: sku.label,
  productName: sku.productName,
  productId: sku.productId,
  variantId: sku.variantId,
  variantName: sku.variantName ?? "",
  meta: formatSkuDetails(sku, { includePrice: true }) || undefined,
});

/**
 * Loads Gharplans products and returns flattened SKU options for
 * `ProductSearchSelect` (used by purchase / sale / document create).
 * `total` is the product count from the API (pagination is product-based);
 * `consumed` is the number of products fetched for this page.
 */
export const loadGharplansSkuOptions = async (params: {
  name?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  products: ProductSearchOption[];
  total: number;
  consumed: number;
}> => {
  const response = await Gharplans_APIS.getProducts(params);
  const rawProducts = Array.isArray(response?.data) ? response.data : [];
  const skus = extractSkusFromResponse(response);
  return {
    products: skus.map(skuToSearchOption),
    total: response?.total ?? rawProducts.length,
    consumed: rawProducts.length || skus.length,
  };
};

/** Product-only options (no variant expansion) for the first dropdown. */
export const loadGharplansProductOptions = async (params: {
  name?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  products: ProductSearchOption[];
  total: number;
  consumed: number;
  rawProducts: any[];
}> => {
  const response = await Gharplans_APIS.getProducts(params);
  const rawProducts = Array.isArray(response?.data) ? response.data : [];
  return {
    products: rawProducts.map((p: any) => ({
      id: String(p.id),
      name: String(p.name || p.id),
      productId: String(p.id),
      productName: String(p.name || p.id),
      variantId: "",
      variantName: "",
      meta: Array.isArray(p.variants)
        ? `${p.variants.length} ${p.variants.length === 1 ? "variant" : "variants"}`
        : undefined,
    })),
    total: response?.total ?? rawProducts.length,
    consumed: rawProducts.length,
    rawProducts,
  };
};

/** Variant options for a single product (from a loaded product object). */
export const variantsToSearchOptions = (
  product: any,
): ProductSearchOption[] => {
  const skus = flattenProductsToSkus(product ? [product] : []);
  return skus.map(skuToSearchOption);
};
