import React, { useEffect, useState } from "react";
import {
  PlusSquare,
  Loader2,
  Save,
  Plus,
  Trash2,
  List,
  FilePenLine,
} from "lucide-react";
import ProductVariantSelect, {
  ProductVariantValue,
} from "@/components/ui/ProductVariantSelect";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import useStore from "@/hooks/useStore";
import useSales from "../useHooks";
import useStocks from "@/containers/main/stocks/useHooks";
import { IoArrowBackOutline } from "react-icons/io5";
import { validatePakistanMobile } from "@/utils/helpers/common/phone";
import PakistanPhoneInput from "@/components/ui/PakistanPhoneInput";
import {
  CashOutPaymentSource,
  SOURCE_PAYMENT_OPTIONS,
  formatMoney,
} from "@/utils/helpers/models/purchases/purchase.dto";
import {
  normalizeVariantId,
  skuMapKey,
} from "@/utils/helpers/models/product-sku";
import {
  CustomerType,
  CustomerTypeCategory,
  customerTypeCategoryLabel,
} from "@/utils/helpers/models/customer-types/customer-type.dto";
import {
  CommerceEntryStatus,
  PaymentCollectedBy,
  PAYMENT_COLLECTED_BY_OPTIONS,
  computeLineTotal,
  computeSaleBalanceFromItems,
  computeSaleSubtotal,
  isDraftEntry,
  resolveSalePayment,
} from "@/utils/helpers/models/sales/sale.dto";
import { StockAvailability } from "@/utils/helpers/models/stocks/stock.dto";
import { errorToaster } from "@/utils/helpers/common/alert-service";

interface SaleLineInput {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  brandId?: string;
  brandName?: string;
  /** UI-only: product has several variants and none chosen yet. */
  variantRequired?: boolean;
  quantity: number | string;
  rate: number | string;
}

interface SaleFormInputs {
  customerTypeId: string;
  date: string;
  customerName: string;
  telephone: string;
  items: SaleLineInput[];
  payment: number | string;
  sourcePayment: CashOutPaymentSource | "";
  paymentCollectedBy: PaymentCollectedBy | "";
  remarks: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const emptyLine = (): SaleLineInput => ({
  productId: "",
  productName: "",
  variantId: "",
  variantName: "",
  brandId: "",
  brandName: "",
  variantRequired: false,
  quantity: "",
  rate: "",
});

export default function SaleCreate() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const {
    createSale,
    getSaleById,
    updateSale,
    postSale,
    getCustomerTypes,
    getProductRate,
  } = useSales();
  const { getStockByProduct } = useStocks();
  const { isLoading } = useStore();

  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);
  const [stockByProduct, setStockByProduct] = useState<
    Record<string, StockAvailability | null>
  >({});
  const [originalQtyByProduct, setOriginalQtyByProduct] = useState<
    Record<string, number>
  >({});
  const [loadingRateIndex, setLoadingRateIndex] = useState<number | null>(null);
  const [entryStatus, setEntryStatus] = useState<string>(
    CommerceEntryStatus.POSTED,
  );
  const editingDraft = isEditMode && isDraftEntry(entryStatus);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<SaleFormInputs>({
    defaultValues: {
      customerTypeId: "",
      date: today(),
      customerName: "",
      telephone: "",
      items: [emptyLine()],
      payment: "",
      sourcePayment: "",
      paymentCollectedBy: PaymentCollectedBy.ADMIN,
      remarks: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const customerTypeId = watch("customerTypeId");
  const items = watch("items");
  const payment = watch("payment");
  const sourcePayment = watch("sourcePayment");
  const paymentCollectedBy = watch("paymentCollectedBy");

  const customerTypeOptions = [...customerTypes].sort((a, b) => {
    const aWalk = a.category === CustomerTypeCategory.WALK_IN ? 0 : 1;
    const bWalk = b.category === CustomerTypeCategory.WALK_IN ? 0 : 1;
    if (aWalk !== bWalk) return aWalk - bWalk;
    return String(a.name || "").localeCompare(String(b.name || ""));
  });

  const selectedCustomerType = customerTypeOptions.find(
    (ct) => String(ct.id) === String(customerTypeId),
  );
  const isWalkIn =
    selectedCustomerType?.category === CustomerTypeCategory.WALK_IN;
  const isPickupPoint =
    selectedCustomerType?.category === CustomerTypeCategory.PICKUP_POINT;
  const isCustomerCategory =
    selectedCustomerType?.category === CustomerTypeCategory.CUSTOMER ||
    isWalkIn ||
    (isPickupPoint && paymentCollectedBy === PaymentCollectedBy.ADMIN);
  const subtotal = computeSaleSubtotal(items || []);
  const resolvedPayment = resolveSalePayment(
    sourcePayment,
    subtotal,
    payment,
  );
  const balance = computeSaleBalanceFromItems(items || [], resolvedPayment);
  const paymentIsLocked =
    sourcePayment === CashOutPaymentSource.CASH ||
    sourcePayment === CashOutPaymentSource.CREDIT;

  useEffect(() => {
    // New sales only offer open customers; edit may keep a closed one.
    getCustomerTypes(setCustomerTypes, { activeOnly: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      getSaleById(id, (data: any) => {
        const lines: SaleLineInput[] =
          Array.isArray(data?.items) && data.items.length > 0
            ? data.items.map((item: any) => ({
                productId: String(item.productId || ""),
                productName: item.productName || "",
                variantId: normalizeVariantId(item.variantId),
                variantName: item.variantName || "",
                brandId: item.brandId ? String(item.brandId) : "",
                brandName: item.brandName || "",
                quantity: item.quantity ?? "",
                rate: item.rate ?? "",
              }))
            : [
                {
                  productId: String(data?.productId || ""),
                  productName: data?.productName || "",
                  variantId: normalizeVariantId(data?.variantId),
                  variantName: data?.variantName || "",
                  brandId: data?.brandId ? String(data.brandId) : "",
                  brandName: data?.brandName || "",
                  quantity: data?.quantity ?? "",
                  rate: data?.rate ?? "",
                },
              ];

        // Keep a closed customer type selectable when editing an existing sale
        if (data?.customerType && data.customerType.isActive === false) {
          setCustomerTypes((prev) => {
            if (prev.some((ct) => ct.id === data.customerType.id)) return prev;
            return [...prev, data.customerType];
          });
        }

        setEntryStatus(data?.status || CommerceEntryStatus.POSTED);

        reset({
          customerTypeId: data?.customerTypeId || "",
          date: data?.date ? String(data.date).slice(0, 10) : today(),
          customerName: data?.customerName || "",
          telephone: data?.telephone || "",
          items: lines,
          payment: data?.payment ?? "",
          sourcePayment: data?.sourcePayment || "",
          paymentCollectedBy:
            data?.paymentCollectedBy ||
            (data?.customerType?.category === CustomerTypeCategory.PICKUP_POINT
              ? PaymentCollectedBy.ADMIN
              : PaymentCollectedBy.PICKUP_POINT),
          remarks: data?.remarks || "",
        });

        const original: Record<string, number> = {};
        for (const line of lines) {
          if (!line.productId) continue;
          const key = skuMapKey(line.productId, line.variantId);
          original[key] = (original[key] || 0) + Number(line.quantity || 0);
        }
        setOriginalQtyByProduct(original);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  // Pickup-point trust flow defaults to admin collection.
  useEffect(() => {
    if (!isPickupPoint) return;
    if (!paymentCollectedBy) {
      setValue("paymentCollectedBy", PaymentCollectedBy.ADMIN);
    }
  }, [isPickupPoint, paymentCollectedBy, setValue]);

  // Prefill empty rates when customer type changes (keep existing rates on edit load)
  useEffect(() => {
    if (!customerTypeId) {
      return;
    }
    (items || []).forEach((item, index) => {
      if (!item?.productId || item?.variantRequired) return;
      const currentRate = Number(item.rate);
      if (Number.isFinite(currentRate) && currentRate > 0) return;
      setLoadingRateIndex(index);
      getProductRate(
        customerTypeId,
        String(item.productId),
        (fetchedRate) => {
          setLoadingRateIndex(null);
          if (fetchedRate !== null && fetchedRate !== undefined) {
            setValue(`items.${index}.rate`, fetchedRate, {
              shouldValidate: true,
            });
          }
        },
        normalizeVariantId(item.variantId),
      );
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerTypeId]);

  // Load stock for each selected product
  useEffect(() => {
    const skuLines = new Map<string, { productId: string; variantId: string }>();
    (items || []).forEach((item) => {
      const productId = String(item?.productId || "");
      if (!productId || item?.variantRequired) return;
      const variantId = normalizeVariantId(item?.variantId);
      skuLines.set(skuMapKey(productId, variantId), { productId, variantId });
    });
    skuLines.forEach(({ productId, variantId }, key) => {
      if (stockByProduct[key] !== undefined) return;
      getStockByProduct(productId, variantId).then((info) => {
        setStockByProduct((prev) => ({ ...prev, [key]: info }));
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  // Keep Payment in sync with Source Payment + subtotal (Cash = full, Credit = 0)
  useEffect(() => {
    if (!sourcePayment) return;
    if (
      sourcePayment !== CashOutPaymentSource.CASH &&
      sourcePayment !== CashOutPaymentSource.CREDIT
    ) {
      return;
    }
    const next = resolveSalePayment(sourcePayment, subtotal, payment);
    const current = Number(payment);
    if (!Number.isFinite(current) || Math.abs(current - next) > 0.001) {
      setValue("payment", next, { shouldValidate: true, shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourcePayment, subtotal]);

  /** `skuKey` = skuMapKey(productId, variantId) */
  const availableForProduct = (skuKey: string) => {
    if (!skuKey) return 0;
    const onHand = Number(stockByProduct[skuKey]?.quantity ?? 0);
    if (isEditMode) {
      return onHand + Number(originalQtyByProduct[skuKey] || 0);
    }
    return onHand;
  };

  const handleProductVariantChange = async (
    index: number,
    value: ProductVariantValue,
  ) => {
    const pid = value.productId;
    const variantId = normalizeVariantId(value.variantId);
    setValue(`items.${index}.productId`, pid, { shouldValidate: true });
    setValue(`items.${index}.productName`, value.productName, {
      shouldValidate: true,
    });
    setValue(`items.${index}.variantId`, variantId, { shouldValidate: true });
    setValue(`items.${index}.variantName`, value.variantName || "");
    setValue(`items.${index}.brandId`, value.brandId || "");
    setValue(`items.${index}.brandName`, value.brandName || "");
    setValue(`items.${index}.variantRequired`, !!value.requiresVariant);

    // Wait for the variant pick before loading rate/stock for multi-variant products.
    if (!pid || value.requiresVariant) return;

    if (pid && customerTypeId) {
      setLoadingRateIndex(index);
      getProductRate(
        customerTypeId,
        pid,
        (fetchedRate) => {
          setLoadingRateIndex(null);
          if (fetchedRate !== null && fetchedRate !== undefined) {
            setValue(`items.${index}.rate`, fetchedRate, {
              shouldValidate: true,
            });
          }
        },
        variantId,
      );
    }

    const key = skuMapKey(pid, variantId);
    if (pid && stockByProduct[key] === undefined) {
      const info = await getStockByProduct(pid, variantId);
      setStockByProduct((prev) => ({ ...prev, [key]: info }));
    }
  };

  const submitSale = async (
    data: SaleFormInputs,
    status: CommerceEntryStatus,
  ) => {
    const isDraft = status === CommerceEntryStatus.DRAFT;
    const cleanedItems = (data.items || [])
      .filter((item) => item.productId && item.productName)
      .map((item) => ({
        productId: String(item.productId),
        productName: item.productName,
        variantId: normalizeVariantId(item.variantId),
        variantName: item.variantName || null,
        ...(item.brandId ? { brandId: String(item.brandId) } : {}),
        ...(item.brandName ? { brandName: item.brandName } : {}),
        quantity: Number(item.quantity),
        rate: Number(item.rate),
      }));

    if (!cleanedItems.length) {
      errorToaster("Add at least one product");
      return;
    }

    for (const [index, item] of cleanedItems.entries()) {
      if (!Number.isFinite(item.quantity) || item.quantity <= 0) {
        errorToaster(`Line ${index + 1}: quantity must be greater than 0`);
        return;
      }
      if (!Number.isFinite(item.rate) || item.rate <= 0) {
        errorToaster(`Line ${index + 1}: rate must be greater than 0`);
        return;
      }
    }

    if (!isDraft && !data.sourcePayment) {
      errorToaster("Source of payment is required to record the sale");
      return;
    }

    const saleSubtotal = computeSaleSubtotal(cleanedItems);
    const paymentAmount = resolveSalePayment(
      data.sourcePayment || CashOutPaymentSource.CASH,
      saleSubtotal,
      data.payment,
    );

    if (
      !isDraft &&
      data.sourcePayment === CashOutPaymentSource.PARTIAL
    ) {
      if (paymentAmount <= 0 || paymentAmount >= saleSubtotal) {
        errorToaster(
          "Partial payment must be greater than 0 and less than the subtotal",
        );
        return;
      }
    }

    const payload: any = {
      customerTypeId: data.customerTypeId,
      date: data.date,
      items: cleanedItems,
      payment: paymentAmount,
      sourcePayment: data.sourcePayment || CashOutPaymentSource.CASH,
      status,
      ...(data.remarks ? { remarks: data.remarks.trim() } : {}),
    };

    if (isPickupPoint) {
      payload.paymentCollectedBy =
        data.paymentCollectedBy || PaymentCollectedBy.ADMIN;
    }

    if (isCustomerCategory || isPickupPoint) {
      const name = data.customerName?.trim();
      const phone = data.telephone?.trim();
      if (name) payload.customerName = name;
      if (phone) payload.telephone = phone;
    }

    if (isEditMode && id) {
      if (editingDraft && status === CommerceEntryStatus.POSTED) {
        await postSale(id, payload);
      } else {
        await updateSale(id, payload);
      }
    } else {
      await createSale(payload);
    }
  };

  const onSaveDraft = handleSubmit((data) =>
    submitSale(data, CommerceEntryStatus.DRAFT),
  );
  const onSubmitForm = handleSubmit((data) =>
    submitSale(data, CommerceEntryStatus.POSTED),
  );

  const goToBack = () => navigate(-1);

  return (
    <div>
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
          <div>
            <h1 className="text-2xl text-foreground font-bold">
              {isEditMode
                ? editingDraft
                  ? "Edit Draft Sale"
                  : "Edit Sale"
                : "Record Sale"}
            </h1>
            {editingDraft ? (
              <p className="text-sm text-muted-foreground mt-1">
                Draft — stock is not updated until you record this as a sale.
              </p>
            ) : null}
          </div>
        </div>
        {!isEditMode && (
          <Can permission={PERMISSIONS.SALES_READ}>
            <Link
              to={siteRoutes.salesList}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap text-sm"
            >
              <List size={18} />
              Sales List
            </Link>
          </Can>
        )}
      </div>

      <form
        id="sale-create-form"
        onSubmit={onSubmitForm}
        className="mt-8 w-full animate-slide-up space-y-6"
      >
        <hr className="border-border-main" />

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div>
            <label className="mb-2 block ui-form-label">Customer Type</label>
            <select
              className={`common-input bg-card ${errors.customerTypeId ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("customerTypeId", {
                required: "Customer type is required",
              })}
            >
              <option value="">Select Customer Type</option>
              {customerTypeOptions.map((ct) => (
                <option key={ct.id} value={ct.id}>
                  {`${ct.name} (${customerTypeCategoryLabel(ct.category)})${
                    ct.isActive === false ? " — Closed" : ""
                  }`}
                </option>
              ))}
            </select>
            {errors.customerTypeId && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.customerTypeId.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block ui-form-label">Date</label>
            <input
              type="date"
              className={`common-input ${errors.date ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("date", { required: "Date is required" })}
            />
            {errors.date && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.date.message}
              </p>
            )}
          </div>

          {isPickupPoint ? (
            <div className="md:col-span-2">
              <label className="mb-2 block ui-form-label">
                Payment Collected By
              </label>
              <select
                className="common-input bg-card"
                {...register("paymentCollectedBy")}
              >
                {PAYMENT_COLLECTED_BY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Use <strong>Collected by Admin</strong> when the customer pays
                Ghar Plans and the pickup point only hands over the order.
                Settle that amount from Cash In / Cash Out.
              </p>
            </div>
          ) : null}

          {isCustomerCategory ? (
            <>
              <div>
                <label className="mb-2 block ui-form-label">
                  {isPickupPoint ? "End Customer Name" : "Customer Name"}
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    (optional)
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ali Raza"
                  className={`common-input ${errors.customerName ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("customerName")}
                />
                {errors.customerName && (
                  <p className="mt-1 text-xs text-danger-text font-semibold">
                    {errors.customerName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block ui-form-label">
                  Telephone
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    (optional)
                  </span>
                </label>
                <Controller
                  name="telephone"
                  control={control}
                  rules={{
                    validate: (value) =>
                      validatePakistanMobile(value, { optional: true }),
                  }}
                  render={({ field }) => (
                    <PakistanPhoneInput
                      name={field.name}
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      hasError={!!errors.telephone}
                    />
                  )}
                />
                {errors.telephone && (
                  <p className="mt-1 text-xs text-danger-text font-semibold">
                    {errors.telephone.message}
                  </p>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Products */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-bold text-foreground">Products</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add one or more products to this sale
              </p>
            </div>
            <button
              type="button"
              onClick={() => append(emptyLine())}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border-main bg-card text-foreground text-xs font-semibold hover:bg-muted-foreground/5 cursor-pointer"
            >
              <Plus size={14} />
              Add Product
            </button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => {
              const line = items?.[index];
              const pid = String(line?.productId || "");
              const lineSkuKey = pid ? skuMapKey(pid, line?.variantId) : "";
              const available = availableForProduct(lineSkuKey);
              const lineTotal = computeLineTotal(
                line?.quantity ?? 0,
                line?.rate ?? 0,
              );

              return (
                <div
                  key={field.id}
                  className="rounded-xl border border-border-main bg-card p-4 space-y-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Product {index + 1}
                    </span>
                    {fields.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-danger-text hover:opacity-80 cursor-pointer"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    ) : null}
                  </div>

                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                    <div className="md:col-span-2">
                      <label className="mb-2 block ui-form-label">
                        Product Name
                      </label>
                      <ProductVariantSelect
                        productId={pid}
                        productName={line?.productName || ""}
                        variantId={line?.variantId || ""}
                        variantName={line?.variantName || null}
                        onChange={(value) =>
                          handleProductVariantChange(index, value)
                        }
                        productError={errors.items?.[index]?.productId?.message}
                        variantError={errors.items?.[index]?.variantId?.message}
                      />
                      <input
                        type="hidden"
                        {...register(`items.${index}.productId` as const, {
                          required: "Product is required",
                        })}
                      />
                      <input
                        type="hidden"
                        {...register(`items.${index}.productName` as const)}
                      />
                      <input
                        type="hidden"
                        {...register(`items.${index}.variantId` as const, {
                          validate: (v, formValues) =>
                            !formValues.items?.[index]?.variantRequired ||
                            !!v ||
                            "Variant is required",
                        })}
                      />
                      <input
                        type="hidden"
                        {...register(`items.${index}.variantName` as const)}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block ui-form-label">
                        Quantity
                      </label>
                      <input
                        type="number"
                        step="1"
                        min="1"
                        placeholder="e.g. 10"
                        className={`common-input ${errors.items?.[index]?.quantity ? "border-red-500 focus:border-red-500" : ""}`}
                        {...register(`items.${index}.quantity` as const, {
                          required: "Quantity is required",
                          valueAsNumber: true,
                          min: {
                            value: 1,
                            message: "Quantity must be at least 1",
                          },
                        })}
                      />
                      {pid ? (
                        <p
                          className={`mt-1 text-xs font-semibold ${
                            available <= 0
                              ? "text-muted-foreground"
                              : "text-emerald-600"
                          }`}
                        >
                          Available for this variant: {available}
                          {available > 0
                            ? " (FIFO — oldest batch sold first)"
                            : " — sales allowed while stock is being finalized"}
                        </p>
                      ) : null}
                    </div>

                    <div>
                      <label className="mb-2 block ui-form-label">Rate</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder={
                          loadingRateIndex === index
                            ? "Loading price..."
                            : "e.g. 1300"
                        }
                        className={`common-input ${errors.items?.[index]?.rate ? "border-red-500 focus:border-red-500" : ""}`}
                        {...register(`items.${index}.rate` as const, {
                          required: "Rate is required",
                          valueAsNumber: true,
                          min: {
                            value: 0.01,
                            message: "Rate must be greater than 0",
                          },
                        })}
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Line total: {formatMoney(lineTotal)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div>
            <label className="mb-2 block ui-form-label">Subtotal</label>
            <input
              type="text"
              readOnly
              value={formatMoney(subtotal)}
              className="common-input bg-muted-foreground/5 cursor-not-allowed text-muted-foreground font-semibold"
            />
          </div>

          <div>
            <label className="mb-2 block ui-form-label">Source Payment</label>
            <select
              className={`common-input bg-card ${errors.sourcePayment ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("sourcePayment")}
            >
              <option value="">Select Source Payment</option>
              {SOURCE_PAYMENT_OPTIONS.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
            {errors.sourcePayment && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.sourcePayment.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block ui-form-label">Payment</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder={
                sourcePayment === CashOutPaymentSource.CASH
                  ? "Full amount (Cash)"
                  : sourcePayment === CashOutPaymentSource.CREDIT
                    ? "0 (Credit)"
                    : "e.g. 5000.50"
              }
              readOnly={paymentIsLocked}
              className={`common-input ${paymentIsLocked ? "bg-muted-foreground/5 cursor-not-allowed text-muted-foreground font-semibold" : ""} ${errors.payment ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("payment", {
                valueAsNumber: true,
                min: { value: 0, message: "Payment cannot be negative" },
              })}
            />
            {paymentIsLocked ? (
              <p className="mt-1 text-xs text-muted-foreground">
                {sourcePayment === CashOutPaymentSource.CASH
                  ? "Cash sales auto-fill payment with the full subtotal."
                  : "Credit sales set payment to 0; balance equals the subtotal."}
              </p>
            ) : null}
            {errors.payment && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.payment.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block ui-form-label">Balance</label>
            <input
              type="text"
              readOnly
              value={formatMoney(balance)}
              className="common-input bg-muted-foreground/5 cursor-not-allowed text-muted-foreground font-semibold"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block ui-form-label">Remarks</label>
            <textarea
              placeholder="e.g. Delivered same day"
              rows={3}
              className="common-input py-3 resize-none"
              {...register("remarks")}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 flex-wrap pt-4 border-t border-border-main/60">
          {(!isEditMode || editingDraft) && (
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isLoading}
              className="flex h-10 px-6 items-center justify-center gap-2 rounded-md border border-border-main bg-card hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-foreground text-sm transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                <>
                  <FilePenLine size={18} />
                  Save as Draft
                </>
              )}
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="flex h-10 px-6 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                {isEditMode && !editingDraft ? (
                  <Save size={18} />
                ) : (
                  <PlusSquare size={18} />
                )}
                {editingDraft
                  ? "Record as Sale"
                  : isEditMode
                    ? "Save Changes"
                    : "Record Sale"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
