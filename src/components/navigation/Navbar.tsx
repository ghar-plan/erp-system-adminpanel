import React, { useState } from "react";
import { HiMiniBars3 } from "react-icons/hi2";
import { useAppSelector } from "@/store/hooks";
import { FaAngleDown } from "react-icons/fa6";
import { Sun, Moon } from "lucide-react";
import useOutsideClick from "@/hooks/click-outside-hook";
import useStore from "@/hooks/useStore";

const Navbar: React.FC = () => {
  const [profileDropDownOpened, setProfileDropdownOpened] = useState(false);
  const profileDropdownRef = useOutsideClick(() =>
    setProfileDropdownOpened(false),
  );

  const { userData: storeUser } = useAppSelector(
    (state) => state.sharedReducer || {},
  );

  const fullName = storeUser?.fullName || "";
  const email = storeUser?.email || "";
  let firstName = storeUser?.firstName || "";
  let lastName = storeUser?.lastName || "";

  if (!firstName && fullName) {
    const parts = fullName.trim().split(/\s+/);
    firstName = parts[0] || "";
    lastName = parts.slice(1).join(" ") || "";
  }

  const currentRole = storeUser?.currentRole || (storeUser?.roles && storeUser.roles[0]) || "";
  const displayFullName = fullName || (firstName || lastName ? `${firstName} ${lastName}`.trim() : email);

  const initials = (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() || email.charAt(0).toUpperCase() || "U";

  const isSidebarExpanded = useAppSelector(
    (state) => state.sharedReducer?.isSidebarExpanded ?? true,
  );

  const { setExpandSidebar, logout } = useStore();

  const [theme, setTheme] = useState<"light" | "dark">(
    (localStorage.getItem("theme") as "light" | "dark") || "light"
  );

  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    }
  };

  const handleExpandSidebar = () => {
    setExpandSidebar(!isSidebarExpanded);
  };

  return (
    <div className="h-20 bg-bg-navbar w-full flex justify-between items-center border-b border-border-main shadow-sm px-5 transition-colors duration-200">
      <div className="">
        <HiMiniBars3
          size={30}
          className="cursor-pointer text-foreground hover:text-primary transition-colors"
          onClick={handleExpandSidebar}
        />
      </div>
      <div className="flex items-center gap-4">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg border border-border-main hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer text-foreground flex items-center justify-center"
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
        >
          {theme === "light" ? (
            <Moon size={18} className="text-slate-600" />
          ) : (
            <Sun size={18} className="text-amber-400 animate-spin-slow" />
          )}
        </button>

        {/* Profile Selector */}
        <div
          className="p-2.5 flex justify-center items-center gap-3 sm:gap-4 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent hover:border-border-main"
          onClick={() => setProfileDropdownOpened(!profileDropDownOpened)}
        >
          <div className="w-9 h-9 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm">
            {initials}
          </div>
          <div className="hidden sm:block text-left">
            <h5 className="text-sm font-bold text-foreground whitespace-nowrap leading-tight">
              {displayFullName}
            </h5>
            {currentRole && (
              <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                {currentRole.replace(/_/g, " ")}
              </p>
            )}
          </div>
          <div className="p-1 rounded-full border border-border-main text-muted-foreground">
            <FaAngleDown size={14} />
          </div>
        </div>
        
        {profileDropDownOpened && (
          <div
            ref={profileDropdownRef}
            className="absolute z-10 top-20 right-8 h-fit w-56 bg-card rounded-lg shadow-xl border border-border-main p-3 animate-fade-in"
          >
            <p
              className="font-semibold text-sm text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20 p-3 rounded-lg transition-colors"
              onClick={logout}
            >
              Logout
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
