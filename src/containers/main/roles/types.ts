export type RbacPermission = {
  id: string;
  action: string;
  resource: string;
  codename: string;
  status?: boolean;
};

export type RbacRole = {
  id: string;
  name: string;
  status?: boolean;
  permissions?: RbacPermission[];
  created_at?: string;
};
