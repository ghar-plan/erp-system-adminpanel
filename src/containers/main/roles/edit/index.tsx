import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import Button from "@/components/ui/Button";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import {
  formatModuleLabel,
  formatPermissionLabel,
  groupPermissionsByModule,
} from "../group-permissions";
import {
  actionImpliesView,
  expandImpliedReads,
  isViewAction,
  splitCodename,
} from "@/utils/helpers/permissions/permission-implications";
import useRoles from "../useHooks";
import { errorToaster } from "@/utils/helpers/common/alert-service";
import type { RbacPermission, RbacRole } from "../types";

type RoleForm = {
  name: string;
};

export default function RoleEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;
  const {
    getRoleDetail,
    getPermissionsCatalog,
    createRole,
    updateRole,
    permissionIdsFromCodenames,
  } = useRoles();

  const [role, setRole] = useState<RbacRole | null>(null);
  const [catalog, setCatalog] = useState<RbacPermission[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(isNew);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoleForm>({
    defaultValues: { name: "" },
  });

  const modules = useMemo(() => groupPermissionsByModule(catalog), [catalog]);

  useEffect(() => {
    getPermissionsCatalog(setCatalog);
  }, []);

  useEffect(() => {
    if (isNew || !id) {
      setLoaded(true);
      return;
    }
    (async () => {
      const data = await getRoleDetail(id, setRole);
      if (data) {
        reset({ name: data.name });
        setSelected(
          expandImpliedReads(
            (data.permissions || []).map((permission) => permission.codename),
          ),
        );
      }
      setLoaded(true);
    })();
  }, [id, isNew]);

  const toggle = (codename: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      const { resource, action } = splitCodename(codename);
      const moduleOthersSelected = catalog.some(
        (permission) =>
          permission.resource === resource &&
          actionImpliesView(permission.action) &&
          next.has(permission.codename),
      );

      if (next.has(codename)) {
        if (isViewAction(action) && moduleOthersSelected) return prev;
        next.delete(codename);
        return next;
      }

      next.add(codename);
      if (actionImpliesView(action) && resource) {
        const readPermission = catalog.find(
          (permission) =>
            permission.resource === resource && isViewAction(permission.action),
        );
        if (readPermission) next.add(readPermission.codename);
      }
      return next;
    });
  };

  const toggleModule = (modPerms: RbacPermission[], on: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const permission of modPerms) {
        if (on) next.add(permission.codename);
        else next.delete(permission.codename);
      }
      return on ? expandImpliedReads(next) : next;
    });
  };

  const selectAll = (on: boolean) => {
    setSelected(on ? new Set(catalog.map((permission) => permission.codename)) : new Set());
  };

  const onSave = async (form: RoleForm) => {
    const permissions = permissionIdsFromCodenames(catalog, selected);
    if (!permissions.length) {
      errorToaster("Select at least one permission");
      return;
    }
    if (isNew) {
      await createRole({ name: form.name.trim(), permissions }, () => {
        navigate(siteRoutes.roles, { replace: true });
      });
      return;
    }
    if (!id) return;
    await updateRole(id, { name: form.name.trim(), permissions }, () => {
      navigate(siteRoutes.roles, { replace: true });
    });
  };

  if (!isNew && loaded && !role) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Role not found.</p>
        <Link to={siteRoutes.roles} className="text-sm font-semibold text-primary">
          Back to roles
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link
        to={siteRoutes.roles}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <ArrowLeft size={16} /> Back to roles
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl text-foreground font-bold">
          {isNew ? "Create role" : `Edit · ${role?.name || "Role"}`}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Create, edit, delete, export, and other actions include View for that
          module automatically.
        </p>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit(onSave)} noValidate>
        <section className="bg-card border border-border-main rounded-xl p-5 max-w-2xl space-y-3">
          <label className="block">
            <span className="text-sm font-semibold text-foreground">
              Role name <span className="text-red-500">*</span>
            </span>
            <input
              className="common-input mt-1.5"
              {...register("name", { required: "Role name is required" })}
            />
            {errors.name?.message ? (
              <span className="mt-1 block text-xs text-red-500">
                {errors.name.message}
              </span>
            ) : null}
          </label>
        </section>

        <section className="bg-card border border-border-main rounded-xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-foreground">Permissions</h2>
              <p className="text-xs text-muted-foreground">
                {selected.size} selected
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => selectAll(true)}>
                Select all
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => selectAll(false)}>
                Clear all
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            {modules.map(([module, perms]) => {
              const allOn = perms.every((permission) =>
                selected.has(permission.codename),
              );
              const someOn =
                !allOn &&
                perms.some((permission) => selected.has(permission.codename));
              return (
                <div key={module} className="space-y-2">
                  <div className="flex items-center justify-between gap-2 border-b border-border-main pb-2">
                    <h3 className="text-sm font-bold capitalize text-foreground">
                      {formatModuleLabel(module)}
                    </h3>
                    <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-semibold text-muted-foreground">
                      <input
                        type="checkbox"
                        className="rounded border-border-main"
                        checked={allOn}
                        ref={(el) => {
                          if (el) el.indeterminate = someOn;
                        }}
                        onChange={(e) => toggleModule(perms, e.target.checked)}
                      />
                      Module
                    </label>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {perms.map((permission) => {
                      const viewLocked =
                        isViewAction(permission.action) &&
                        perms.some(
                          (item) =>
                            actionImpliesView(item.action) &&
                            selected.has(item.codename),
                        );
                      return (
                        <label
                          key={permission.codename}
                          className={`flex items-start gap-2 rounded-lg border px-3 py-2 ${
                            viewLocked
                              ? "border-primary/30 bg-primary/5 cursor-not-allowed"
                              : "border-border-main cursor-pointer hover:bg-muted-foreground/5"
                          }`}
                        >
                          <input
                            type="checkbox"
                            className="mt-0.5 shrink-0 rounded border-border-main"
                            checked={selected.has(permission.codename)}
                            disabled={viewLocked}
                            title={
                              viewLocked
                                ? "View is included with other permissions in this module"
                                : undefined
                            }
                            onChange={() => toggle(permission.codename)}
                          />
                          <span className="block text-sm font-medium text-foreground">
                            {formatPermissionLabel(permission)}
                            {viewLocked ? (
                              <span className="block text-xs font-normal text-muted-foreground">
                                Included with other actions
                              </span>
                            ) : null}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {!catalog.length ? (
              <p className="text-sm text-muted-foreground">
                No permissions loaded. Run the backend seeder so the catalog exists.
              </p>
            ) : null}
          </div>
        </section>

        <Can
          permission={isNew ? PERMISSIONS.ROLES_CREATE : PERMISSIONS.ROLES_UPDATE}
        >
          <Button type="submit">{isNew ? "Create role" : "Save changes"}</Button>
        </Can>
      </form>
    </div>
  );
}
