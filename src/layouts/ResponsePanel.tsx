import React, { useRef, useState } from "react";

const MIN_HEIGHT = 120;
const MAX_HEIGHT = 600;

const ResponsePanel: React.FC = () => {
  const [height, setHeight] = useState(220);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    draggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = height;

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!draggingRef.current) return;

    const delta = startYRef.current - e.clientY;
    const next = startHeightRef.current + delta;

    setHeight(Math.min(MAX_HEIGHT, Math.max(MIN_HEIGHT, next)));
  };

  const onMouseUp = () => {
    draggingRef.current = false;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      className="
        absolute
        bottom-0 inset-x-0
        z-50
        bg-[#1B1B1B]
        border-t border-surface-500/40
        shadow-2xl
        flex flex-col"
      style={{ height }}
    >
      {/* Drag Handle */}
      <div
        onMouseDown={onMouseDown}
        className="
          h-0.5
          cursor-n-resize
          flex items-center justify-center
          group
          hover:bg-white/5 active:bg-primary-400/80
        "
      />

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 text-sm text-surface-200">
        Response Panel
      </div>
    </div>
  );
};

export default ResponsePanel;
