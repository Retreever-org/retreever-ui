import { useEffect, useRef, useState } from "react";
import type { RawBodyType } from "../../types/editor.types";

/* --------------------------
   RawDropdown - custom select replacement
   - Uses the requested classes for the dropdown container:
     "border border-surface-500/50" and "bg-black/20"
   - Options are rendered as buttons that call onChange when clicked
   -------------------------- */
interface RawDropdownProps {
  value: RawBodyType;
  options: RawBodyType[];
  onChange: (r: RawBodyType) => void;
}

const RawBodyDropdown: React.FC<RawDropdownProps> = ({
  value,
  options,
  onChange,
}) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggle = (next?: boolean) =>
    setOpen((s) => (typeof next === "boolean" ? next : !s));
  const onSelect = (r: RawBodyType) => {
    onChange(r);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative inline-block text-xs">
      <button
        type="button"
        onClick={() => toggle()}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="h-8 px-3 rounded-md flex items-center gap-2 text-surface-100 bg-surface-700 border border-surface-600 outline-none"
      >
        <span className="whitespace-nowrap">{value}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-150 ${
            open ? "rotate-180" : ""
          }`}
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M6 8l4 4 4-4"
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          aria-label="Raw body type"
          className="absolute right-0 mt-2 min-w-[120px] z-50 rounded-md shadow-md border border-surface-500/50 bg-black/20 p-1"
        >
          <div className="flex flex-col gap-1">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onSelect(opt)}
                className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors duration-100 ${
                  opt === value
                    ? "text-surface-100 bg-surface-800"
                    : "text-surface-300 hover:text-surface-100 hover:bg-surface-800/40"
                }`}
                aria-checked={opt === value}
                role="option"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RawBodyDropdown;