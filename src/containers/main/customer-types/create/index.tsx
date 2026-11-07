import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  PlusSquare,
  Loader2,
  Save,
  Search,
  DollarSign,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import useStore from "@/hooks/useStore";
import useCustomerTypes from "../useHooks";
import { IoArrowBackOutline } from "react-icons/io5";
import Pagination from "@/components/particles/table/pagination";
import DataNotFound from "@/components/particles/table/data-not-found";
import Button from "@/components/ui/Button";
import {
  CustomerTypeCategory,
  CUSTOMER_TYPE_CATEGORY_OPTIONS,
  CustomerTypeProductPrice,
  CustomerType,
} from "@/utils/helpers/models/customer-types/customer-type.dto";
import { errorToaster } from "@/utils/helpers/common/alert-service";
import {
  ProductSku,
  groupSkusByProduct,
  skuMapKey,
  parseSkuMapKey,
} from "@/utils/helpers/models/product-sku";
import { formatSkuDetails } from "@/utils/helpers/models/product-sku-options";

interface CustomerTypeFormInputs {
  name: string;
  category: CustomerTypeCategory | "";
  pickupPointId: string;
  pickupPointName: string;
  clonePricesFromCustomerTypeId: string;
}

interface PickupPoint {
  id: string;
  name: string;
}

const PRODUCT_PAGE_LIMIT = 10;

export default function CustomerTypeCreate() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const {
    createCustomerType,
    getCustomerTypeById,
    updateCustomerType,
    getPickupPoints,
    getAllCustomerTypes,
    getAllPrices,
    upsertPrices,
    getProducts,
  } = useCustomerTypes();
  const { isLoading } = useStore();

  const [pickupPoints, setPickupPoints] = useState<PickupPoint[]>([]);
  const [existingCustomerTypes, setExistingCustomerTypes] = useState<CustomerType[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CustomerTypeFormInputs>({
    defaultValues: {
      name: "",
      category: "",
      pickupPointId: "",
      pickupPointName: "",
      clonePricesFromCustomerTypeId: "",
    },
  });

  const category = watch("category");
  const pickupPointId = watch("pickupPointId");
  const isPickupPoint = category === CustomerTypeCategory.PICKUP_POINT;
  const isGpConstruction = category === CustomerTypeCategory.GP_CONSTRUCTION;
  const isCustomer = category === CustomerTypeCategory.CUSTOMER;
  const isWalkIn = category === CustomerTypeCategory.WALK_IN;

  const usedPickupPointIds = useMemo(() => {
    return new Set(
      existingCustomerTypes
        .filter(
          (ct) =>
            ct.category === CustomerTypeCategory.PICKUP_POINT && ct.pickupPointId,
        )
        .filter((ct) => !(isEditMode && id && ct.id === id))
        .map((ct) => String(ct.pickupPointId)),
    );
  }, [existingCustomerTypes, isEditMode, id]);

  const availablePickupPoints = useMemo(() => {
    const list = pickupPoints.filter(
      (pp) => !usedPickupPointIds.has(String(pp.id)),
    );
    if (isEditMode && pickupPointId) {
      const current = pickupPoints.find(
        (pp) => String(pp.id) === String(pickupPointId),
      );
      if (current && !list.some((pp) => String(pp.id) === String(current.id))) {
        return [current, ...list];
      }
    }
    return list;
  }, [pickupPoints, usedPickupPointIds, isEditMode, pickupPointId]);

  const pickupPointCategoryDisabled =
    !isEditMode &&
    pickupPoints.length > 0 &&
    availablePickupPoints.length === 0;

  const existingGpConstruction = useMemo(
    () =>
      existingCustomerTypes.find(
        (ct) => ct.category === CustomerTypeCategory.GP_CONSTRUCTION,
      ),
    [existingCustomerTypes],
  );

  const gpConstructionCategoryDisabled =
    !isEditMode && !!existingGpConstruction;

  // ---- Basic info ----
  useEffect(() => {
    getPickupPoints(setPickupPoints);
    getAllCustomerTypes(setExistingCustomerTypes);
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      getCustomerTypeById(id, (data: any) => {
        reset({
          name: data?.name || "",
          category: data?.category || "",
          pickupPointId: data?.pickupPointId || "",
          pickupPointName: data?.pickupPointName || "",
        });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  const handlePickupPointChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const selected = pickupPoints.find((p) => String(p.id) === selectedId);
    setValue("pickupPointId", selectedId, { shouldValidate: true });
    setValue("pickupPointName", selected?.name || "");
    if (selected?.name) {
      setValue("name", selected.name, { shouldValidate: true });
    }
  };

  const onSubmitForm = async (data: CustomerTypeFormInputs) => {
    if (isEditMode && id) {
      // Category and pickup point are locked on edit — only name can change.
      await updateCustomerType(id, {
        name: data.name?.trim() || undefined,
      });
      return;
    }

    const payload: any = {
      category: data.category,
      name: data.name?.trim() || undefined,
    };
    if (data.category === CustomerTypeCategory.PICKUP_POINT) {
      payload.pickupPointId = data.pickupPointId;
      payload.pickupPointName = data.pickupPointName || undefined;
    }
    if (data.clonePricesFromCustomerTypeId) {
      payload.clonePricesFromCustomerTypeId =
        data.clonePricesFromCustomerTypeId;
    }

    const response = await createCustomerType(payload);
    const newId = response?.data?.id;
    if (newId) {
      navigate(`/customer-types/edit/${newId}`);
    } else {
      navigate("/customer-types");
    }
  };

  const goToBack = () => {
    navigate(-1);
  };

  // ---- Product prices (edit mode only) ----
  const [productsPage, setProductsPage] = useState<ProductSku[]>([]);
  const [productsTotal, setProductsTotal] = useState(0);
  const [productPage, setProductPage] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [savingPrices, setSavingPrices] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState<
    Record<string, boolean>
  >({});
  const productGroups = useMemo(
    () => groupSkusByProduct(productsPage),
    [productsPage],
  );
  const toggleProductExpanded = (productId: string) =>
    setExpandedProducts((prev) => ({ ...prev, [productId]: !prev[productId] }));
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Accumulated across pages so edits/prefills are never lost on pagination.
  const [rates, setRates] = useState<Record<string, string>>({});
  // Keyed by skuMapKey(productId, variantId).
  const [skuInfo, setSkuInfo] = useState<
    Record<
      string,
      { productId: string; productName: string; variantId: string; variantName: string | null }
    >
  >({});

  const fetchProductsPage = (page: number, search: string) => {
    setLoadingProducts(true);
    getProducts(
      (data: ProductSku[]) => {
        setProductsPage(data);
        setSkuInfo((prev) => {
          const next = { ...prev };
          data.forEach((sku) => {
            next[sku.skuKey] = {
              productId: sku.productId,
              productName: sku.productName,
              variantId: sku.variantId,
              variantName: sku.variantName,
            };
          });
          return next;
        });
        setLoadingProducts(false);
      },
      { name: search, limit: PRODUCT_PAGE_LIMIT, offset: (page - 1) * PRODUCT_PAGE_LIMIT },
      setProductsTotal,
    );
  };

  // Load existing configured prices once, to seed the rates map.
  useEffect(() => {
    if (!isEditMode || !id) return;
    getAllPrices(id, (data: CustomerTypeProductPrice[]) => {
      setRates((prev) => {
        const next = { ...prev };
        data.forEach((price) => {
          next[skuMapKey(price.productId, price.variantId)] = String(price.rate);
        });
        return next;
      });
      setSkuInfo((prev) => {
        const next = { ...prev };
        data.forEach((price) => {
          const key = skuMapKey(price.productId, price.variantId);
          if (next[key]) return;
          next[key] = {
            productId: String(price.productId),
            productName: price.productName,
            variantId: price.variantId ? String(price.variantId) : "",
            variantName: price.variantName ?? null,
          };
        });
        return next;
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  useEffect(() => {
    if (!isEditMode || !id) return;
    fetchProductsPage(productPage, productSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode, productPage]);

  // Debounced product search (resets to page 1)
  useEffect(() => {
    if (!isEditMode || !id) return;
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setProductPage(1);
      fetchProductsPage(1, productSearch);
    }, 400);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSearch]);

  const handleRateChange = (key: string, value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    setRates((prev) => ({ ...prev, [key]: cleaned }));
  };

  const onProductsPageChange = (pageInfo: { selected: number }) => {
    setProductPage(pageInfo.selected + 1);
  };

  const handleSavePrices = async () => {
    const entries = Object.entries(rates).filter(
      ([, value]) => value !== undefined && value !== "",
    );

    const invalid = entries.find(([, value]) => !(Number(value) > 0));
    if (invalid) {
      errorToaster("Rate must be greater than 0 for any product with a value entered");
      return;
    }

    const prices = entries
      .filter(([, value]) => Number(value) > 0)
      .map(([key, value]) => {
        const info = skuInfo[key];
        const parsed = parseSkuMapKey(key);
        return {
          productId: info?.productId || parsed.productId,
          productName: info?.productName || "",
          variantId: info?.variantId ?? parsed.variantId,
          variantName: info?.variantName ?? null,
          rate: Number(value),
        };
      })
      .filter((item) => !!item.productName);

    if (prices.length === 0) {
      errorToaster("Enter at least one product rate before saving");
      return;
    }

    if (!id) return;
    setSavingPrices(true);
    const response = await upsertPrices(id, { prices, replaceAll: false });
    setSavingPrices(false);
    if (response?.status) {
      navigate("/customer-types");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goToBack}
            className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
            title="Go Back"
          >
            <IoArrowBackOutline size={20} className="stroke-[2.5]" />
          </button>
          <h1 className="text-2xl text-foreground font-bold">
            {isEditMode ? "Edit Customer Type" : "Create Customer Type"}
          </h1>
        </div>
      </div>

      {/* Basic Info Form */}
      <form
        id="customer-type-create-form"
        onSubmit={handleSubmit(onSubmitForm)}
        className="w-full animate-slide-up space-y-6"
      >
        <hr className="border-border-main" />

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {/* Category */}
          <div>
            <label className="mb-2 block ui-form-label">Category</label>
            <select
              disabled={isEditMode}
              className={`common-input bg-card ${isEditMode ? "bg-muted-foreground/5 cursor-not-allowed text-muted-foreground" : ""} ${errors.category ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("category", {
                required: "Category is required",
                onChange: (e) => {
                  if (isEditMode) return;
                  const next = e.target.value as CustomerTypeCategory;
                  if (next === CustomerTypeCategory.GP_CONSTRUCTION) {
                    setValue("pickupPointId", "");
                    setValue("pickupPointName", "");
                    setValue("name", "GP Construction", {
                      shouldValidate: true,
                    });
                  } else if (next === CustomerTypeCategory.PICKUP_POINT) {
                    setValue("name", "");
                  } else if (
                    next === CustomerTypeCategory.CUSTOMER ||
                    next === CustomerTypeCategory.WALK_IN
                  ) {
                    setValue("pickupPointId", "");
                    setValue("pickupPointName", "");
                  }
                },
              })}
            >
              <option value="">Select Category</option>
              {CUSTOMER_TYPE_CATEGORY_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={
                    (opt.value === CustomerTypeCategory.PICKUP_POINT &&
                      pickupPointCategoryDisabled) ||
                    (opt.value === CustomerTypeCategory.GP_CONSTRUCTION &&
                      gpConstructionCategoryDisabled)
                  }
                >
                  {opt.label}
                  {opt.value === CustomerTypeCategory.PICKUP_POINT &&
                  pickupPointCategoryDisabled
                    ? " (all pickup points configured)"
                    : ""}
                  {opt.value === CustomerTypeCategory.GP_CONSTRUCTION &&
                  gpConstructionCategoryDisabled
                    ? " (already added)"
                    : ""}
                </option>
              ))}
            </select>
            {isEditMode ? (
              <p className="mt-1 text-xs text-muted-foreground">
                Category cannot be changed after creation.
              </p>
            ) : null}
            {gpConstructionCategoryDisabled && existingGpConstruction ? (
              <p className="mt-1 text-xs text-muted-foreground">
                GP Construction can only be added once.{" "}
                <Link
                  to={`/customer-types/edit/${existingGpConstruction.id}`}
                  className="text-primary font-semibold hover:underline"
                >
                  Edit existing GP Construction
                </Link>{" "}
                to update product prices.
              </p>
            ) : null}
            {errors.category && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.category.message}
              </p>
            )}
          </div>

          {/* Pickup Point (only when category === pickup_point) */}
          {isPickupPoint ? (
            <div className="md:col-span-2">
              <label className="mb-2 block ui-form-label">Pickup Point</label>
              <select
                className={`common-input bg-card ${isEditMode || availablePickupPoints.length === 0 ? "bg-muted-foreground/5 cursor-not-allowed text-muted-foreground" : ""} ${errors.pickupPointId ? "border-red-500 focus:border-red-500" : ""}`}
                value={pickupPointId}
                onChange={handlePickupPointChange}
                disabled={isEditMode || availablePickupPoints.length === 0}
              >
                <option value="">
                  {availablePickupPoints.length === 0
                    ? "No pickup points available"
                    : "Select Pickup Point"}
                </option>
                {availablePickupPoints.map((pp) => (
                  <option key={String(pp.id)} value={String(pp.id)}>
                    {pp.name}
                  </option>
                ))}
              </select>
              {isEditMode ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Pickup point cannot be changed after creation. Update product
                  prices below.
                </p>
              ) : (
                <p className="mt-1 text-xs text-muted-foreground">
                  Only pickup points that do not already have a customer type
                  are listed. Product prices are set after you create this
                  record.
                </p>
              )}
              <input
                type="hidden"
                {...register("pickupPointId", {
                  required: isPickupPoint
                    ? "Pickup point is required"
                    : false,
                })}
              />
              {errors.pickupPointId && (
                <p className="mt-1 text-xs text-danger-text font-semibold">
                  {errors.pickupPointId.message}
                </p>
              )}
            </div>
          ) : null}

          {/* Name ? Customer, Walk-in & GP Construction */}
          {!isPickupPoint ? (
            <div className="md:col-span-2">
              <label className="mb-2 block ui-form-label">
                {isGpConstruction
                  ? "Name"
                  : isWalkIn
                    ? "Walk-in customer name"
                    : isCustomer
                      ? "Customer type name"
                      : "Name"}
              </label>
              <input
                type="text"
                placeholder={
                  isGpConstruction
                    ? "GP Construction"
                    : isWalkIn
                      ? "e.g. Walk-in Lahore, Walk-in Counter 2"
                      : "e.g. Gujrat, GP Shop, Testing"
                }
                className={`common-input ${errors.name ? "border-red-500 focus:border-red-500" : ""}`}
                {...register("name", { required: "Name is required" })}
              />
              {isCustomer || isWalkIn ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {isWalkIn
                    ? "You can create as many walk-in customers as you need. Optionally copy prices from an existing customer below."
                    : "Add one row per customer segment (e.g. GP Shop). Optionally copy prices from an existing customer below."}
                </p>
              ) : null}
              {errors.name && (
                <p className="mt-1 text-xs text-danger-text font-semibold">
                  {errors.name.message}
                </p>
              )}
            </div>
          ) : null}

          {!isEditMode ? (
            <div className="md:col-span-2">
              <label className="mb-2 block ui-form-label">
                Copy product prices from (optional)
              </label>
              <select
                className="common-input bg-card cursor-pointer"
                {...register("clonePricesFromCustomerTypeId")}
              >
                <option value="">Don&apos;t copy ? set prices after create</option>
                {[...existingCustomerTypes]
                  .sort((a, b) =>
                    String(a.name || "").localeCompare(String(b.name || "")),
                  )
                  .map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name}
                      {ct.category
                        ? ` · ${
                            ct.category === CustomerTypeCategory.WALK_IN
                              ? "Walk-in"
                              : ct.category === CustomerTypeCategory.PICKUP_POINT
                                ? "Pickup"
                                : ct.category ===
                                    CustomerTypeCategory.GP_CONSTRUCTION
                                  ? "GP Construction"
                                  : "Customer"
                          }`
                        : ""}
                    </option>
                  ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Syncs all product rates already configured on the selected
                customer into this new one. You can still adjust prices after
                create.
              </p>
            </div>
          ) : null}
        </div>

        <div className="flex justify-end pt-4 border-t border-border-main/60">
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-10 px-6 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                {isEditMode ? <Save size={18} /> : <PlusSquare size={18} />}
                {isEditMode ? "Save Changes" : "Create & Continue"}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Product Prices (edit mode only) */}
      {isEditMode ? (
        <div className="space-y-4 animate-slide-up">
          <hr className="border-border-main" />
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">Product Prices</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Set the rate charged to this customer type per product. Only
                products with a rate entered will be saved.
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-muted-foreground/80" size={16} />
              <input
                type="search"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products..."
                className="common-input pl-10 pr-4 text-sm h-10 w-full"
              />
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border-main overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-main">
                <thead className="bg-muted-foreground/5">
                  <tr className="text-left">
                    {["", "Product Name", "Variants", "Rates set"].map(
                      (column, idx) => (
                        <th
                          key={idx}
                          className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                        >
                          {column}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main bg-card text-foreground">
                  {loadingProducts ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-sm text-muted-foreground">
                        Loading products...
                      </td>
                    </tr>
                  ) : productGroups.length > 0 ? (
                    productGroups.map((group) => {
                      const isExpanded = !!expandedProducts[group.productId];
                      const variantCount = group.variants.length;
                      const ratesSet = group.variants.filter(
                        (v) => Number(rates[v.skuKey]) > 0,
                      ).length;
                      return (
                        <React.Fragment key={group.productId}>
                          <tr
                            className="hover:bg-muted-foreground/5 transition-colors cursor-pointer"
                            onClick={() => toggleProductExpanded(group.productId)}
                          >
                            <td className="table-td w-10 text-muted-foreground">
                              {isExpanded ? (
                                <ChevronDown size={16} />
                              ) : (
                                <ChevronRight size={16} />
                              )}
                            </td>
                            <td className="table-td font-semibold text-foreground">
                              {group.productName}
                            </td>
                            <td className="table-td">
                              <span className="px-2.5 py-1 text-xs font-bold tracking-wide rounded-md bg-info-bg text-info-text border border-panel-border">
                                {variantCount}{" "}
                                {variantCount === 1 ? "variant" : "variants"}
                              </span>
                            </td>
                            <td className="table-td">
                              <span
                                className={`px-2.5 py-1 text-xs font-bold tracking-wide rounded-md border border-panel-border ${
                                  ratesSet === variantCount
                                    ? "bg-success-bg text-success-text"
                                    : ratesSet > 0
                                      ? "bg-warning-bg text-warning-text"
                                      : "bg-muted-foreground/5 text-muted-foreground"
                                }`}
                              >
                                {ratesSet} / {variantCount} set
                              </span>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr className="bg-muted-foreground/[0.03]">
                              <td colSpan={4} className="px-6 py-4">
                                <div className="overflow-x-auto rounded-lg border border-border-main">
                                  <table className="min-w-full text-sm">
                                    <thead className="bg-muted-foreground/5">
                                      <tr>
                                        {["Variant", "Details", "Rate (PKR)"].map(
                                          (column) => (
                                            <th
                                              key={column}
                                              className="px-3 py-2 text-left text-xs font-bold text-muted-foreground whitespace-nowrap"
                                            >
                                              {column}
                                            </th>
                                          ),
                                        )}
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-main">
                                      {group.variants.map((sku) => {
                                        const pid = sku.skuKey;
                                        return (
                                          <tr key={pid}>
                                            <td className="px-3 py-3 text-sm font-medium break-words whitespace-normal">
                                              {sku.variantName || (
                                                <span className="text-muted-foreground">-</span>
                                              )}
                                            </td>
                                            <td className="px-3 py-3 text-xs text-muted-foreground break-words whitespace-normal">
                                              {formatSkuDetails(sku) || "-"}
                                            </td>
                                            <td className="px-3 py-3 w-56">
                                              <input
                                                type="text"
                                                inputMode="numeric"
                                                placeholder="0"
                                                value={rates[pid] ?? ""}
                                                onChange={(e) => handleRateChange(pid, e.target.value)}
                                                className="common-input h-9 text-sm w-full max-w-[180px]"
                                              />
                                            </td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8">
                        <DataNotFound show={true} />
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {productsTotal > 0 && (
            <Pagination
              count={productsTotal}
              page={productPage}
              limit={PRODUCT_PAGE_LIMIT}
              onPageChange={onProductsPageChange}
            />
          )}

          <div className="flex justify-end pt-2">
            <Button
              variant="primary"
              onClick={handleSavePrices}
              disabled={savingPrices}
              className="h-10 px-6 text-sm font-semibold flex items-center gap-2"
            >
              {savingPrices ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <DollarSign size={16} />
              )}
              Save Prices
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
