// import useOutsideClick from "hooks/click-outside-hook";
import useStore from "@/hooks/useStore";
import React from "react";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";
// import useOutsideClick from "";

interface SubMenue {
  title: string;
  path: string;
}

interface SidebarItemProps {
  text: string;
  // Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  active?: boolean;
  link: string;
  alert?: boolean;
  submenu?: SubMenue[];
  isSubmenuOpen?: boolean;
  onSubmenuToggle?: () => void;
}

export function SidebarItem({
  text,
  // Icon,
  link,
  active,
  alert = false,
  submenu = [],
  isSubmenuOpen = false,
  onSubmenuToggle,
}: SidebarItemProps) {
  const { setExpandSidebar } = useStore();
  const isSidebarExpanded = useSelector(
    (state: any) => state.sharedReducer?.isSidebarExpanded ?? true,
  );

  const handleExpandSidebar = () => {
    if (window.innerWidth < 640) {
      // Tailwind's `sm` breakpoint is 640px
      setExpandSidebar(false);
    }
  };

  const location = useLocation();

  // Prefer the `active` flag from parent (MainLayout) when provided,
  // otherwise fall back to local route-based detection.
  const isActive =
    typeof active === "boolean"
      ? active
      : link === "/"
        ? location.pathname === "/" || location.pathname.includes("/dashboard")
        : location.pathname.startsWith(link) ||
          submenu.some((item) => location.pathname.startsWith(item.path));

  const toggleSubmenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onSubmenuToggle?.();
  };

  // const sidebarRef = useOutsideClick(() => {
  //   setIsSubmenuOpen(false);
  // });

  return (
    <li
      // ref={sidebarRef}
      onClick={() => {
        if (!submenu.length) {
          handleExpandSidebar();
        }
      }}
      className={`
        relative flex flex-col items-center justify-center w-11/12 mx-auto
        text-white/70 font-semibold text-base cursor-pointer mb-1
        transition-colors group ${
          isActive
            ? "bg-tertiary text-white rounded-[6px] shadow-sm shadow-tertiary/20"
            : "hover:bg-white/10 rounded-[6px] hover:text-white"
        }
      `}
    >
      <Link
        to={submenu.length ? "#" : link}
        onClick={submenu.length ? toggleSubmenu : undefined}
        className="flex items-center w-full py-3 px-3 h-12"
      >
        <span className="overflow-hidden transition-all w-52 ml-2">{text}</span>
        {submenu.length > 0 && (
          <span className="ml-auto ">
            {isSubmenuOpen ? (
              <FiChevronUp
                className={` ${
                  isActive ? " text-white " : " hover:text-white"
                }`}
                size={20}
              />
            ) : (
              <FiChevronDown
                className={` ${
                  isActive ? " text-white " : " hover:text-white"
                }`}
                size={20}
              />
            )}
          </span>
        )}
        {alert && (
          <div className="absolute right-2 w-2 h-2 rounded bg-tertiary" />
        )}
      </Link>

      {/* Render submenu if available */}
      {submenu.length > 0 && (
        <ul
          className={`w-full bg-black/10 overflow-hidden transition-all duration-300 ease-in-out ${
            isSubmenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {submenu.map((item, index) => (
            <li
              key={index}
              className="py-2 pl-10"
              onClick={handleExpandSidebar}
            >
              <Link
                to={item.path}
                className={`text-sm text-white/70 hover:text-white hover:font-semibold transition-colors ${
                  location.pathname.startsWith(item.path)
                    ? "font-semibold text-white "
                    : "font-sm text-white/70"
                }`}
              >
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
