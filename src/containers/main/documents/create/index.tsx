import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PlusSquare,
  Loader2,
  Plus,
  Trash2,
  List,
  FileText,
} from "lucide-react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import ProductVariantSelect, {
  ProductVariantValue,
} from "@/components/ui/ProductVariantSelect";
import PakistanPhoneInput from "@/components/ui/PakistanPhoneInput";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import {
  DocumentType,
  computeDocumentLineTotal,
  computeDocumentTotal,
  generateDocumentNo,
} from "@/utils/helpers/models/documents/document.dto";
import { normalizeVariantId } from "@/utils/helpers/models/product-sku";
import { formatMoney } from "@/utils/helpers/money";
import { validatePakistanMobile } from "@/utils/helpers/common/phone";
import { errorToaster } from "@/utils/helpers/common/alert-service";
import useStore from "@/hooks/useStore";
import useDocuments from "../useHooks";

type LineInput = {
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  /** UI-only: product has several variants and none chosen yet. */
  variantRequired?: boolean;
  quantity: number | string;
  rate: number | string;
};

interface DocumentFormInputs {
  documentNo: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  remarks: string;
  items: LineInput[];
}

const today = () => new Date().toISOString().slice(0, 10);

const emptyLine = (): LineInput => ({
  productId: "",
  productName: "",
  variantId: "",
  variantName: "",
  variantRequired: false,
  quantity: "",
  rate: "",
});

type Props = {
  type: DocumentType;
};

export default function DocumentCreate({ type }: Props) {
  const navigate = useNavigate();
  const { isLoading } = useStore();
  const { createDocument, downloadPdf } = useDocuments();
  const [submitting, setSubmitting] = useState(false);

  const isBill = type === DocumentType.BILL;
  const title = isBill ? "Generate Bill" : "Generate Quotation";
  const listRoute = isBill
    ? siteRoutes.documentsBillsList
    : siteRoutes.documentsQuotationsList;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DocumentFormInputs>({
    defaultValues: {
      documentNo: generateDocumentNo(type),
      date: today(),
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      remarks: "",
      items: [emptyLine()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = watch("items");
  const subtotal = computeDocumentTotal(items || []);

  const handleProductVariantChange = (
    index: number,
    value: ProductVariantValue,
  ) => {
    setValue(`items.${index}.productId`, value.productId, {
      shouldValidate: true,
    });
    setValue(`items.${index}.productName`, value.productName, {
      shouldValidate: true,
    });
    setValue(
      `items.${index}.variantId`,
      normalizeVariantId(value.variantId),
      { shouldValidate: true },
    );
    setValue(`items.${index}.variantName`, value.variantName || "");
    setValue(`items.${index}.variantRequired`, !!value.requiresVariant);
  };

  const onSubmitForm = async (data: DocumentFormInputs) => {
    const cleanedItems = (data.items || [])
      .filter((item) => item.productId && item.productName)
      .map((item) => ({
        productId: String(item.productId),
        productName: item.productName,
        variantId: normalizeVariantId(item.variantId),
        variantName: item.variantName || null,
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
      if (!Number.isFinite(item.rate) || item.rate < 0) {
        errorToaster(`Line ${index + 1}: enter a valid rate`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const created = await createDocument({
        type,
        documentNo: data.documentNo.trim(),
        date: data.date,
        customerName: data.customerName.trim(),
        customerPhone: data.customerPhone.trim(),
        customerAddress: data.customerAddress.trim(),
        items: cleanedItems,
        ...(data.remarks?.trim() ? { remarks: data.remarks.trim() } : {}),
      });

      if (created?.id) {
        await downloadPdf(
          created.id,
          `${type}-${created.documentNo || created.id}.pdf`,
        );
        navigate(listRoute);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="text-2xl text-foreground font-bold">{title}</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Product from catalog — rate, quantity, and customer details are
              manual
            </p>
          </div>
        </div>
        <Can permission={PERMISSIONS.DOCUMENTS_READ}>
          <Link
            to={listRoute}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-primary hover:opacity-90 font-bold text-white transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer whitespace-nowrap text-sm"
          >
            <List size={18} />
            {isBill ? "Bills List" : "Quotations List"}
          </Link>
        </Can>
      </div>

      <form
        onSubmit={handleSubmit(onSubmitForm)}
        className="mt-8 w-full animate-slide-up space-y-6"
      >
        <hr className="border-border-main" />

        <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
          <div>
            <label className="mb-2 block ui-form-label">
              {isBill ? "Bill No" : "Quotation No"}
            </label>
            <input
              type="text"
              className={`common-input ${errors.documentNo ? "border-red-500" : ""}`}
              {...register("documentNo", {
                required: "Document number is required",
              })}
            />
          </div>
          <div>
            <label className="mb-2 block ui-form-label">Date</label>
            <input
              type="date"
              className={`common-input ${errors.date ? "border-red-500" : ""}`}
              {...register("date", { required: "Date is required" })}
            />
          </div>
        </div>

        <div className="rounded-xl border border-border-main bg-card p-4 space-y-4">
          <h2 className="text-base font-bold text-foreground">Bill To</h2>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="mb-2 block ui-form-label">Name</label>
              <input
                type="text"
                placeholder="Customer name"
                className={`common-input ${errors.customerName ? "border-red-500" : ""}`}
                {...register("customerName", {
                  required: "Customer name is required",
                })}
              />
              {errors.customerName && (
                <p className="mt-1 text-xs text-danger-text font-semibold">
                  {errors.customerName.message}
                </p>
              )}
            </div>
            <div>
              <label className="mb-2 block ui-form-label">Phone</label>
              <Controller
                name="customerPhone"
                control={control}
                rules={{
                  validate: (value) => validatePakistanMobile(value),
                }}
                render={({ field }) => (
                  <PakistanPhoneInput
                    name={field.name}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    hasError={!!errors.customerPhone}
                  />
                )}
              />
              {errors.customerPhone && (
                <p className="mt-1 text-xs text-danger-text font-semibold">
                  {errors.customerPhone.message}
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block ui-form-label">Address</label>
              <input
                type="text"
                placeholder="Customer address"
                className={`common-input ${errors.customerAddress ? "border-red-500" : ""}`}
                {...register("customerAddress", {
                  required: "Address is required",
                })}
              />
              {errors.customerAddress && (
                <p className="mt-1 text-xs text-danger-text font-semibold">
                  {errors.customerAddress.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h2 className="text-base font-bold text-foreground">Products</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select product and variant; enter quantity and rate manually
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
              const lineTotal = computeDocumentLineTotal(
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
                        Product / Variant
                      </label>
                      <ProductVariantSelect
                        productId={String(line?.productId || "")}
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
                        className={`common-input ${errors.items?.[index]?.quantity ? "border-red-500" : ""}`}
                        {...register(`items.${index}.quantity` as const, {
                          required: "Quantity is required",
                          valueAsNumber: true,
                          min: {
                            value: 1,
                            message: "Quantity must be at least 1",
                          },
                        })}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block ui-form-label">
                        Rate (manual)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="e.g. 1300"
                        className={`common-input ${errors.items?.[index]?.rate ? "border-red-500" : ""}`}
                        {...register(`items.${index}.rate` as const, {
                          required: "Rate is required",
                          valueAsNumber: true,
                          min: {
                            value: 0,
                            message: "Rate cannot be negative",
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
            <label className="mb-2 block ui-form-label">Remarks</label>
            <textarea
              rows={3}
              placeholder="Optional notes"
              className="common-input py-3 resize-none"
              {...register("remarks")}
            />
          </div>
          <div>
            <label className="mb-2 block ui-form-label">Total</label>
            <input
              type="text"
              readOnly
              value={formatMoney(subtotal)}
              className="common-input bg-muted-foreground/5 cursor-not-allowed font-semibold"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border-main/60">
          <button
            type="submit"
            disabled={isLoading || submitting}
            className="flex h-10 px-6 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || submitting ? (
              <>
                <Loader2 className="animate-spin" size={16} />
                Generating PDF...
              </>
            ) : (
              <>
                <PlusSquare size={18} />
                {isBill ? "Generate Bill PDF" : "Generate Quotation PDF"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
