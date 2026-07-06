import React, { useState, useEffect } from "react";
import { HiMiniBars3 } from "react-icons/hi2";
import { useAppSelector } from "@/store/hooks";
import { FaAngleDown } from "react-icons/fa6";
import { Sun, Moon, User, LogOut } from "lucide-react";
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

  const currentRole =
    storeUser?.currentRole || (storeUser?.roles && storeUser.roles[0]) || "";
  const displayFullName =
    fullName ||
    (firstName || lastName ? `${firstName} ${lastName}`.trim() : email);

  const initials =
    (firstName.charAt(0) + lastName.charAt(0)).toUpperCase() ||
    email.charAt(0).toUpperCase() ||
    "U";

  const isSidebarExpanded = useAppSelector(
    (state) => state.sharedReducer?.isSidebarExpanded ?? true,
  );

  const { setExpandSidebar, logout } = useStore();

  const [theme, setTheme] = useState<"light" | "dark">(
    (localStorage.getItem("theme") as "light" | "dark") || "light",
  );

  // Sync theme with DOM element on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

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
          className="p-2 rounded-lg border border-border-main hover:bg-panel-bg transition-colors cursor-pointer text-foreground flex items-center justify-center"
          title={
            theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"
          }
        >
          {theme === "light" ? (
            <Moon size={18} className="text-muted-foreground" />
          ) : (
            <Sun size={18} className="text-warning-text animate-spin-slow" />
          )}
        </button>

        {/* Profile Selector */}
        <div
          className="p-2.5 flex justify-center items-center gap-3 sm:gap-4 cursor-pointer hover:bg-panel-bg rounded-lg transition-colors border border-transparent hover:border-border-main relative"
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

          {profileDropDownOpened && (
            <div
              ref={profileDropdownRef}
              className="absolute z-20 top-20 right-0 w-64 bg-card rounded-xl shadow-xl border border-border-main p-4 animate-fade-in select-none"
              onClick={(e) => e.stopPropagation()}
            >
              {/* User Info Header */}
              <div className="flex items-center gap-3 pb-3 border-b border-border-main mb-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                  {initials}
                </div>
                <div className="text-left overflow-hidden">
                  <h6 className="text-sm font-bold text-foreground truncate leading-snug">
                    {displayFullName}
                  </h6>
                  <p className="text-xs text-muted-foreground truncate leading-normal mt-0.5">
                    {email || "No email set"}
                  </p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-1">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-panel-bg transition-colors cursor-pointer font-medium">
                  <User size={16} className="text-muted-foreground" />
                  <span>My Profile</span>
                </div>

                {currentRole && (
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg text-xs bg-panel-bg border border-panel-border text-muted-foreground my-2">
                    <span className="font-semibold uppercase tracking-wider text-[10px]">
                      Role
                    </span>
                    <span className="font-bold text-foreground uppercase tracking-wide px-1.5 py-0.5 rounded bg-primary/10 text-[9px] border border-primary/20">
                      {currentRole.replace(/_/g, " ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Logout Divider */}
              <hr className="border-border-main my-2" />

              {/* Logout Option */}
              <div
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-bold text-danger-text hover:bg-danger-bg transition-colors cursor-pointer"
                onClick={logout}
              >
                <LogOut size={16} />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
