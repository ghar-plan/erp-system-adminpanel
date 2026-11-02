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
  FilePenLine,
} from "lucide-react";
import ProductVariantSelect, {
  ProductVariantValue,
} from "@/components/ui/ProductVariantSelect";
import Button from "@/components/ui/Button";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useFieldArray, useForm } from "react-hook-form";
import useStore from "@/hooks/useStore";
import usePurchases from "../useHooks";
import useTimeSpan from "@/containers/main/time-span/useHooks";
import { IoArrowBackOutline } from "react-icons/io5";
import {
  CashOutPaymentSource,
  CommerceEntryStatus,
  SOURCE_PAYMENT_OPTIONS,
  formatMoney,
  isDraftEntry,
} from "@/utils/helpers/models/purchases/purchase.dto";
import {
  normalizeVariantId,
  skuMapKey,
} from "@/utils/helpers/models/product-sku";
import {
  ProductLifespanAvailability,
  computeExpiryFromLifespan,
  formatLifespanLabel,
} from "@/utils/helpers/models/product-lifespans/product-lifespan.dto";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { canAccessPurchasePrice } from "@/utils/helpers/permissions/purchase-price-access";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import { errorToaster } from "@/utils/helpers/common/alert-service";

type PurchaseSupplierOption = { id: string; name: string };

type PurchaseLineInput = {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  brandId?: string;
  brandName?: string;
  /** UI-only: product has several variants and none chosen yet. */
  variantRequired?: boolean;
  quantity: number | string;
  expiryDate: string;
};

interface PurchaseFormInputs {
  supplierName: string;
  items: PurchaseLineInput[];
  remarks: string;
  sourcePayment: CashOutPaymentSource | "";
  date: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const emptyLine = (): PurchaseLineInput => ({
  productId: "",
  productName: "",
  variantId: "",
  variantName: "",
  brandId: "",
  brandName: "",
  variantRequired: false,
  quantity: "",
  expiryDate: "",
});

export default function PurchaseCreate() {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const {
    createPurchase,
    getPurchaseById,
    updatePurchase,
    postPurchase,
    getPurchaseSuppliers,
    createPurchaseSupplier,
    updatePurchaseSupplier,
    deletePurchaseSupplier,
  } = usePurchases();
  const { getByProduct } = useTimeSpan();
  const { isLoading, getUser } = useStore();
  const canViewPurchasePrice = canAccessPurchasePrice(getUser()?.email);

  const [lifespansByProduct, setLifespansByProduct] = useState<
    Record<string, ProductLifespanAvailability | null>
  >({});
  const [snapshotPayment, setSnapshotPayment] = useState<number | null>(null);
  const [snapshotItems, setSnapshotItems] = useState<
    Array<{ rate?: number | null; lineTotal?: number | null }>
  >([]);
  const [entryStatus, setEntryStatus] = useState<string>(
    CommerceEntryStatus.POSTED,
  );
  const editingDraft = isEditMode && isDraftEntry(entryStatus);
  const expiryTouchedRef = useRef<Record<number, boolean>>({});
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
    control,
    clearErrors,
    formState: { errors },
  } = useForm<PurchaseFormInputs>({
    defaultValues: {
      supplierName: "",
      items: [emptyLine()],
      remarks: "",
      sourcePayment: "",
      date: today(),
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");
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

  // Keyed by skuMapKey(productId, variantId)
  const ensureLifespan = async (productId: string, variantId: string = "") => {
    if (!productId) return;
    const key = skuMapKey(productId, variantId);
    if (lifespansByProduct[key] !== undefined) return;
    const lifespan = await getByProduct(
      String(productId),
      normalizeVariantId(variantId),
    );
    setLifespansByProduct((prev) => ({ ...prev, [key]: lifespan }));
  };

  // Load purchase details if editing
  useEffect(() => {
    if (isEditMode && id) {
      getPurchaseById(id, (data: any) => {
        const lines: PurchaseLineInput[] =
          Array.isArray(data?.items) && data.items.length > 0
            ? data.items.map((item: any) => ({
                productId: String(item.productId || ""),
                productName: item.productName || "",
                variantId: normalizeVariantId(item.variantId),
                variantName: item.variantName || "",
                brandId: item.brandId ? String(item.brandId) : "",
                brandName: item.brandName || "",
                quantity: item.quantity ?? "",
                expiryDate: item.expiryDate
                  ? String(item.expiryDate).slice(0, 10)
                  : "",
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
                  expiryDate: data?.expiryDate
                    ? String(data.expiryDate).slice(0, 10)
                    : "",
                },
              ];

        setEntryStatus(data?.status || CommerceEntryStatus.POSTED);

        reset({
          supplierName: data?.supplierName || "",
          items: lines,
          remarks: data?.remarks || "",
          sourcePayment: data?.sourcePayment || "",
          date: data?.date ? String(data.date).slice(0, 10) : today(),
        });

        setSnapshotPayment(
          data?.paymentMade != null &&
            Number.isFinite(Number(data.paymentMade))
            ? Number(data.paymentMade)
            : null,
        );
        setSnapshotItems(
          Array.isArray(data?.items)
            ? data.items.map((item: any) => ({
                rate: item?.rate ?? null,
                lineTotal: item?.lineTotal ?? null,
              }))
            : [
                {
                  rate: data?.rate ?? null,
                  lineTotal:
                    data?.paymentMade ??
                    (data?.rate != null
                      ? Number(data.quantity) * Number(data.rate)
                      : null),
                },
              ],
        );

        const touched: Record<number, boolean> = {};
        lines.forEach((line, index) => {
          touched[index] = !!line.expiryDate;
          if (line.productId) {
            ensureLifespan(line.productId, line.variantId);
          }
        });
        expiryTouchedRef.current = touched;
        loadedEditRef.current = true;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode]);

  // Auto-fill expiry per line from time span when product/date changes
  useEffect(() => {
    if (!date || !items?.length) return;

    items.forEach((line, index) => {
      const pid = String(line?.productId || "");
      if (!pid || line?.variantRequired) return;
      const lifespan = lifespansByProduct[skuMapKey(pid, line?.variantId)];
      if (!lifespan) {
        ensureLifespan(pid, line?.variantId);
        return;
      }
      if (expiryTouchedRef.current[index]) return;
      if (isEditMode && loadedEditRef.current && line.expiryDate) return;

      if (lifespan.isLifetime) {
        if (!isEditMode) {
          setValue(`items.${index}.expiryDate`, "");
        }
        return;
      }

      const computed = computeExpiryFromLifespan(
        date,
        lifespan.years,
        lifespan.months,
        lifespan.days,
      );
      if (computed) {
        setValue(`items.${index}.expiryDate`, computed, { shouldDirty: true });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date, items, lifespansByProduct, isEditMode, setValue]);

  const handleProductVariantChange = (
    index: number,
    value: ProductVariantValue,
  ) => {
    const variantId = normalizeVariantId(value.variantId);
    setValue(`items.${index}.productId`, value.productId, {
      shouldValidate: true,
    });
    setValue(`items.${index}.productName`, value.productName, {
      shouldValidate: true,
    });
    setValue(`items.${index}.variantId`, variantId, { shouldValidate: true });
    setValue(`items.${index}.variantName`, value.variantName || "");
    setValue(`items.${index}.brandId`, value.brandId || "");
    setValue(`items.${index}.brandName`, value.brandName || "");
    setValue(`items.${index}.variantRequired`, !!value.requiresVariant);
    expiryTouchedRef.current[index] = false;
    loadedEditRef.current = false;
    if (value.productId && !value.requiresVariant) {
      ensureLifespan(value.productId, variantId);
    }
  };

  const submitPurchase = async (
    data: PurchaseFormInputs,
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
        ...(item.expiryDate ? { expiryDate: item.expiryDate } : {}),
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
    }

    if (!isDraft && !data.sourcePayment) {
      errorToaster("Source of payment is required to save the purchase");
      return;
    }

    const payload: Record<string, unknown> = {
      supplierName: data.supplierName.trim(),
      items: cleanedItems,
      sourcePayment: data.sourcePayment || CashOutPaymentSource.CASH,
      date: data.date,
      status,
      ...(data.remarks ? { remarks: data.remarks.trim() } : {}),
    };

    if (isEditMode && id) {
      if (editingDraft && status === CommerceEntryStatus.POSTED) {
        await postPurchase(id, payload);
      } else {
        await updatePurchase(id, payload);
      }
    } else {
      await createPurchase(payload);
    }
  };

  const onSaveDraft = handleSubmit((data) =>
    submitPurchase(data, CommerceEntryStatus.DRAFT),
  );
  const onSubmitForm = handleSubmit((data) =>
    submitPurchase(data, CommerceEntryStatus.POSTED),
  );

  const goToBack = () => {
    navigate(-1);
  };

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
                  ? "Edit Draft Purchase"
                  : "Edit Purchase"
                : "Record Purchase"}
            </h1>
            {editingDraft ? (
              <p className="text-sm text-muted-foreground mt-1">
                Draft — stock is not updated until you save this as a purchase.
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
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
          {!isEditMode && (
            <Can permission={PERMISSIONS.PURCHASES_READ}>
              <Link
                to={siteRoutes.purchasesList}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap text-sm"
              >
                <List size={18} />
                Purchase List
              </Link>
            </Can>
          )}
        </div>
      </div>

      <form
        id="purchase-create-form"
        onSubmit={onSubmitForm}
        className="mt-8 w-full animate-slide-up space-y-6"
      >
        <hr className="border-border-main" />

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div>
            <label className="mb-2 block ui-form-label">
              Company / Supplier Name
            </label>
            <select
              className={`common-input cursor-pointer ${errors.supplierName ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("supplierName", {
                required: "Supplier name is required",
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
            <label className="mb-2 block ui-form-label">Date</label>
            <input
              type="date"
              className={`common-input ${errors.date ? "border-red-500 focus:border-red-500" : ""}`}
              {...register("date", {
                required: "Date is required",
                onChange: () => {
                  expiryTouchedRef.current = {};
                  loadedEditRef.current = false;
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

          {canViewPurchasePrice && isEditMode ? (
            <div>
              <label className="mb-2 block ui-form-label">Total Price</label>
              <input
                type="text"
                readOnly
                value={
                  snapshotPayment != null ? formatMoney(snapshotPayment) : "—"
                }
                className="common-input bg-muted-foreground/5 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Snapshot from Product Prices at purchase time (read-only)
              </p>
            </div>
          ) : null}
        </div>

        {/* Products */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-bold text-foreground">Products</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add one or more products to this purchase
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
              const lifespan = pid ? lifespansByProduct[lineSkuKey] : null;
              const lifespanHint = lifespan
                ? lifespan.isLifetime
                  ? "Lifetime product (no auto expiry)"
                  : `Time span: ${formatLifespanLabel(lifespan.years, lifespan.months, lifespan.days)}`
                : null;
              const snap = snapshotItems[index];

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
                        onClick={() => {
                          remove(index);
                          const nextTouched: Record<number, boolean> = {};
                          Object.entries(expiryTouchedRef.current).forEach(
                            ([key, value]) => {
                              const i = Number(key);
                              if (i < index) nextTouched[i] = value;
                              if (i > index) nextTouched[i - 1] = value;
                            },
                          );
                          expiryTouchedRef.current = nextTouched;
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-danger-text hover:opacity-80 cursor-pointer"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    ) : null}
                  </div>

                  <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    <div className="md:col-span-2 lg:col-span-1">
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
                        placeholder="e.g. 100"
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
                      {errors.items?.[index]?.quantity && (
                        <p className="mt-1 text-xs text-danger-text font-semibold">
                          {errors.items[index]?.quantity?.message}
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
                        {...register(`items.${index}.expiryDate` as const, {
                          onChange: () => {
                            expiryTouchedRef.current[index] = true;
                          },
                        })}
                      />
                      {lifespanHint ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {lifespanHint}
                        </p>
                      ) : null}
                    </div>

                    {canViewPurchasePrice && isEditMode && snap ? (
                      <>
                        <div>
                          <label className="mb-2 block ui-form-label">
                            Per Item
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={
                              snap.rate != null ? formatMoney(snap.rate) : "—"
                            }
                            className="common-input bg-muted-foreground/5 cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block ui-form-label">
                            Line Total
                          </label>
                          <input
                            type="text"
                            readOnly
                            value={
                              snap.lineTotal != null
                                ? formatMoney(snap.lineTotal)
                                : "—"
                            }
                            className="common-input bg-muted-foreground/5 cursor-not-allowed"
                          />
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-2 block ui-form-label">Remarks</label>
          <textarea
            placeholder="e.g. Urgent delivery requested"
            rows={3}
            className="common-input py-3 resize-none"
            {...register("remarks")}
          />
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
                  ? "Save as Purchase"
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
