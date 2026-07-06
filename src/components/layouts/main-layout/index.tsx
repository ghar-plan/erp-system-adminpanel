import React, { ReactNode } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import Navbar from "@/components/navigation/Navbar";
import Sidebar from "@/components/navigation/Sidebar";
import { siteRoutes } from "@/utils/helpers/enums/routes.enum";
import {
  LayoutDashboard,
  Compass,
  UserCog,
  List,
  Banknote,
  UserSearch,
  BarChart3
} from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

interface MenuItem {
  text: string;
  path: string;
  icon: React.ReactNode;
}

const MainLayout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isSidebarExpanded = useAppSelector(
    (state) => state.sharedReducer?.isSidebarExpanded ?? true,
  );

  // Menu items aligned with sidebar mock image
  const menuItems: MenuItem[] = [
    {
      text: "Dashboard",
      path: siteRoutes.dashboard,
      icon: <LayoutDashboard size={20} />,
    },
    {
      text: "Projects",
      path: siteRoutes.projects,
      icon: <Compass size={20} />,
    },
    {
      text: "Vendors",
      path: siteRoutes.vendors,
      icon: <UserCog size={20} />,
    },
    {
      text: "Activities",
      path: siteRoutes.activity,
      icon: <List size={20} />,
    },
    {
      text: "Cashflow",
      path: siteRoutes.cashflow,
      icon: <Banknote size={20} />,
    },
    {
      text: "Prospects",
      path: siteRoutes.prospects,
      icon: <UserSearch size={20} />,
    },
    {
      text: "Reports",
      path: siteRoutes.reports,
      icon: <BarChart3 size={20} />,
    },
  ];

  const isActive = (path: string) => {
    if (path === siteRoutes.dashboard) {
      return location.pathname === siteRoutes.home || location.pathname === siteRoutes.dashboard;
    }
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div className="h-screen bg-background text-foreground flex transition-colors duration-200">
      <Sidebar>
        {menuItems.map((item, index) => (
          <li key={index} className="mx-3 mb-1.5 list-none">
            <Link
              to={item.path}
              className={`group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
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
          </li>
        ))}
      </Sidebar>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-background p-4 sm:p-6 transition-colors duration-200">
          <div className="">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
