import React, { useEffect } from "react";
import AppRoutes from "./routes";
import useHttp from "@/hooks/useHttp";

function App() {
  const { configureHeaders, configureInterceptors } = useHttp();

  useEffect(() => {
    configureHeaders();
    configureInterceptors();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return <AppRoutes />;
}

export default App;
