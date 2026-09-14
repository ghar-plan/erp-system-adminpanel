import type { AuthRole, AuthSession } from "@/utils/helpers/permissions/types";
import { toCodename } from "@/utils/helpers/permissions/permission-engine";

type LooseRecord = Record<string, unknown>;

function asString(value: unknown, fallback = ""): string {
  if (value == null) return fallback;
  return String(value);
}

function asBool(value: unknown): boolean {
  return value === true || value === "true" || value === 1;
}

function slugFromName(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, "$1-$2").replace(/\s+/g, "-").toLowerCase();
}

function normalizeRole(raw: unknown, fallbackName = ""): AuthRole {
  if (raw && typeof raw === "object") {
    const r = raw as LooseRecord;
    const name = asString(r.name, fallbackName || "User");
    return {
      id: r.id != null ? asString(r.id) : null,
      name,
      slug: asString(r.slug, slugFromName(name)),
    };
  }
  return {
    id: null,
    name: fallbackName || "User",
    slug: slugFromName(fallbackName || "user"),
  };
}

function permissionToCodename(item: unknown): string {
  if (typeof item === "string") return item;
  if (item && typeof item === "object") {
    const p = item as LooseRecord;
    if (p.codename) return asString(p.codename);
    if (p.resource && p.action) {
      return toCodename(asString(p.resource), asString(p.action));
    }
  }
  return "";
}

export function normalizeAuthSession(data: unknown): AuthSession {
  const payload = (data && typeof data === "object" ? data : {}) as LooseRecord;
  const user = (
    payload.user && typeof payload.user === "object"
      ? payload.user
      : payload
  ) as LooseRecord;

  const rolesRaw = Array.isArray(payload.roles) ? payload.roles : [];
  const firstRole = rolesRaw[0] ?? payload.role;
  const role = normalizeRole(firstRole, asString(user.fullName ? "" : ""));
  const isSuperAdmin = asBool(
    payload.superAdmin ?? payload.isSuperAdmin ?? payload.is_super_admin,
  );
  const isClient =
    asBool(payload.isClient ?? payload.is_client) ||
    rolesRaw.some((item) => {
      const name =
        item && typeof item === "object"
          ? asString((item as LooseRecord).name)
          : asString(item);
      return name.toLowerCase() === "client";
    });

  const permissions = Array.isArray(payload.permissions)
    ? payload.permissions.map(permissionToCodename).filter(Boolean)
    : [];

  const fullName = asString(user.fullName, asString(user.name));

  return {
    id: asString(user.id),
    name: fullName,
    email: asString(user.email),
    fullName,
    status: (user.status as boolean | string) ?? true,
    role,
    currentRole: isSuperAdmin ? "Super Admin" : role.name,
    isSuperAdmin,
    isClient,
    permissions,
  };
}
