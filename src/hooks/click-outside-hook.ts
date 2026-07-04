import { useEffect, useRef } from "react";

const useOutsideClick = (callback:any) => {
  const ref:any = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event:any) => {
      if (ref.current && !ref.current.contains(event.target)) {
        callback(); 
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [callback]);

  return ref;
};

export default useOutsideClick;
