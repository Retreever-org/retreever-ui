import React, { useEffect, useRef, useState } from "react";
import { useViewingDocStore } from "../../stores/viewing-doc-store";
import { useCanvasState } from "../../stores/canvas-controller-store";
import { resolveContentType } from "../../services/contentTypeResolver";

const ConsumesOption: React.FC = () => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { endpoint } = useViewingDocStore();
  const { setBodyType, setRawType } = useCanvasState();

  const consumes = endpoint?.consumes;

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  const handleSelect = (ct: string) => {
    const { bodyType, rawType } = resolveContentType(ct);
    setBodyType(bodyType);
    rawType && setRawType(rawType);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className="relative text-xs">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-surface-400 hover:text-surface-200 transition-colors"
      >
        <span>{"[ " + consumes?.join(", ") + " ]"}</span>

        <span aria-hidden>
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
        </span>
      </button>

      {open && (
        <div
          className="absolute left-0 mt-2 z-50 min-w-[260px] rounded-md py-1
                        border border-surface-500/50 bg-black/20 backdrop-blur"
        >
          {consumes?.map((ct) => (
            <button
              key={ct}
              type="button"
              onClick={() => handleSelect(ct)}
              className="w-full text-left px-3 py-2
                         text-surface-300 hover:text-surface-100
                         hover:bg-surface-800/40 transition-colors"
            >
              {ct}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ConsumesOption;
