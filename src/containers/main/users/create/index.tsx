import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, Plus } from "lucide-react";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import { errorToaster } from "@/utils/helpers/common/alert-service";
import useRoles from "../../roles/useHooks";
import useUsers from "../useHooks";
import type { RbacRole } from "../../roles/types";

type UserForm = {
  fullName: string;
  title: string;
  email: string;
};

export default function UsersCreate() {
  const navigate = useNavigate();
  const { createUser } = useUsers();
  const { getRolesList } = useRoles();
  const [roles, setRoles] = useState<RbacRole[]>([]);
  const [roleIds, setRoleIds] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserForm>({
    defaultValues: { fullName: "", title: "", email: "" },
  });

  useEffect(() => {
    getRolesList(setRoles, { limit: 100, offset: 0 }, () => undefined);
  }, []);

  const toggleRole = (id: string) => {
    setRoleIds((prev) =>
      prev.includes(id) ? prev.filter((roleId) => roleId !== id) : [...prev, id],
    );
  };

  const onSubmit = async (form: UserForm) => {
    if (!roleIds.length) {
      errorToaster("Select at least one role");
      return;
    }
    await createUser({
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      roleIds,
      ...(form.title.trim() ? { title: form.title.trim() } : {}),
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(siteRoutes.users)}
            className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl text-foreground font-bold">Create User</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Email is verified automatically. A random 8-character password
              is emailed to the user.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 w-full space-y-6 animate-slide-up"
        noValidate
      >
        <hr className="border-border-main" />

        <div className="space-y-5">
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="mb-2 block ui-form-label">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g., Ali Khan"
                className={`common-input ${errors.fullName ? "border-red-500 focus:border-red-500" : ""}`}
                {...register("fullName", {
                  required: "Full name is required",
                  validate: (value) =>
                    value.trim().length > 0 || "Full name is required",
                })}
              />
              {errors.fullName && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block ui-form-label">Title</label>
              <input
                type="text"
                placeholder="e.g., Project Manager"
                className="common-input"
                {...register("title")}
              />
            </div>
          </div>

          <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
            <div>
              <label className="mb-2 block ui-form-label">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="e.g., user@example.com"
                className={`common-input ${errors.email ? "border-red-500 focus:border-red-500" : ""}`}
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email",
                  },
                })}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-500 font-semibold">
                  {errors.email.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-2 block ui-form-label">
              Roles <span className="text-red-500">*</span>
            </label>
            <p className="text-xs text-muted-foreground mb-3">
              A user can have multiple roles. System roles are hidden.
            </p>
            {roles.length ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {roles.map((role) => (
                  <label
                    key={role.id}
                    className="flex items-start gap-2 rounded-lg border border-border-main px-3 py-2 cursor-pointer hover:bg-muted-foreground/5"
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 shrink-0 rounded border-border-main"
                      checked={roleIds.includes(role.id)}
                      onChange={() => toggleRole(role.id)}
                    />
                    <span className="block text-sm font-medium text-foreground">
                      {role.name}
                    </span>
                  </label>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No roles available. Create a role first.
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-border-main/60">
          <Link
            to={siteRoutes.users}
            className="text-sm font-semibold text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex h-10 px-6 items-center justify-center gap-2 rounded-md bg-primary hover:opacity-95 font-semibold text-white text-sm transition-all cursor-pointer shadow-sm disabled:opacity-60"
          >
            <Plus size={18} />
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
