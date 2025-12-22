import { useEffect, useRef, useState } from "react";
import { useViewingDocStore } from "../../stores/viewing-doc-store";
import type { RawBodyType } from "../../types/editor.types";

/* --------------------------
   RawBodyDropdown - tab-scoped (via viewingDocStore)
   -------------------------- */

const RAW_TYPE_TO_CONSUMES: Record<RawBodyType, string> = {
  JSON: "application/json",
  XML: "application/xml",
  HTML: "text/html",
  JavaScript: "application/javascript",
  text: "text/plain",
};

const RawBodyDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const { endpoint, tabDoc, updateUiRequest } = useViewingDocStore();

  const ui = tabDoc?.uiRequest;
  if (!ui || ui.bodyType !== "raw") return null;

  const hasConsumes = endpoint?.consumes && endpoint?.consumes.length > 0;
  const value = ui.rawType ?? "JSON";
  const options: RawBodyType[] = ["text", "JSON", "XML", "HTML", "JavaScript"];

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
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

  const onSelect = (r: RawBodyType) => {
    updateUiRequest({
      rawType: r,
      consumes: [RAW_TYPE_TO_CONSUMES[r]],
    });
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative inline-block text-xs">
      <button
        type="button"
        disabled={hasConsumes}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="h-8 px-3 rounded-md flex items-center gap-2
                   text-surface-100 bg-surface-700
                   border border-surface-600 outline-none disabled:cursor-not-allowed"
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

      {open && (
        <div
          role="listbox"
          aria-label="Raw body type"
          className="absolute right-0 mt-2 min-w-[120px] z-50 rounded-md
                     border border-surface-500/50 bg-surface-700 p-1"
        >
          {options.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(opt)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors
                ${
                  opt === value
                    ? "text-surface-100 bg-surface-800"
                    : "text-surface-300 hover:text-surface-100 hover:bg-surface-800/40"
                }`}
              role="option"
              aria-checked={opt === value}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default RawBodyDropdown;
