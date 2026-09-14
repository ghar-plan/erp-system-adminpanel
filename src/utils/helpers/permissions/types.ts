export type AuthRole = {
  id: string | null;
  name: string;
  slug: string;
};

export type AuthSession = {
  id: string;
  name: string;
  email: string;
  fullName: string;
  status: boolean | string;
  role: AuthRole;
  currentRole: string;
  isSuperAdmin: boolean;
  isClient: boolean;
  permissions: string[];
};

export type PermissionMode = "any" | "all";

export type SessionStatus = "idle" | "loading" | "ready" | "error";
