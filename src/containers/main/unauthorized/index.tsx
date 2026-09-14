import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";

export default function Unauthorized() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-bg text-danger-text">
        <ShieldX size={28} />
      </div>
      <h1 className="text-2xl font-bold text-foreground">Access denied</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        You do not have permission to view this page. Ask an administrator to
        assign the required role permissions.
      </p>
      <Link
        to={siteRoutes.profile}
        className="mt-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
      >
        Go to profile
      </Link>
    </div>
  );
}
