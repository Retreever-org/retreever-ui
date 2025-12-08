import { useEffect, useState } from "react";
import { Rnd } from "react-rnd";
import { useRightPanelStore } from "../../stores/right-panel-store";
import { LeftDoubleIcon } from "../../svgs/svgs";

export function RightDisplayPanel() {
  const { open, content } = useRightPanelStore();
  const [width, setWidth] = useState(360);
  const MAX_WIDTH = 700;
  const height = window.innerHeight;

  const [visible, setVisible] = useState(open);

  useEffect(() => {
    if (open) {
      setVisible(true);
    } else {
      const timeout = setTimeout(() => setVisible(false), 220);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  if (!visible) return null;

  return (
    <Rnd
      size={{ width, height }}
      position={{ x: window.innerWidth - width, y: 0 }}
      disableDragging
      bounds="window"
      minWidth={280}
      maxWidth={MAX_WIDTH}
      enableResizing={{ left: true }}   // ← left-edge resize still active
      style={{
        position: "fixed",
        top: 0,
        zIndex: 19,
      }}
      onResizeStop={(_, __, ref) => {
        const newWidth = Math.min(parseFloat(ref.style.width), MAX_WIDTH);
        setWidth(newWidth);
      }}
    >
      <div
        className={`
          h-full flex
          transform transition-transform duration-200 ease-out
          ${open ? "translate-x-0" : "translate-x-full"}
          bg-linear-to-b from-surface-700 to-surface-800
          border-l border-surface-500/40 shadow-xl
        `}
      >
        <div className="h-full flex justify-center items-center text-surface-300 w-12 border-r border-surface-500/30">
          <LeftDoubleIcon />
        </div>
        <div className="p-4 overflow-auto h-full flex-1">
          {content}
        </div>
      </div>
    </Rnd>
  );
}
