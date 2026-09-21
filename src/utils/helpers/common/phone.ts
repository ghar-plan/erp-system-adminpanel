/** Pakistani mobile: +92 followed by 10 digits, e.g. +923001234567 */
export const PAKISTAN_MOBILE_REGEX = /^\+92\d{10}$/;

export const PAKISTAN_MOBILE_FORMAT_MESSAGE =
  "Mobile number must be in format +923001234567";

export const PAKISTAN_MOBILE_PLACEHOLDER = "e.g., +923001234567";

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
