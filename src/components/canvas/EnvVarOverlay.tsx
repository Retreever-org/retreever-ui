import React, { useEffect, useMemo, useRef, useState } from "react";
import { useEnvVarsStore } from "../../stores/env-vars-store";
import { SparkIcon } from "../../svgs/svgs";

interface EnvVarOverlayProps {
  anchorRect: DOMRect;
  query: string;
  onSelect: (name: string) => void;
  onClose: () => void;
}

const EnvVarOverlay: React.FC<EnvVarOverlayProps> = ({
  anchorRect,
  query,
  onSelect,
  onClose,
}) => {
  const { vars } = useEnvVarsStore();
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return vars
      .filter((v) => v.name && v.name.trim() !== "")
      .filter((v) => v.name!.toLowerCase().includes(q));
  }, [vars, query]);

  // reset highlight when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // keyboard handling (OWNED by overlay)
  useEffect(() => {
    const el = rootRef.current;
    if (!el || filtered.length === 0) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % filtered.length);
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) =>
          i === 0 ? filtered.length - 1 : i - 1
        );
      }

      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        const v = filtered[activeIndex];
        if (v?.name) {
          onSelect(v.name);
          onClose();
        }
      }

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [filtered, activeIndex, onSelect, onClose]);

  if (!anchorRect || filtered.length === 0) return null;

  return (
    <div
      ref={rootRef}
      className="
        fixed z-9999
        bg-black/30 backdrop-blur-md
        border border-surface-500/50
        rounded-lg shadow-lg
        min-w-[260px] max-h-[280px]
        overflow-auto
      "
      style={{
        top: anchorRect.bottom + 6,
        left: anchorRect.left,
      }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <ul className="py-1">
        {filtered.map((v, i) => (
          <li
            key={v.name!}
            className={`
              px-3 py-2 cursor-pointer text-sm
              text-surface-200 transition-colors
              ${i === activeIndex ? "bg-surface-800" : "hover:bg-surface-800"}
            `}
            onMouseEnter={() => setActiveIndex(i)}
            onClick={() => {
              onSelect(v.name!);
              onClose();
            }}
          >
            <div className="flex items-center gap-2">
              <span className="h-5 w-5 text-primary-300">
                <SparkIcon />
              </span>
              <span className="truncate">{v.name}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default EnvVarOverlay;
