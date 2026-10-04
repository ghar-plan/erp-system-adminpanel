import React, { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";

export interface TypeaheadOption {
  id: string;
  label: string;
}

interface TypeaheadSelectProps {
  options: TypeaheadOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  error?: string;
  disabled?: boolean;
}

export default function TypeaheadSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Type to search...",
  emptyText = "No matches found",
  error,
  disabled = false,
}: TypeaheadSelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selected = useMemo(
    () => options.find((option) => option.id === value) || null,
    [options, value],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(q),
    );
  }, [options, query]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  const clearSelection = () => {
    onChange("");
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setOpen((prev) => !prev);
          setQuery("");
        }}
        className={`common-input w-full flex items-center justify-between gap-2 text-left cursor-pointer ${
          error ? "border-red-500 focus:border-red-500" : ""
        } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <span
          className={`truncate ${
            selected ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          {selected?.label || placeholder}
        </span>
        <span className="flex items-center gap-1 shrink-0 text-muted-foreground">
          {selected ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  clearSelection();
                }
              }}
              className="p-0.5 rounded hover:bg-muted-foreground/10"
              title="Clear"
            >
              <X size={14} />
            </span>
          ) : null}
          <ChevronDown
            size={16}
            className={`transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {open ? (
        <div className="absolute z-30 mt-1 w-full rounded-md border border-border-main bg-card shadow-lg overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border-main">
            <Search size={14} className="text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
            />
          </div>
          <div className="max-h-56 overflow-y-auto">
            {filtered.length > 0 ? (
              filtered.map((option) => {
                const isActive = option.id === value;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => handleSelect(option.id)}
                    className={`w-full px-3 py-2.5 text-left text-sm transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-semibold"
                        : "text-foreground hover:bg-muted-foreground/5"
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })
            ) : (
              <p className="px-3 py-3 text-sm text-muted-foreground">
                {emptyText}
              </p>
            )}
          </div>
        </div>
      ) : null}

      {error ? (
        <p className="mt-1 text-xs text-danger-text font-semibold">{error}</p>
      ) : null}
    </div>
  );
}
