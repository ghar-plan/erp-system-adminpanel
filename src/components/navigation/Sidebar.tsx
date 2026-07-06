import React, { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import logo from "../../assets/images/others/logo.png";
import useStore from "../../hooks/useStore";

interface SidebarProps {
  children: ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const isSidebarExpanded = useSelector(
    (state: any) => state.sharedReducer?.isSidebarExpanded ?? true,
  );

  const { setExpandSidebar } = useStore();
  const location = useLocation();

  React.useEffect(() => {
    if (window.innerWidth < 768) {
      setExpandSidebar(false);
    }
  }, [location.pathname]);

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setExpandSidebar(false);
      } else {
        setExpandSidebar(true);
      }
    };

    // Initial check on mount
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleExpandSidebar = () => {
    setExpandSidebar(!isSidebarExpanded);
  };
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isSidebarExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setExpandSidebar(false)}
        />
      )}

      <aside
        className={`absolute top-0 left-0 md:relative h-screen z-30 transition-all duration-500 ease-out overflow-hidden ${
          isSidebarExpanded
            ? "w-full xs:w-2/3 sm:w-1/2 md:w-[272px] md:min-w-[272px]"
            : "w-0 md:w-0 md:min-w-0"
        } bg-bg-sidebar text-white ${isSidebarExpanded ? "shadow-xl" : "shadow-none"}`}
        style={
          {
            // backgroundImage: `url(/img/sidebarbg.png)`,
            // objectFit: "contain",
            // backgroundSize: "cover",
            // backgroundPosition: "center",
          }
        }
      >
        <div className="min-w-[272px] h-full">
          <nav className="h-full flex flex-col bg-transparent">
            <div className="flex justify-between items-center relative h-20 border-b border-white/10">
              <img
                src={logo}
                className="overflow-hidden transition-all w-40 h-12 mx-auto filter brightness-0 invert"
                alt="Logo"
              />
              <button
                onClick={handleExpandSidebar}
                className="absolute z-10 top-6 right-5 block md:hidden cursor-pointer border border-white/20 hover:bg-white/10 px-3 py-1 rounded-lg text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <ul className=" py-3  overflow-y-auto whitespace-nowrap">
              {" "}
              {children}{" "}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
