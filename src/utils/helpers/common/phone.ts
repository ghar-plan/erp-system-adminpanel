/** Pakistani mobile: +92 followed by 10 digits, e.g. +923001234567 */
export const PAKISTAN_COUNTRY_CODE = "+92";

export const PAKISTAN_MOBILE_REGEX = /^\+92\d{10}$/;

export const PAKISTAN_MOBILE_FORMAT_MESSAGE =
  "Mobile number must be in format +923001234567";

export const PAKISTAN_MOBILE_PLACEHOLDER = "3001234567";

/** Strip to local 10 digits (without country code / leading 0). */
export function toPakistanLocalDigits(value: string | undefined | null): string {
  let digits = String(value || "").replace(/\D/g, "");
  if (digits.startsWith("92") && digits.length > 10) {
    digits = digits.slice(2);
  }
  if (digits.startsWith("0")) {
    digits = digits.slice(1);
  }
  return digits.slice(0, 10);
}

/** Build full E.164 value (+92XXXXXXXXXX) from local digits or mixed input. */
export function toPakistanE164(value: string | undefined | null): string {
  const local = toPakistanLocalDigits(value);
  return local ? `${PAKISTAN_COUNTRY_CODE}${local}` : "";
}

export function isValidPakistanMobile(value: string): boolean {
  return PAKISTAN_MOBILE_REGEX.test(value.trim());
}

export function validatePakistanMobile(
  value: string | undefined | null,
  options?: { optional?: boolean },
): true | string {
  const trimmed = (value || "").trim();
  if (!trimmed) {
    return options?.optional ? true : "Mobile number is required";
  }
  return isValidPakistanMobile(trimmed) || PAKISTAN_MOBILE_FORMAT_MESSAGE;
}
