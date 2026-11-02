/** Empty string = product-level / legacy (no Gharplans variant). */
export const NO_VARIANT_ID = "";

export const normalizeVariantId = (
  variantId?: string | number | null,
): string => {
  if (variantId === null || variantId === undefined) return NO_VARIANT_ID;
  const s = String(variantId).trim();
  return s || NO_VARIANT_ID;
};

export const formatSkuLabel = (
  productName: string,
  variantName?: string | null,
): string => {
  const product = (productName || "").trim();
  const variant = (variantName || "").trim();
  if (!variant) return product || "—";
  if (!product) return variant;
  return `${product} · ${variant}`;
};

export const skuMapKey = (
  productId: string | number,
  variantId?: string | number | null,
): string => `${String(productId)}::${normalizeVariantId(variantId)}`;

export const parseSkuMapKey = (
  key: string,
): { productId: string; variantId: string } => {
  const sep = key.indexOf("::");
  if (sep < 0) {
    return { productId: key, variantId: NO_VARIANT_ID };
  }
  return {
    productId: key.slice(0, sep),
    variantId: normalizeVariantId(key.slice(sep + 2)),
  };
};

export type GharplansVariantLike = {
  id?: string | number;
  name?: string;
  price?: string | number;
  unit?: string | null;
  weight?: string | number | null;
  dimension?: string | null;
  colors?: Array<{ id?: string | number; color?: string }>;
  [key: string]: any;
};

export type GharplansProductLike = {
  id?: string | number;
  name?: string;
  brandId?: string | number | null;
  brandName?: string | null;
  brand?: { id?: string | number | null; name?: string | null } | null;
  variants?: GharplansVariantLike[];
  [key: string]: any;
};

export const extractProductBrand = (
  product?: GharplansProductLike | null,
): { brandId: string | null; brandName: string | null } => {
  if (!product) return { brandId: null, brandName: null };
  const rawId = product.brandId ?? product.brand?.id ?? null;
  const rawName = product.brandName ?? product.brand?.name ?? null;
  const brandId =
    rawId === null || rawId === undefined || String(rawId).trim() === ""
      ? null
      : String(rawId).trim();
  const brandName =
    typeof rawName === "string" && rawName.trim() ? rawName.trim() : null;
  return { brandId, brandName };
};

export type ProductSku = {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string | null;
  brandId: string | null;
  brandName: string | null;
  label: string;
  price: number | null;
  unit: string | null;
  weight: string | null;
  dimension: string | null;
  colorCount: number;
  skuKey: string;
};

export type ProductSkuGroup = {
  productId: string;
  productName: string;
  variants: ProductSku[];
  isMultiVariant: boolean;
};

/** Group flattened SKUs under their parent product (for accordion UIs). */
export const groupSkusByProduct = (skus: ProductSku[]): ProductSkuGroup[] => {
  const order: string[] = [];
  const map = new Map<string, ProductSkuGroup>();

  for (const sku of skus || []) {
    let group = map.get(sku.productId);
    if (!group) {
      group = {
        productId: sku.productId,
        productName: sku.productName,
        variants: [],
        isMultiVariant: false,
      };
      map.set(sku.productId, group);
      order.push(sku.productId);
    }
    group.variants.push(sku);
  }

  return order.map((id) => {
    const group = map.get(id)!;
    group.isMultiVariant = group.variants.length > 1;
    return group;
  });
};

export const flattenProductsToSkus = (
  products: GharplansProductLike[],
): ProductSku[] => {
  const skus: ProductSku[] = [];

  for (const product of products || []) {
    const productId = String(product?.id ?? "").trim();
    if (!productId) continue;
    const productName = String(product?.name || "").trim() || productId;
    const { brandId, brandName } = extractProductBrand(product);
    const variants = Array.isArray(product.variants) ? product.variants : [];

    if (!variants.length) {
      skus.push({
        productId,
        productName,
        variantId: NO_VARIANT_ID,
        variantName: null,
        brandId,
        brandName,
        label: productName,
        price: null,
        unit: null,
        weight: null,
        dimension: null,
        colorCount: 0,
        skuKey: skuMapKey(productId, NO_VARIANT_ID),
      });
      continue;
    }

    for (const variant of variants) {
      const variantId = normalizeVariantId(variant?.id);
      if (!variantId) continue;
      const variantName =
        String(variant?.name || "").trim() || `Variant ${variantId}`;
      const rawPrice = variant?.price;
      const priceNum =
        rawPrice === null || rawPrice === undefined || rawPrice === ""
          ? null
          : Number(rawPrice);

      skus.push({
        productId,
        productName,
        variantId,
        variantName,
        brandId,
        brandName,
        label: formatSkuLabel(productName, variantName),
        price: Number.isFinite(priceNum as number) ? (priceNum as number) : null,
        unit: variant?.unit != null ? String(variant.unit) : null,
        weight:
          variant?.weight != null && variant.weight !== ""
            ? String(variant.weight)
            : null,
        dimension:
          variant?.dimension != null && variant.dimension !== ""
            ? String(variant.dimension)
            : null,
        colorCount: Array.isArray(variant?.colors) ? variant.colors.length : 0,
        skuKey: skuMapKey(productId, variantId),
      });
    }
  }

  return skus;
};
