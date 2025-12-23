import React, { useEffect, useRef, useState } from "react";

const MIN_HEIGHT = 48;

const ResponsePanel: React.FC = () => {
  const [height, setHeight] = useState(220);
  const draggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const maxHeightRef = useRef<number>(window.innerHeight);

  useEffect(() => {
    const calculateMaxHeight = () => {
      const requestBar = document.querySelector("[data-request-bar]");
      if (!requestBar) return;

      const rect = requestBar.getBoundingClientRect();
      const gap = 8; // breathing space
      maxHeightRef.current = window.innerHeight - rect.bottom - gap;
    };

    calculateMaxHeight();
    window.addEventListener("resize", calculateMaxHeight);

    return () => window.removeEventListener("resize", calculateMaxHeight);
  }, []);

  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    draggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = height;

    document.body.style.userSelect = "none"; // block selection
    document.body.style.cursor = "n-resize"; // change cursor

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  };

  const onMouseMove = (e: MouseEvent) => {
    if (!draggingRef.current) return;

    const delta = startYRef.current - e.clientY;
    const next = startHeightRef.current + delta;

    setHeight(Math.min(maxHeightRef.current, Math.max(MIN_HEIGHT, next)));
  };

  const onMouseUp = () => {
    draggingRef.current = false;

    document.body.style.userSelect = "";
    document.body.style.cursor = "";

    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  return (
    <div
      data-response-panel
      className="
        absolute
        bottom-0 inset-x-0
        z-17
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
