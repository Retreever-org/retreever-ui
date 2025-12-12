import React, { useEffect, useRef, useState } from "react";
import { useCanvasState } from "../stores/canvas-controller-store";
import { useViewingDocStore } from "../stores/viewing-doc-store";
import type { BodyType, RawBodyType, EditingType } from "../types/editor.types";

const BODY_OPTIONS: { key: BodyType; label: string }[] = [
  { key: "none", label: "none" },
  { key: "form-data", label: "form-data" },
  { key: "x-www-form-urlencoded", label: "x-www-form-urlencoded" },
  { key: "binary", label: "binary" },
  { key: "raw", label: "raw" },
];

const RAW_OPTIONS: RawBodyType[] = [
  "text",
  "JSON",
  "XML",
  "HTML",
  "JavaScript",
];

const RequestInputController: React.FC = () => {
  const { endpoint } = useViewingDocStore();

  // zustand store selectors
  const { editing, bodyType, rawType, setEditing, setBodyType, setRawType } =
    useCanvasState();

  useEffect(() => {
    console.log(editing, bodyType, rawType);
  }, [editing, bodyType, rawType]);

  const consumesValid = endpoint?.consumes && endpoint.consumes.length > 0 ;
  const method = endpoint?.method?.toUpperCase?.() ?? "";

  return (
    <div className={`flex ${consumesValid ? "flex-row items-center justify-start gap-4" : "flex-col justify-center items-start "} text-xs w-full`}>
      <div className="flex gap-3">
        <SwitchBtn
          name="Params"
          type="params"
          active={editing === "params"}
          onClick={() => setEditing("params")}
        />
        <SwitchBtn
          name="Headers"
          type="headers"
          active={editing === "headers"}
          onClick={() => setEditing("headers")}
        />
        {method !== "GET" && method !== "DELETE" && (
          <SwitchBtn
            name="Body"
            type="body"
            active={editing === "body"}
            onClick={() => setEditing("body")}
          />
        )}
      </div>

      {consumesValid ? (
        <div className="text-surface-400 mr-4">
          {"[ " + endpoint.consumes.join(", ") + " ]"}
        </div>
      ) : (
        <div className="flex items-center gap-4 mr-3">
          <BodySelector
            value={bodyType}
            onChange={(v) => setBodyType(v)}
            rawValue={rawType ?? "JSON"}
            onRawChange={(r) => setRawType(r)}
          />
        </div>
      )}
    </div>
  );
};

export default RequestInputController;

/* --------------------------
   SwitchBtn - small tab-style control
   -------------------------- */
interface SwitchBtnProps {
  name: string;
  type: EditingType;
  active?: boolean;
  onClick?: () => void;
}
const SwitchBtn: React.FC<SwitchBtnProps> = ({
  name,
  active = false,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex justify-center items-center gap-1 px-2 py-1.5 text-xs rounded-t-md ${
        active ? "text-surface-100" : "text-surface-300"
      } hover:text-surface-100`}
    >
      <span>{name}</span>
    </button>
  );
};

/* --------------------------
   BodySelector - radio-like controls + custom raw dropdown
   -------------------------- */
interface BodySelectorProps {
  value: BodyType;
  onChange: (v: BodyType) => void;
  rawValue: RawBodyType;
  onRawChange: (r: RawBodyType) => void;
}

const BodySelector: React.FC<BodySelectorProps> = ({
  value,
  onChange,
  rawValue,
  onRawChange,
}) => {
  const selectedStyles = "text-surface-100 shadow-sm";
  const unselectedStyles = "text-surface-300 hover:text-surface-100";

  return (
    <div className="flex items-center gap-4">
      <div className="inline-flex items-center gap-6 rounded-md bg-transparent p-1">
        {BODY_OPTIONS.map((opt) => {
          const selected = opt.key === value;
          return (
            <button
              key={opt.key}
              onClick={() => onChange(opt.key)}
              type="button"
              className={`inline-flex items-center gap-1.5 py-1.5 text-xs transition-colors duration-150 ${
                selected ? selectedStyles : unselectedStyles
              }`}
              aria-pressed={selected}
            >
              <span
                className={`flex-none h-4 w-4 rounded-full ${
                  selected
                    ? "bg-white border-[4.8px] border-primary-400"
                    : "border-surface-600 border"
                }`}
                aria-hidden="true"
              />
              <span className="whitespace-nowrap">{opt.label}</span>
            </button>
          );
        })}
      </div>

      {value === "raw" && (
        <div className="flex items-center gap-2 relative">
          <RawDropdown
            value={rawValue}
            options={RAW_OPTIONS}
            onChange={(r) => onRawChange(r)}
          />
        </div>
      )}
    </div>
  );
};

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

const RawDropdown: React.FC<RawDropdownProps> = ({
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
