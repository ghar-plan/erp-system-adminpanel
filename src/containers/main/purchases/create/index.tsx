import React, { useEffect, useRef, useState } from "react";
import {
  PlusSquare,
  Loader2,
  Save,
  List,
  Plus,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import ProductSearchSelect from "@/components/ui/ProductSearchSelect";
import Button from "@/components/ui/Button";
import { Link, useNavigate, useParams } from "react-router-dom";
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
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { canAccessPurchasePrice } from "@/utils/helpers/permissions/purchase-price-access";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";

type PurchaseSupplierOption = { id: string; name: string };

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
  const {
    createPurchase,
    getPurchaseById,
    updatePurchase,
    getProducts,
    getPurchaseSuppliers,
    createPurchaseSupplier,
    updatePurchaseSupplier,
    deletePurchaseSupplier,
  } = usePurchases();
  const { getByProduct } = useTimeSpan();
  const { isLoading, getUser } = useStore();
  const canViewPurchasePrice = canAccessPurchasePrice(getUser()?.email);
  /** Admin edit: only Per Item / Price may change; other fields stay read-only. */
  const isAdminPriceOnlyEdit = isEditMode && canViewPurchasePrice;
  /** Non-admin edit: may change details but never price fields. */
  const lockNonPriceFields = isAdminPriceOnlyEdit;

  const [selectedProductName, setSelectedProductName] = useState("");
  const [lifespan, setLifespan] = useState<ProductLifespanAvailability | null>(
    null,
  );
  const expiryTouchedRef = useRef(false);
  const loadedEditRef = useRef(false);

  const [suppliers, setSuppliers] = useState<PurchaseSupplierOption[]>([]);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [supplierNameInput, setSupplierNameInput] = useState("");
  const [supplierSaving, setSupplierSaving] = useState(false);
  const [supplierError, setSupplierError] = useState("");
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    clearErrors,
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
  const selectedSupplierName = watch("supplierName");

  useEffect(() => {
    getPurchaseSuppliers(setSuppliers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetSupplierModal = () => {
    setIsSupplierModalOpen(false);
    setSupplierNameInput("");
    setSupplierError("");
    setEditingSupplierId(null);
  };

  const openSupplierModal = () => {
    setSupplierNameInput("");
    setSupplierError("");
    setEditingSupplierId(null);
    setIsSupplierModalOpen(true);
    getPurchaseSuppliers(setSuppliers);
  };

  const startEditSupplier = (supplier: PurchaseSupplierOption) => {
    setEditingSupplierId(supplier.id);
    setSupplierNameInput(supplier.name);
    setSupplierError("");
  };

  const handleDeleteSupplier = async (supplier: PurchaseSupplierOption) => {
    const deleted = await deletePurchaseSupplier(supplier.id, supplier.name);
    if (deleted) {
      if (editingSupplierId === supplier.id) {
        setEditingSupplierId(null);
        setSupplierNameInput("");
        setSupplierError("");
      }
      if (selectedSupplierName === supplier.name) {
        setValue("supplierName", "", { shouldValidate: false });
        clearErrors("supplierName");
      }
      setSuppliers((prev) => prev.filter((s) => s.id !== supplier.id));
      getPurchaseSuppliers(setSuppliers);
    }
  };

  const handleSaveSupplier = async () => {
    const trimmed = supplierNameInput.trim();
    if (!trimmed) {
      setSupplierError("Company / Supplier name is required");
      return;
    }
    setSupplierSaving(true);
    setSupplierError("");
    const wasEditing = !!editingSupplierId;
    const previousName = wasEditing
      ? suppliers.find((s) => s.id === editingSupplierId)?.name
      : null;
    const saved = editingSupplierId
      ? await updatePurchaseSupplier(editingSupplierId, trimmed)
      : await createPurchaseSupplier(trimmed);
    setSupplierSaving(false);
    if (saved) {
      const nextName = saved.name || trimmed;
      // Update options first so the <select> has a matching value before setValue
      setSuppliers((prev) => {
        const exists = prev.some((s) => s.id === saved.id);
        const next = exists
          ? prev.map((s) =>
              s.id === saved.id ? { ...s, name: nextName } : s,
            )
          : [...prev, { id: saved.id, name: nextName }];
        return next.sort((a, b) =>
          a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
        );
      });
      setSupplierNameInput("");
      setEditingSupplierId(null);
      if (!wasEditing) {
        setValue("supplierName", nextName, {
          shouldValidate: false,
          shouldDirty: true,
        });
        clearErrors("supplierName");
      } else if (previousName && selectedSupplierName === previousName) {
        setValue("supplierName", nextName, {
          shouldValidate: false,
          shouldDirty: true,
        });
        clearErrors("supplierName");
      }
      getPurchaseSuppliers(setSuppliers);
    }
  };

  // Price = Per Item ? Quantity (client / price-access emails only)
  useEffect(() => {
    if (!canViewPurchasePrice) return;
    const qty = Number(quantity);
    const perItem = Number(rate);
    if (
      Number.isFinite(qty) &&
      Number.isFinite(perItem) &&
      qty > 0 &&
      perItem > 0
    ) {
      const price = Math.round(qty * perItem);
      setValue("paymentMade", price, { shouldValidate: true });
    } else if (
      quantity === "" ||
      rate === "" ||
      quantity === undefined ||
      rate === undefined
    ) {
      setValue("paymentMade", "", { shouldValidate: false });
    }
  }, [quantity, rate, setValue, canViewPurchasePrice]);

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

    // Admin edit: only Per Item (+ auto Price). Other fields are locked.
    if (isAdminPriceOnlyEdit && id) {
      const rate = Number(data.rate);
      const price = Math.round(quantity * rate);
      await updatePurchase(id, { rate, paymentMade: price });
      return;
    }

    const payload: Record<string, unknown> = {
      supplierName: data.supplierName.trim(),
      productId: String(data.productId),
      productName: data.productName,
      quantity,
      sourcePayment: data.sourcePayment,
      date: data.date,
      ...(data.remarks ? { remarks: data.remarks.trim() } : {}),
      ...(data.expiryDate ? { expiryDate: data.expiryDate } : {}),
    };

    // Only allowlisted emails may send / set purchase price fields (create).
    // Non-admin creates leave rate / paymentMade null on the server.
    if (canViewPurchasePrice) {
      const rate = Number(data.rate);
      const price = Math.round(quantity * rate);
      payload.rate = rate;
      payload.paymentMade = price;
    }

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
        <div className="flex items-center gap-3 flex-wrap">
          {!lockNonPriceFields ? (
            <Can permission={PERMISSIONS.PURCHASES_CREATE}>
              <button
                type="button"
                onClick={openSupplierModal}
                className="flex h-10 px-4 items-center justify-center gap-2 rounded-md border border-border-main bg-card hover:bg-slate-50 dark:hover:bg-slate-800 text-foreground text-sm font-semibold transition-all cursor-pointer shadow-xs"
              >
                <Plus size={16} />
                Create Supplier
              </button>
            </Can>
          ) : null}
          {!isEditMode && (
            <Can permission={PERMISSIONS.PURCHASES_READ}>
              <Link
                to={siteRoutes.purchasesList}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap text-sm"
              >
                <List size={18} />
                Record Purchase
              </Link>
            </Can>
          )}
        </div>
      </div>

      <form
        id="purchase-create-form"
        onSubmit={handleSubmit(onSubmitForm)}
        className="mt-8 w-full animate-slide-up space-y-6"
      >
        <hr className="border-border-main" />

        {isAdminPriceOnlyEdit ? (
          <p className="text-sm text-muted-foreground">
            You can only update <span className="font-semibold text-foreground">Per Item</span>.
            Price is calculated automatically from quantity × per item.
          </p>
        ) : null}

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div>
            <label className="mb-2 block ui-form-label">
              Company / Supplier Name
            </label>
            <select
              disabled={lockNonPriceFields}
              className={`common-input cursor-pointer ${lockNonPriceFields ? "bg-muted-foreground/5 cursor-not-allowed opacity-80" : ""} ${errors.supplierName ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("supplierName", {
                required: lockNonPriceFields
                  ? false
                  : "Supplier name is required",
              })}
            >
              <option value="">Select a supplier</option>
              {selectedSupplierName &&
              !suppliers.some((s) => s.name === selectedSupplierName) ? (
                <option value={selectedSupplierName}>
                  {selectedSupplierName}
                </option>
              ) : null}
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.name}>
                  {supplier.name}
                </option>
              ))}
            </select>
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
              disabled={lockNonPriceFields}
            />
            <input
              type="hidden"
              {...register("productId", {
                required: lockNonPriceFields ? false : "Product is required",
              })}
            />
          </div>

          <div>
            <label className="mb-2 block ui-form-label">Quantity</label>
            <input
              type="number"
              step="1"
              min="1"
              placeholder="e.g. 100"
              disabled={lockNonPriceFields}
              className={`common-input ${lockNonPriceFields ? "bg-muted-foreground/5 cursor-not-allowed opacity-80" : ""} ${errors.quantity ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("quantity", {
                required: lockNonPriceFields ? false : "Quantity is required",
                valueAsNumber: true,
                min: { value: 1, message: "Quantity must be at least 1" },
              })}
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-danger-text font-semibold">
                {errors.quantity.message}
              </p>
            )}
          </div>

          {canViewPurchasePrice ? (
            <>
              <div>
                <label className="mb-2 block ui-form-label">Per Item</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  placeholder="e.g. 1200"
                  className={`common-input ${errors.rate ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("rate", {
                    required: "Per item price is required",
                    valueAsNumber: true,
                    min: {
                      value: 1,
                      message: "Per item price must be at least 1",
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
                  step="1"
                  min="0"
                  placeholder="Auto-calculated"
                  readOnly
                  className={`common-input bg-muted-foreground/5 cursor-not-allowed ${errors.paymentMade ? "border-red-500 focus:border-red-500" : ""}`}
                  {...register("paymentMade", {
                    valueAsNumber: true,
                    min: { value: 0, message: "Price cannot be negative" },
                  })}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Auto-calculated (Quantity × Per Item)
                </p>
                {errors.paymentMade && (
                  <p className="mt-1 text-xs text-danger-text font-semibold">
                    {errors.paymentMade.message}
                  </p>
                )}
              </div>
            </>
          ) : null}

          <div>
            <label className="mb-2 block ui-form-label">Source Payment</label>
            <select
              disabled={lockNonPriceFields}
              className={`common-input bg-card ${lockNonPriceFields ? "bg-muted-foreground/5 cursor-not-allowed opacity-80" : ""} ${errors.sourcePayment ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("sourcePayment", {
                required: lockNonPriceFields
                  ? false
                  : "Source payment is required",
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
              disabled={lockNonPriceFields}
              className={`common-input ${lockNonPriceFields ? "bg-muted-foreground/5 cursor-not-allowed opacity-80" : ""} ${errors.date ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("date", {
                required: lockNonPriceFields ? false : "Date is required",
                onChange: () => {
                  if (lockNonPriceFields) return;
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
              disabled={lockNonPriceFields}
              className={`common-input ${lockNonPriceFields ? "bg-muted-foreground/5 cursor-not-allowed opacity-80" : ""}`}
              {...register("expiryDate", {
                onChange: () => {
                  if (lockNonPriceFields) return;
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
              disabled={lockNonPriceFields}
              className={`common-input py-3 resize-none ${lockNonPriceFields ? "bg-muted-foreground/5 cursor-not-allowed opacity-80" : ""}`}
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
                {isAdminPriceOnlyEdit
                  ? "Save Price"
                  : isEditMode
                    ? "Save Changes"
                    : "Save Purchase"}
              </>
            )}
          </button>
        </div>
      </form>

      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => {
              if (!supplierSaving) resetSupplierModal();
            }}
          />

          <div className="bg-card border border-border-main w-full max-w-md rounded-2xl shadow-xl overflow-hidden z-10 animate-scale-up relative">
            <div className="px-6 py-4 border-b border-border-main flex items-center justify-between">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                {editingSupplierId ? (
                  <Pencil size={20} className="text-primary" />
                ) : (
                  <Plus size={20} className="text-primary" />
                )}
                {editingSupplierId ? "Edit Supplier" : "Create Supplier"}
              </h3>
              <button
                type="button"
                onClick={() => {
                  if (!supplierSaving) resetSupplierModal();
                }}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted-foreground/5 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {editingSupplierId
                  ? "Fix the spelling and save. Existing purchases keep their recorded supplier name."
                  : "Add a company / supplier that can be selected when recording a purchase."}
              </p>
              <div>
                <label className="mb-2 block ui-form-label">
                  Company / Supplier Name
                </label>
                <input
                  type="text"
                  value={supplierNameInput}
                  onChange={(e) => {
                    setSupplierNameInput(e.target.value);
                    if (supplierError) setSupplierError("");
                  }}
                  placeholder="e.g. ABC Suppliers"
                  className={`common-input ${supplierError ? "border-red-500 focus:border-red-500" : ""}`}
                  disabled={supplierSaving}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveSupplier();
                    }
                  }}
                />
                {supplierError ? (
                  <p className="mt-1.5 text-xs text-red-500 font-semibold">
                    {supplierError}
                  </p>
                ) : null}
              </div>

              {!editingSupplierId && suppliers.length > 0 ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Existing Suppliers
                  </label>
                  <div className="max-h-48 overflow-y-auto rounded-xl border border-border-main divide-y divide-border-main">
                    {suppliers.map((supplier) => (
                      <div
                        key={supplier.id}
                        className="flex items-center justify-between gap-3 px-3 py-2.5 hover:bg-muted-foreground/5"
                      >
                        <span className="text-sm font-medium text-foreground truncate">
                          {supplier.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => startEditSupplier(supplier)}
                            className="btn-action-edit"
                            title="Edit supplier"
                            disabled={supplierSaving}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteSupplier(supplier)}
                            className="btn-action-delete"
                            title="Delete supplier"
                            disabled={supplierSaving}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="px-6 py-4 bg-muted-foreground/5 border-t border-border-main flex gap-3 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  if (editingSupplierId) {
                    setEditingSupplierId(null);
                    setSupplierNameInput("");
                    setSupplierError("");
                  } else {
                    resetSupplierModal();
                  }
                }}
                disabled={supplierSaving}
                className="h-10 text-xs px-6 font-semibold"
              >
                {editingSupplierId ? "Back" : "Cancel"}
              </Button>
              <Button
                type="button"
                variant="primary"
                onClick={handleSaveSupplier}
                disabled={supplierSaving}
                className="h-10 text-xs px-6 font-semibold flex items-center justify-center gap-2"
              >
                {supplierSaving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Saving...
                  </>
                ) : editingSupplierId ? (
                  "Save Changes"
                ) : (
                  "Create Supplier"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
