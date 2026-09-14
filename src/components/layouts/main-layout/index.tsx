import React, { ReactNode, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import Navbar from "@/components/navigation/Navbar";
import Sidebar from "@/components/navigation/Sidebar";
import Footer from "@/components/navigation/Footer";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import {
  LayoutDashboard,
  Compass,
  UserCog,
  List,
  Banknote,
  UserSearch,
  BarChart3,
  ChevronDown,
  ChevronRight,
  FileSignature,
  Shield,
  ClipboardList,
  Store,
  KeyRound,
  UserCheck,
  Users,
  Building2,
  MessageSquare,
  Clock,
  CalendarDays,
} from "lucide-react";
import { usePermissions } from "@/hooks/usePermissions";
import { filterMenuByPermissions, menuConfig } from "@/navigation/menu.config";

interface LayoutProps {
  children: ReactNode;
}

const MENU_ICONS: Record<string, React.ReactNode> = {
  dashboard: <LayoutDashboard size={20} />,
  projects: <Compass size={20} />,
  comments: <MessageSquare size={20} />,
  vendors: <UserCog size={20} />,
  activities: <List size={20} />,
  cashflow: <Banknote size={20} />,
  prospects: <UserSearch size={20} />,
  contracts: <FileSignature size={20} />,
  reports: <BarChart3 size={20} />,
  "roles-permissions": <Shield size={20} />,
  attendance: <Clock size={20} />,
  leaves: <CalendarDays size={20} />,
};

const CHILD_ICONS: Record<string, React.ReactNode> = {
  "project-list": <ClipboardList size={16} />,
  "vendor-list": <Store size={16} />,
  permissions: <KeyRound size={16} />,
  roles: <UserCheck size={16} />,
  users: <Users size={16} />,
  clients: <Building2 size={16} />,
  employees: <Users size={16} />,
};

const MainLayout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isSidebarExpanded = useAppSelector(
    (state) => state.sharedReducer?.isSidebarExpanded ?? true,
  );
  const { hasPermission, hasAnyPermission, hasExplicitPermission } =
    usePermissions();

  const menuItems = useMemo(
    () =>
      filterMenuByPermissions(
        menuConfig,
        hasPermission,
        hasAnyPermission,
        hasExplicitPermission,
      ).map((entry) => ({
        ...entry,
        icon: MENU_ICONS[entry.key] ?? null,
      })),
    [hasPermission, hasAnyPermission, hasExplicitPermission],
  );

  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({
    Reports: false,
    "Roles & Users": false,
  });

  const toggleDropdown = (text: string) => {
    setOpenDropdowns((prev) => ({ ...prev, [text]: !prev[text] }));
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    if (path === siteRoutes.dashboard) {
      return (
        location.pathname === siteRoutes.home ||
        location.pathname === siteRoutes.dashboard
      );
    }
    return (
      location.pathname === path || location.pathname.startsWith(path + "/")
    );
  };

  const isChildActive = (children: { path: string }[]) => {
    return children.some((child) => isActive(child.path));
  };

  return (
    <div className="h-screen bg-background text-foreground flex transition-colors duration-200">
      <Sidebar>
        {menuItems.map((item) => {
          const hasChildren = !!item.children?.length;
          const isOpen = openDropdowns[item.text];
          const activeParent = hasChildren
            ? isChildActive(item.children!)
            : isActive(item.path);

          return (
            <li key={item.key} className="mx-3 mb-1.5 list-none">
              {hasChildren ? (
                <div>
                  <button
                    onClick={() => toggleDropdown(item.text)}
                    className={`w-full group flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                      activeParent
                        ? "bg-tertiary/20 text-white shadow-sm"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`transition-transform duration-200 ${activeParent ? "scale-110" : "group-hover:scale-110"}`}
                      >
                        {item.icon}
                      </span>
                      <span
                        className={`font-medium transition-opacity duration-200 ${
                          isSidebarExpanded ? "opacity-100" : "opacity-0 md:opacity-0"
                        }`}
                      >
                        {item.text}
                      </span>
                    </div>
                    {isSidebarExpanded && (
                      <span className="transition-transform duration-200">
                        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </span>
                    )}
                  </button>

                  {isOpen && isSidebarExpanded && (
                    <ul className="mt-1 ml-6 space-y-1">
                      {item.children!.map((child) => (
                        <li key={child.path}>
                          <Link
                            to={child.path}
                            className={`group/child flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg transition-all duration-200 cursor-pointer ${
                              isActive(child.path)
                                ? "bg-tertiary text-white shadow-lg shadow-tertiary/30 font-medium"
                                : "text-white/60 hover:text-white hover:bg-white/5"
                            }`}
                          >
                            <span
                              className={`shrink-0 transition-transform duration-200 ${
                                isActive(child.path)
                                  ? "scale-110"
                                  : "group-hover/child:scale-110"
                              }`}
                            >
                              {child.icon ? CHILD_ICONS[child.icon] : null}
                            </span>
                            <span>{child.title}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <Link
                  to={item.path}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer ${
                    isActive(item.path)
                      ? "bg-tertiary text-white shadow-lg shadow-tertiary/30"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span
                    className={`transition-transform duration-200 ${
                      isActive(item.path) ? "scale-110" : "group-hover:scale-110"
                    }`}
                  >
                    {item.icon}
                  </span>
                  <span
                    className={`font-medium transition-opacity duration-200 ${
                      isSidebarExpanded ? "opacity-100" : "opacity-0 md:opacity-0"
                    }`}
                  >
                    {item.text}
                  </span>
                </Link>
              )}
            </li>
          );
        })}
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 transition-colors duration-200">
          <div className="">{children}</div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default MainLayout;
