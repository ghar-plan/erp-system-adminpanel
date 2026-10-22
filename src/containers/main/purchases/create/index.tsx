import React, { useEffect, useRef, useState } from "react";
import { PlusSquare, Loader2, Save } from "lucide-react";
import ProductSearchSelect from "@/components/ui/ProductSearchSelect";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import useStore from "@/hooks/useStore";
import usePurchases from "../useHooks";
import useTimeSpan from "@/containers/main/time-span/useHooks";
import { IoArrowBackOutline } from "react-icons/io5";
import {
  CashOutPaymentSource,
  SOURCE_PAYMENT_OPTIONS,
  GharplansProduct,
} from "@/utils/helpers/models/purchases/purchase.dto";
import {
  ProductLifespanAvailability,
  computeExpiryFromLifespan,
  formatLifespanLabel,
} from "@/utils/helpers/models/product-lifespans/product-lifespan.dto";

interface PurchaseFormInputs {
  supplierName: string;
  productId: string;
  productName: string;
  quantity: number | string;
  rate: number | string;
  paymentMade: number | string;
  remarks: string;
  sourcePayment: CashOutPaymentSource | "";
  expiryDate: string;
  date: string;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function PurchaseCreate() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const { createPurchase, getPurchaseById, updatePurchase, getProducts } =
    usePurchases();
  const { getByProduct } = useTimeSpan();
  const { isLoading } = useStore();

  const [selectedProductName, setSelectedProductName] = useState("");
  const [lifespan, setLifespan] = useState<ProductLifespanAvailability | null>(
    null,
  );
  const expiryTouchedRef = useRef(false);
  const loadedEditRef = useRef(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PurchaseFormInputs>({
    defaultValues: {
      supplierName: "",
      productId: "",
      productName: "",
      quantity: "",
      rate: "",
      paymentMade: "",
      remarks: "",
      sourcePayment: "",
      expiryDate: "",
      date: today(),
    },
  });

  const productId = watch("productId");
  const quantity = watch("quantity");
  const rate = watch("rate");
  const date = watch("date");

  // Price = Per Item × Quantity
  useEffect(() => {
    const qty = Number(quantity);
    const perItem = Number(rate);
    if (
      Number.isFinite(qty) &&
      Number.isFinite(perItem) &&
      qty > 0 &&
      perItem > 0
    ) {
      const price = Number((qty * perItem).toFixed(2));
      setValue("paymentMade", price, { shouldValidate: true });
    } else if (
      quantity === "" ||
      rate === "" ||
      quantity === undefined ||
      rate === undefined
    ) {
      setValue("paymentMade", "", { shouldValidate: false });
    }
  }, [quantity, rate, setValue]);

  const loadProductsForSelect = async (params: {
    name?: string;
    limit?: number;
    offset?: number;
  }) => {
    let products: GharplansProduct[] = [];
    let total = 0;
    await getProducts(
      (data: GharplansProduct[]) => {
        products = data;
      },
      params,
      (count: number) => {
        total = count;
      },
    );
    return { products, total };
  };

  // Load purchase details if editing
  useEffect(() => {
    if (isEditMode && id) {
      getPurchaseById(id, (data: any) => {
        reset({
          supplierName: data?.supplierName || "",
          productId: data?.productId || "",
          productName: data?.productName || "",
          quantity: data?.quantity ?? "",
          rate: data?.rate ?? "",
          paymentMade: data?.paymentMade ?? "",
          remarks: data?.remarks || "",
          sourcePayment: data?.sourcePayment || "",
          expiryDate: data?.expiryDate
            ? String(data.expiryDate).slice(0, 10)
            : "",
          date: data?.date ? String(data.date).slice(0, 10) : today(),
        });
        if (data?.productName) {
          setSelectedProductName(data.productName);
        }
        // Keep existing expiry on edit unless user changes product/date
        expiryTouchedRef.current = !!data?.expiryDate;
        loadedEditRef.current = true;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  // Load product time span
  useEffect(() => {
    if (!productId) {
      setLifespan(null);
      return;
    }
    getByProduct(String(productId)).then(setLifespan);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Auto-fill expiry from time span when product/date changes (unless user edited expiry)
  useEffect(() => {
    if (!productId || !date || !lifespan) return;
    if (lifespan.isLifetime) {
      if (!expiryTouchedRef.current && !isEditMode) {
        setValue("expiryDate", "");
      }
      return;
    }

    // On edit load, don't overwrite existing expiry until product/date changes after load
    if (isEditMode && loadedEditRef.current && expiryTouchedRef.current) {
      return;
    }

    const computed = computeExpiryFromLifespan(
      date,
      lifespan.years,
      lifespan.months,
      lifespan.days,
    );
    if (computed) {
      setValue("expiryDate", computed, { shouldDirty: true });
    }
  }, [productId, date, lifespan, isEditMode, setValue]);

  const handleProductSelect = (id: string, name: string) => {
    setValue("productId", id, { shouldValidate: true });
    setValue("productName", name, { shouldValidate: true });
    setSelectedProductName(name);
    // Allow auto-expiry for newly selected product
    expiryTouchedRef.current = false;
    loadedEditRef.current = false;
  };

  const onSubmitForm = async (data: PurchaseFormInputs) => {
    const quantity = Number(data.quantity);
    const rate = Number(data.rate);
    const price = Number((quantity * rate).toFixed(2));

    const payload = {
      supplierName: data.supplierName.trim(),
      productId: String(data.productId),
      productName: data.productName,
      quantity,
      rate,
      paymentMade: price,
      sourcePayment: data.sourcePayment,
      date: data.date,
      ...(data.remarks ? { remarks: data.remarks.trim() } : {}),
      ...(data.expiryDate ? { expiryDate: data.expiryDate } : {}),
    };

    if (isEditMode && id) {
      await updatePurchase(id, payload);
    } else {
      await createPurchase(payload);
    }
  };

  const goToBack = () => {
    navigate(-1);
  };

  const lifespanHint = lifespan
    ? lifespan.isLifetime
      ? "Lifetime product (no auto expiry)"
      : `Time span: ${formatLifespanLabel(lifespan.years, lifespan.months, lifespan.days)}`
    : null;

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
          <h1 className="text-2xl text-foreground font-bold">
            {isEditMode ? "Edit Purchase" : "Record Purchase"}
          </h1>
        </div>
      </div>

      <form
        id="purchase-create-form"
        onSubmit={handleSubmit(onSubmitForm)}
        className="mt-8 w-full animate-slide-up space-y-6"
      >
        <hr className="border-border-main" />

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div>
            <label className="mb-2 block ui-form-label">
              Company / Supplier Name
            </label>
            <input
              type="text"
              placeholder="e.g. ABC Suppliers"
              className="common-input"
              {...register("supplierName", {
                required: "Supplier name is required",
              })}
            />
            {errors.supplierName && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.supplierName.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block ui-form-label">Product Name</label>
            <ProductSearchSelect
              value={productId || ""}
              selectedName={selectedProductName || watch("productName")}
              onSelect={handleProductSelect}
              onLoad={loadProductsForSelect}
              error={errors.productId?.message}
            />
            <input
              type="hidden"
              {...register("productId", { required: "Product is required" })}
            />
          </div>

          <div>
            <label className="mb-2 block ui-form-label">Quantity</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 100"
              className={`common-input ${errors.quantity ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("quantity", {
                required: "Quantity is required",
                valueAsNumber: true,
                min: { value: 0.01, message: "Quantity must be greater than 0" },
              })}
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.quantity.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block ui-form-label">Per Item</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="e.g. 1200"
              className={`common-input ${errors.rate ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("rate", {
                required: "Per item price is required",
                valueAsNumber: true,
                min: {
                  value: 0.01,
                  message: "Per item price must be greater than 0",
                },
              })}
            />
            {errors.rate && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.rate.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block ui-form-label">Price</label>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="Auto-calculated"
              readOnly
              className={`common-input bg-muted-foreground/5 cursor-not-allowed ${errors.paymentMade ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("paymentMade", {
                valueAsNumber: true,
                min: { value: 0, message: "Price cannot be negative" },
              })}
            />
            {errors.paymentMade && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.paymentMade.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block ui-form-label">Source Payment</label>
            <select
              className={`common-input bg-card ${errors.sourcePayment ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("sourcePayment", {
                required: "Source payment is required",
              })}
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
            <label className="mb-2 block ui-form-label">Date</label>
            <input
              type="date"
              className={`common-input ${errors.date ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("date", {
                required: "Date is required",
                onChange: () => {
                  // Allow recompute when purchase date changes
                  if (!isEditMode) {
                    expiryTouchedRef.current = false;
                  } else {
                    loadedEditRef.current = false;
                    expiryTouchedRef.current = false;
                  }
                },
              })}
            />
            {errors.date && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.date.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-2 block ui-form-label">
              Expiry Date (Optional)
            </label>
            <input
              type="date"
              className="common-input"
              {...register("expiryDate", {
                onChange: () => {
                  expiryTouchedRef.current = true;
                },
              })}
            />
            {lifespanHint ? (
              <p className="mt-1 text-xs text-muted-foreground">{lifespanHint}</p>
            ) : null}
          </div>

          <div className="md:col-span-2">
            <label className="mb-2 block ui-form-label">Remarks</label>
            <textarea
              placeholder="e.g. Urgent delivery requested"
              rows={3}
              className="common-input py-3 resize-none"
              {...register("remarks")}
            />
          </div>
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
                {isEditMode ? "Save Changes" : "Record Purchase"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
