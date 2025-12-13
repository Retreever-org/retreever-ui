import React from "react";
import { createPortal } from "react-dom";
import type { InputType } from "../../types/editor.types";

interface Props {
  value: InputType;
  onChange: (v: InputType) => void;
  disabled?: boolean;
}

const OPTIONS: InputType[] = ["text", "file"];

const DropDown: React.FC<Props> = ({ value, onChange, disabled }) => {
  const [open, setOpen] = React.useState(false);
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;

    const handler = (e: MouseEvent) => {
      const target = e.target as Node;

      if (
        triggerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const openMenu = () => {
    if (!triggerRef.current) return;
    setRect(triggerRef.current.getBoundingClientRect());
    setOpen(true);
  };

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openMenu}
        className={`w-full h-full px-2 flex items-center justify-between text-xs text-surface-200 cursor-pointer ${disabled ? "opacity-30" : "opacity-100"}`}
      >
        <span className="capitalize">{value}</span>
        <svg
          className={`w-3.5 h-3.5 transition-transform duration-150 ${
            open && !disabled ? "rotate-180" : ""
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
            className={`text-surface-300`}
          />
        </svg>
      </button>

      {/* Menu */}
      {open &&
        rect &&
        !disabled &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: rect.bottom + 6,
              left: rect.left,
              minWidth: rect.width + 60,
            }}
            className="z-9999 p-0.5 bg-black/30 backdrop-blur-md border border-surface-500/50 rounded-md shadow-lg cursor-pointer text-surface-200"
          >
            {OPTIONS.map((opt) => (
              <div
                key={opt}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`px-3 py-2 rounded-sm capitalize text-xs hover:bg-surface-800/40 ${
                  value === opt ? "bg-surface-800/40" : ""
                }`}
              >
                {opt}
              </div>
            ))}
          </div>,
          document.body
        )}
    </>
  );
};

export default DropDown;
