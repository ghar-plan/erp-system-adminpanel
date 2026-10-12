import React, { useEffect, useMemo, useRef, useState } from "react";
import { PlusSquare, Loader2, Save, Search, DollarSign } from "lucide-react";
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

interface CustomerTypeFormInputs {
  name: string;
  category: CustomerTypeCategory | "";
  pickupPointId: string;
  pickupPointName: string;
}

interface PickupPoint {
  id: string;
  name: string;
}

interface GharplansProduct {
  id: number | string;
  name: string;
  [key: string]: any;
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
    },
  });

  const category = watch("category");
  const pickupPointId = watch("pickupPointId");
  const isPickupPoint = category === CustomerTypeCategory.PICKUP_POINT;
  const isGpConstruction = category === CustomerTypeCategory.GP_CONSTRUCTION;
  const isCustomer = category === CustomerTypeCategory.CUSTOMER;

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
  const [productsPage, setProductsPage] = useState<GharplansProduct[]>([]);
  const [productsTotal, setProductsTotal] = useState(0);
  const [productPage, setProductPage] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [savingPrices, setSavingPrices] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Accumulated across pages so edits/prefills are never lost on pagination.
  const [rates, setRates] = useState<Record<string, string>>({});
  const [productNames, setProductNames] = useState<Record<string, string>>({});

  const fetchProductsPage = (page: number, search: string) => {
    setLoadingProducts(true);
    getProducts(
      (data: GharplansProduct[]) => {
        setProductsPage(data);
        setProductNames((prev) => {
          const next = { ...prev };
          data.forEach((product) => {
            next[String(product.id)] = product.name;
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
          next[String(price.productId)] = String(price.rate);
        });
        return next;
      });
      setProductNames((prev) => {
        const next = { ...prev };
        data.forEach((price) => {
          next[String(price.productId)] = price.productName;
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

  const handleRateChange = (productId: string, value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    setRates((prev) => ({ ...prev, [productId]: cleaned }));
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
      .map(([productId, value]) => ({
        productId,
        productName: productNames[productId] || "",
        rate: Number(value),
      }))
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
                    setValue("name", "GP Construction", { shouldValidate: true });
                  } else if (next === CustomerTypeCategory.PICKUP_POINT) {
                    setValue("name", "");
                  } else if (next === CustomerTypeCategory.CUSTOMER) {
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

          {/* Name — Customer & GP Construction */}
          {!isPickupPoint ? (
            <div className="md:col-span-2">
              <label className="mb-2 block ui-form-label">
                {isGpConstruction
                  ? "Name"
                  : isCustomer
                    ? "Customer type name"
                    : "Name"}
              </label>
              <input
                type="text"
                placeholder={
                  isGpConstruction
                    ? "GP Construction"
                    : "e.g. Gujrat, Testing, Walk-in"
                }
                className={`common-input ${errors.name ? "border-red-500 focus:border-red-500" : ""}`}
                {...register("name", { required: "Name is required" })}
              />
              {isCustomer ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  Add one row per customer segment (e.g. retail customers in a
                  city). Set product prices on the next screen after save.
                </p>
              ) : null}
              {errors.name && (
                <p className="mt-1 text-xs text-danger-text font-semibold">
                  {errors.name.message}
                </p>
              )}
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
                    <th className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap">
                      Product Name
                    </th>
                    <th className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap w-56">
                      Rate (PKR)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main bg-card text-foreground">
                  {loadingProducts ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-8 text-center text-sm text-muted-foreground">
                        Loading products...
                      </td>
                    </tr>
                  ) : productsPage.length > 0 ? (
                    productsPage.map((product) => {
                      const pid = String(product.id);
                      return (
                        <tr key={pid} className="hover:bg-muted-foreground/5 transition-colors">
                          <td className="table-td font-semibold text-foreground">
                            {product.name}
                          </td>
                          <td className="px-6 py-3">
                            <input
                              type="text"
                              inputMode="decimal"
                              placeholder="0.00"
                              value={rates[pid] ?? ""}
                              onChange={(e) => handleRateChange(pid, e.target.value)}
                              className="common-input h-9 text-sm w-full max-w-[180px]"
                            />
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={2} className="px-6 py-8">
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
