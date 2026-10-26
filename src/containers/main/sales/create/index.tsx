import React, { useEffect, useState } from "react";
import { PlusSquare, Loader2, Save } from "lucide-react";
import ProductSearchSelect from "@/components/ui/ProductSearchSelect";
import { useNavigate, useParams } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import useStore from "@/hooks/useStore";
import useSales from "../useHooks";
import useStocks from "@/containers/main/stocks/useHooks";
import { IoArrowBackOutline } from "react-icons/io5";
import { validatePakistanMobile } from "@/utils/helpers/common/phone";
import PakistanPhoneInput from "@/components/ui/PakistanPhoneInput";
import {
  CashOutPaymentSource,
  SOURCE_PAYMENT_OPTIONS,
  GharplansProduct,
} from "@/utils/helpers/models/purchases/purchase.dto";
import {
  CustomerType,
  CustomerTypeCategory,
  customerTypeCategoryLabel,
  WALK_IN_CUSTOMER_TYPE,
  WALK_IN_CUSTOMER_TYPE_ID,
} from "@/utils/helpers/models/customer-types/customer-type.dto";
import { computeSaleBalance } from "@/utils/helpers/models/sales/sale.dto";
import { StockAvailability } from "@/utils/helpers/models/stocks/stock.dto";

interface SaleFormInputs {
  customerTypeId: string;
  date: string;
  customerName: string;
  telephone: string;
  productId: string;
  productName: string;
  quantity: number | string;
  rate: number | string;
  payment: number | string;
  sourcePayment: CashOutPaymentSource | "";
  remarks: string;
}

const today = () => new Date().toISOString().slice(0, 10);

export default function SaleCreate() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const {
    createSale,
    getSaleById,
    updateSale,
    getCustomerTypes,
    getProductRate,
    getProducts,
  } = useSales();
  const { getStockByProduct } = useStocks();
  const { isLoading } = useStore();

  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);
  const [selectedProductName, setSelectedProductName] = useState("");
  const [loadingRate, setLoadingRate] = useState(false);
  const [stockInfo, setStockInfo] = useState<StockAvailability | null>(null);
  const [originalSaleQty, setOriginalSaleQty] = useState(0);
  const [originalSaleProductId, setOriginalSaleProductId] = useState("");

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
      productId: "",
      productName: "",
      quantity: "",
      rate: "",
      payment: "",
      sourcePayment: "",
      remarks: "",
    },
  });

  const customerTypeId = watch("customerTypeId");
  const productId = watch("productId");
  const quantity = watch("quantity");
  const rate = watch("rate");
  const payment = watch("payment");

  const customerTypeOptions = (() => {
    const withoutWalkIn = customerTypes.filter(
      (ct) => String(ct.id) !== WALK_IN_CUSTOMER_TYPE_ID,
    );
    return [WALK_IN_CUSTOMER_TYPE, ...withoutWalkIn];
  })();

  const selectedCustomerType = customerTypeOptions.find(
    (ct) => String(ct.id) === String(customerTypeId),
  );
  // Walk-in uses the same name/telephone flow as regular Customer types
  const isCustomerCategory =
    selectedCustomerType?.category === CustomerTypeCategory.CUSTOMER ||
    selectedCustomerType?.category === CustomerTypeCategory.WALK_IN ||
    String(customerTypeId) === WALK_IN_CUSTOMER_TYPE_ID;

  const balance = computeSaleBalance(quantity, rate, payment);

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

  useEffect(() => {
    getCustomerTypes(setCustomerTypes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load sale details if editing
  useEffect(() => {
    if (isEditMode && id) {
      getSaleById(id, (data: any) => {
        reset({
          customerTypeId: data?.customerTypeId || "",
          date: data?.date ? String(data.date).slice(0, 10) : today(),
          customerName: data?.customerName || "",
          telephone: data?.telephone || "",
          productId: data?.productId || "",
          productName: data?.productName || "",
          quantity: data?.quantity ?? "",
          rate: data?.rate ?? "",
          payment: data?.payment ?? "",
          sourcePayment: data?.sourcePayment || "",
          remarks: data?.remarks || "",
        });
        if (data?.productName) {
          setSelectedProductName(data.productName);
        }
        setOriginalSaleQty(Number(data?.quantity) || 0);
        setOriginalSaleProductId(String(data?.productId || ""));
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  // Prefill rate from customer-type product price when configured (always editable).
  useEffect(() => {
    if (!customerTypeId || !productId) return;
    if (String(customerTypeId) === WALK_IN_CUSTOMER_TYPE_ID) return;
    setLoadingRate(true);
    getProductRate(customerTypeId, String(productId), (fetchedRate) => {
      setLoadingRate(false);
      if (fetchedRate !== null && fetchedRate !== undefined) {
        setValue("rate", fetchedRate, { shouldValidate: true });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerTypeId, productId]);

  // Load stock when product changes
  useEffect(() => {
    if (!productId) {
      setStockInfo(null);
      return;
    }
    getStockByProduct(String(productId)).then(setStockInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  /** Available for this sale: on-hand + this sale's qty when editing same product. */
  const availableForSale = (() => {
    const onHand = Number(stockInfo?.quantity ?? 0);
    if (
      isEditMode &&
      productId &&
      String(productId) === String(originalSaleProductId)
    ) {
      return onHand + originalSaleQty;
    }
    return onHand;
  })();

  const handleProductSelect = (id: string, name: string) => {
    setValue("productId", id, { shouldValidate: true });
    setValue("productName", name, { shouldValidate: true });
    setSelectedProductName(name);
  };

  const onSubmitForm = async (data: SaleFormInputs) => {
    const qty = Number(data.quantity);

    const payload: any = {
      customerTypeId: data.customerTypeId,
      date: data.date,
      productId: String(data.productId),
      productName: data.productName,
      quantity: qty,
      rate: Number(data.rate),
      payment: data.payment === "" ? 0 : Number(data.payment),
      sourcePayment: data.sourcePayment,
      ...(data.remarks ? { remarks: data.remarks.trim() } : {}),
    };

    if (isCustomerCategory) {
      payload.customerName = data.customerName.trim();
      payload.telephone = data.telephone.trim();
    }

    if (isEditMode && id) {
      await updateSale(id, payload);
    } else {
      await createSale(payload);
    }
  };

  const goToBack = () => {
    navigate(-1);
  };

  return (
    <div>
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
            {isEditMode ? "Edit Sale" : "Record Sale"}
          </h1>
        </div>
      </div>

      {/* Form Card Layout */}
      <form
        id="sale-create-form"
        onSubmit={handleSubmit(onSubmitForm)}
        className="mt-8 w-full animate-slide-up space-y-6"
      >
        <hr className="border-border-main" />

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          {/* Customer Type */}
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
                  {ct.id === WALK_IN_CUSTOMER_TYPE_ID
                    ? ct.name
                    : `${ct.name} (${customerTypeCategoryLabel(ct.category)})`}
                </option>
              ))}
            </select>
            {errors.customerTypeId && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.customerTypeId.message}
              </p>
            )}
          </div>

          {/* Date */}
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

          {/* Customer Name + Telephone - only for "customer" category */}
          {isCustomerCategory ? (
            <>
              <div>
                <label className="mb-2 block ui-form-label">Customer Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ali Raza"
                  className={`common-input ${errors.customerName ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("customerName", {
                    required: isCustomerCategory
                      ? "Customer name is required"
                      : false,
                  })}
                />
                {errors.customerName && (
                  <p className="mt-1 text-xs text-danger-text font-semibold">
                    {errors.customerName.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block ui-form-label">Telephone</label>
                <Controller
                  name="telephone"
                  control={control}
                  rules={{
                    validate: (value) =>
                      isCustomerCategory
                        ? validatePakistanMobile(value)
                        : true,
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

          {/* Product Name */}
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

          {/* Quantity */}
          <div>
            <label className="mb-2 block ui-form-label">Quantity</label>
            <input
              type="number"
              step="1"
              min="1"
              placeholder="e.g. 10"
              className={`common-input ${errors.quantity ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("quantity", {
                required: "Quantity is required",
                valueAsNumber: true,
                min: { value: 1, message: "Quantity must be at least 1" },
              })}
            />
            {productId ? (
              <p
                className={`mt-1 text-xs font-semibold ${
                  availableForSale <= 0
                    ? "text-muted-foreground"
                    : "text-emerald-600"
                }`}
              >
                Available stock: {availableForSale}
                {stockInfo?.totalPurchased != null
                  ? ` ? Purchased: ${Number(stockInfo.totalPurchased)} ? Sold: ${Number(stockInfo.totalSold)}`
                  : ""}
                {availableForSale <= 0
                  ? " ? Sales allowed while stock is being finalized"
                  : ""}
              </p>
            ) : null}
            {errors.quantity && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.quantity.message}
              </p>
            )}
          </div>

          {/* Rate */}
          <div>
            <label className="mb-2 block ui-form-label">Rate</label>
            <input
              type="number"
              step="1"
              min="1"
              placeholder={loadingRate ? "Loading price..." : "e.g. 1300"}
              className={`common-input ${errors.rate ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("rate", {
                required: "Rate is required",
                valueAsNumber: true,
                min: { value: 1, message: "Rate must be at least 1" },
              })}
            />
            <p className="mt-1 text-xs text-muted-foreground">
              Uses the price set under Customer Types for this product when
              available; you can change it before saving.
            </p>
            {errors.rate && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.rate.message}
              </p>
            )}
          </div>

          {/* Payment */}
          <div>
            <label className="mb-2 block ui-form-label">Payment</label>
            <input
              type="number"
              step="1"
              min="0"
              placeholder="e.g. 5000"
              className={`common-input ${errors.payment ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("payment", {
                valueAsNumber: true,
                min: { value: 0, message: "Payment cannot be negative" },
              })}
            />
            {errors.payment && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.payment.message}
              </p>
            )}
          </div>

          {/* Balance (display only) */}
          <div>
            <label className="mb-2 block ui-form-label">Balance</label>
            <input
              type="text"
              readOnly
              value={Number.isFinite(balance) ? balance : "0"}
              className="common-input bg-muted-foreground/5 cursor-not-allowed text-muted-foreground font-semibold"
            />
          </div>

          {/* Source Payment */}
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

          {/* Remarks */}
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

        {/* Action Buttons */}
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
                {isEditMode ? "Save Changes" : "Record Sale"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
