import React from "react";
import {
  PAKISTAN_COUNTRY_CODE,
  PAKISTAN_MOBILE_PLACEHOLDER,
  toPakistanLocalDigits,
} from "@/utils/helpers/common/phone";

interface PakistanPhoneInputProps {
  value?: string;
  onChange: (fullValue: string) => void;
  onBlur?: () => void;
  name?: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  hasError?: boolean;
  className?: string;
}

export default function PakistanPhoneInput({
  value = "",
  onChange,
  onBlur,
  name,
  id,
  placeholder = PAKISTAN_MOBILE_PLACEHOLDER,
  disabled = false,
  readOnly = false,
  hasError = false,
  className = "",
}: PakistanPhoneInputProps) {
  const localDigits = toPakistanLocalDigits(value);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Input field is local-only (10 digits). Keep only digits so country-code
    // logic never re-absorbs typed digits like "3" into "+923" → "923".
    const typedLocal = event.target.value.replace(/\D/g, "").slice(0, 10);
    onChange(typedLocal ? `${PAKISTAN_COUNTRY_CODE}${typedLocal}` : "");
  };

  return (
    <div
      className={`flex items-stretch rounded-md border bg-card overflow-hidden ${
        hasError ? "border-red-500" : "border-border-main"
      } ${disabled || readOnly ? "bg-muted-foreground/5" : ""} ${className}`}
    >
      <span className="inline-flex items-center px-3 text-sm font-semibold text-muted-foreground border-r border-border-main select-none shrink-0">
        {PAKISTAN_COUNTRY_CODE}
      </span>
      <input
        id={id}
        name={name}
        type="tel"
        inputMode="numeric"
        autoComplete="off"
        value={localDigits}
        onChange={handleChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        maxLength={10}
        className={`common-input border-0 rounded-none shadow-none focus:ring-0 ${
          readOnly || disabled ? "cursor-not-allowed bg-transparent" : ""
        }`}
      />
    </div>
  );
}
