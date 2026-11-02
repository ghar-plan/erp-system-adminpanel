import React, { useEffect, useMemo, useState } from "react";
import ProductSearchSelect, {
  ProductSearchOption,
  ProductSelectMeta,
} from "@/components/ui/ProductSearchSelect";
import {
  loadGharplansProductOptions,
  variantsToSearchOptions,
  formatSkuDetails,
} from "@/utils/helpers/models/product-sku-options";
import {
  extractProductBrand,
  flattenProductsToSkus,
  normalizeVariantId,
  ProductSku,
  skuMapKey,
} from "@/utils/helpers/models/product-sku";
import { Gharplans_APIS } from "@/libs/apis/gharplans.api";

export type ProductVariantValue = {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string | null;
  brandId?: string | null;
  brandName?: string | null;
  label: string;
  /** True when the product has multiple variants and none is picked yet. */
  requiresVariant?: boolean;
};

interface ProductVariantSelectProps {
  productId: string;
  productName?: string;
  variantId?: string;
  variantName?: string | null;
  onChange: (value: ProductVariantValue) => void;
  productError?: string;
  variantError?: string;
  disabled?: boolean;
  productPlaceholder?: string;
  variantPlaceholder?: string;
}

/**
 * Two-step picker: Product (search) → Variant (dropdown for that product).
 * Single-variant products auto-select the only variant.
 */
export default function ProductVariantSelect({
  productId,
  productName = "",
  variantId = "",
  variantName = null,
  onChange,
  productError,
  variantError,
  disabled = false,
  productPlaceholder = "Select a product",
  variantPlaceholder = "Select a variant",
}: ProductVariantSelectProps) {
  const [productCache, setProductCache] = useState<Record<string, any>>({});
  const [loadingVariants, setLoadingVariants] = useState(false);

  const selectedProduct = productCache[String(productId)] || null;

  const variantOptions: ProductSearchOption[] = useMemo(() => {
    if (!selectedProduct) return [];
    return variantsToSearchOptions(selectedProduct);
  }, [selectedProduct]);

  const skus: ProductSku[] = useMemo(() => {
    if (!selectedProduct) return [];
    return flattenProductsToSkus([selectedProduct]);
  }, [selectedProduct]);

  const ensureProductLoaded = async (id: string) => {
    if (!id || productCache[id]) return productCache[id] || null;
    setLoadingVariants(true);
    try {
      // Prefer name-scoped list (fast) over product-by-id (often 20s+ / flaky).
      const response = await Gharplans_APIS.getProducts({
        limit: 50,
        offset: 0,
        ...(productName ? { name: productName.slice(0, 40) } : {}),
      });
      const list = Array.isArray(response?.data) ? response.data : [];
      let found = list.find((p: any) => String(p.id) === String(id));
      if (!found && !productName) {
        const broad = await Gharplans_APIS.getProducts({
          limit: 100,
          offset: 0,
        });
        const broadList = Array.isArray(broad?.data) ? broad.data : [];
        found = broadList.find((p: any) => String(p.id) === String(id));
      }
      if (found) {
        setProductCache((prev) => ({ ...prev, [String(id)]: found }));
        return found;
      }
    } finally {
      setLoadingVariants(false);
    }
    return null;
  };

  useEffect(() => {
    if (productId && !productCache[String(productId)]) {
      ensureProductLoaded(String(productId));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const emitSku = (
    product: { id: string; name: string } & Record<string, any>,
    sku: ProductSku | null,
  ) => {
    const brand = extractProductBrand(product);
    if (!sku) {
      onChange({
        productId: product.id,
        productName: product.name,
        variantId: "",
        variantName: null,
        brandId: brand.brandId,
        brandName: brand.brandName,
        label: product.name,
      });
      return;
    }
    onChange({
      productId: sku.productId,
      productName: sku.productName,
      variantId: normalizeVariantId(sku.variantId),
      variantName: sku.variantName,
      brandId: sku.brandId ?? brand.brandId,
      brandName: sku.brandName ?? brand.brandName,
      label: sku.label,
    });
  };

  const handleProductSelect = async (
    id: string,
    name: string,
    _meta?: ProductSelectMeta,
  ) => {
    if (!id) {
      onChange({
        productId: "",
        productName: "",
        variantId: "",
        variantName: null,
        label: "",
      });
      return;
    }

    // Pull full product (with variants) from the latest product-options load cache
    // by re-fetching a small page that includes this product via name.
    setLoadingVariants(true);
    let product: any = productCache[id];
    if (!product) {
      const loaded = await loadGharplansProductOptions({
        name: name.slice(0, 60) || undefined,
        limit: 50,
        offset: 0,
      });
      product =
        loaded.rawProducts.find((p: any) => String(p.id) === String(id)) ||
        null;
      // Also stash all returned products for later lines
      const nextCache: Record<string, any> = {};
      for (const p of loaded.rawProducts) {
        nextCache[String(p.id)] = p;
      }
      setProductCache((prev) => ({ ...prev, ...nextCache }));
    }
    setLoadingVariants(false);

    if (!product) {
      // Prefer detail API so brand is available even if list search missed.
      const detail = await ensureProductLoaded(id);
      if (detail) {
        product = detail;
      } else {
        onChange({
          productId: id,
          productName: name,
          variantId: "",
          variantName: null,
          label: name,
        });
        return;
      }
    }

    setProductCache((prev) => ({ ...prev, [id]: product }));
    const productSkus = flattenProductsToSkus([product]);
    const brand = extractProductBrand(product);

    if (productSkus.length === 1) {
      emitSku({ id, name, ...product }, productSkus[0]);
      return;
    }

    // Multi-variant: keep product, wait for variant pick
    onChange({
      productId: id,
      productName: name,
      variantId: "",
      variantName: null,
      brandId: brand.brandId,
      brandName: brand.brandName,
      label: name,
      requiresVariant: true,
    });
  };

  const handleVariantSelect = (skuKey: string, _label: string) => {
    const brand = extractProductBrand(selectedProduct);
    if (!skuKey) {
      onChange({
        productId,
        productName,
        variantId: "",
        variantName: null,
        brandId: brand.brandId,
        brandName: brand.brandName,
        label: productName,
        requiresVariant: skus.length > 1,
      });
      return;
    }
    const sku =
      skus.find((s) => s.skuKey === skuKey) ||
      skus.find(
        (s) =>
          skuMapKey(s.productId, s.variantId) === skuKey ||
          String(s.variantId) === String(skuKey),
      );
    if (sku) {
      emitSku(
        { id: productId, name: productName, ...(selectedProduct || {}) },
        sku,
      );
    }
  };

  const selectedVariantKey = productId
    ? skuMapKey(productId, variantId)
    : "";

  const selectedVariantLabel =
    variantName ||
    skus.find((s) => s.skuKey === selectedVariantKey)?.label ||
    "";

  const showVariantSelect = !!productId && skus.length !== 1;
  const singleVariantHint =
    productId && skus.length === 1
      ? skus[0].variantName || skus[0].label
      : null;

  return (
    <div className="grid gap-3 grid-cols-1">
      <div>
        <ProductSearchSelect
          value={productId}
          selectedName={productName}
          onSelect={handleProductSelect}
          onLoad={async (params) => {
            const result = await loadGharplansProductOptions(params);
            setProductCache((prev) => {
              const next = { ...prev };
              for (const p of result.rawProducts) {
                next[String(p.id)] = p;
              }
              return next;
            });
            return {
              products: result.products,
              total: result.total,
              consumed: result.consumed,
            };
          }}
          placeholder={productPlaceholder}
          searchPlaceholder="Type to search products..."
          emptyText="No products found"
          error={productError}
          disabled={disabled}
        />
      </div>

      {showVariantSelect ? (
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Variant
          </label>
          {loadingVariants && !variantOptions.length ? (
            <p className="text-xs text-muted-foreground py-2">
              Loading variants...
            </p>
          ) : (
            <select
              className={`common-input bg-card ${
                variantError ? "border-red-500 focus:border-red-500" : ""
              }`}
              value={normalizeVariantId(variantId)}
              disabled={disabled || !productId || variantOptions.length === 0}
              onChange={(e) => {
                const vid = e.target.value;
                const opt = variantOptions.find(
                  (o) => normalizeVariantId(o.variantId) === vid,
                );
                if (!opt) {
                  handleVariantSelect("", "");
                  return;
                }
                handleVariantSelect(String(opt.id), opt.name);
              }}
            >
              <option value="">{variantPlaceholder}</option>
              {variantOptions.map((opt) => (
                <option
                  key={String(opt.id)}
                  value={normalizeVariantId(opt.variantId)}
                >
                  {opt.variantName || opt.name}
                  {opt.meta ? ` (${opt.meta})` : ""}
                </option>
              ))}
            </select>
          )}
          {variantError ? (
            <p className="mt-1 text-xs text-danger-text font-semibold">
              {variantError}
            </p>
          ) : null}
        </div>
      ) : null}

      {singleVariantHint ? (
        <p className="text-xs text-muted-foreground">
          Variant:{" "}
          <span className="font-semibold text-foreground">
            {singleVariantHint}
          </span>
          {skus[0] && formatSkuDetails(skus[0])
            ? ` · ${formatSkuDetails(skus[0])}`
            : ""}
        </p>
      ) : null}

      {!showVariantSelect && selectedVariantLabel && skus.length > 1 ? (
        <p className="text-xs text-muted-foreground">
          Selected: {selectedVariantLabel}
        </p>
      ) : null}
    </div>
  );
}
