import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Building2, Mail, Phone } from "lucide-react";
import { IoArrowBackOutline } from "react-icons/io5";
import DataNotFound from "@/components/particles/table/data-not-found";
import { Can } from "@/components/auth/Can";
import { PERMISSIONS } from "@/utils/helpers/permissions/permission-constants";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import useClients from "../useHooks";

function formatDate(value?: string | Date | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString();
}

export default function ClientsView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getClientById } = useClients();
  const [detail, setDetail] = useState<any | null>(null);

  useEffect(() => {
    if (id) getClientById(id, setDetail);
  }, [id]);

  if (!detail?.user) return null;

  const user = detail.user;
  const projects = detail.projects || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(siteRoutes.clients)}
            className="w-10 h-10 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
            title="Go Back"
          >
            <IoArrowBackOutline size={20} className="stroke-[2.5]" />
          </button>
          <div>
            <h1 className="text-2xl text-foreground font-bold leading-tight">{user.fullName}</h1>
            <p className="text-sm text-muted-foreground">Client account</p>
          </div>
        </div>
      </div>
      <hr className="border-border-main" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="app-card border border-border-main shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Mail size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Email</p>
            <h3 className="text-lg font-bold text-foreground break-all">{user.email || "--"}</h3>
          </div>
        </div>
        <div className="app-card border border-border-main shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Phone size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Phone</p>
            <h3 className="text-lg font-bold text-foreground">{user.phone || "--"}</h3>
          </div>
        </div>
        <div className="app-card border border-border-main shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Building2 size={22} />
          </div>
          <div>
            <p className="text-sm font-semibold text-muted-foreground">Projects</p>
            <h3 className="text-lg font-bold text-foreground">{projects.length}</h3>
          </div>
        </div>
      </div>
      <div className="bg-card rounded-xl border border-border-main p-6 grid gap-4 md:grid-cols-2">
        {[
          { label: "Name", value: user.fullName },
          { label: "Title", value: user.title },
          { label: "Email", value: user.email },
          { label: "Phone", value: user.phone },
          { label: "Status", value: user.status === false ? "Disabled" : "Enabled" },
        ].map((field) => (
          <div key={field.label}>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{field.label}</p>
            <p className="mt-1 text-sm font-medium text-foreground">{field.value || "--"}</p>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <h2 className="text-lg font-bold text-foreground">Projects</h2>
        {projects.length ? (
          <div className="bg-card rounded-xl border border-border-main overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-main">
                <thead className="bg-muted-foreground/5">
                  <tr>
                    {["Site", "Region", "Type", "Start Date", "Plan"].map((column) => (
                      <th
                        key={column}
                        className="px-6 py-4 text-xs font-bold text-left text-muted-foreground uppercase tracking-wider whitespace-nowrap"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-main bg-card text-foreground">
                  {projects.map((project: any) => (
                    <tr key={project.id} className="hover:bg-muted-foreground/5 transition-colors">
                      <td className="table-td font-semibold">
                        <Can
                          permission={PERMISSIONS.CONSTRUCTION_SITE_READ}
                          fallback={project.siteName || "--"}
                        >
                          <Link
                            to={`/projects/view/${project.id}`}
                            className="text-primary hover:underline"
                          >
                            {project.siteName || "--"}
                          </Link>
                        </Can>
                      </td>
                      <td className="table-td">
                        {[project.region, project.subregion].filter(Boolean).join(" / ") || "--"}
                      </td>
                      <td className="table-td">{project.constructionType || "--"}</td>
                      <td className="table-td">{formatDate(project.startDate)}</td>
                      <td className="table-td">{project.paymentPlan || "--"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <DataNotFound show={true} />
        )}
      </div>
    </div>
  );
}
