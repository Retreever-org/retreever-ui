import { useEffect, useRef, useState } from "react";
import { useRightPanelStore } from "../../stores/right-panel-store";
import { LeftDoubleIcon } from "../../svgs/svgs";
import { useUtilityViewState } from "../../stores/utility-view-store";
import { useDockStore } from "../../stores/dock-store";
import UtilityHeader from "./UtilityHeader";
import { getUtilityContent } from "./UtilityContentFactory";

export function RightDisplayPanel() {
  const {
    isPanelOpen,
    width,
    maxWidth,
    closePanel,
    setWidth,
  } = useRightPanelStore();

  const { detach, title, clearView } = useUtilityViewState();
  const content = getUtilityContent(title);
  const { openDock } = useDockStore();

  const [visible, setVisible] = useState(isPanelOpen);
  const NAVBAR_HEIGHT = 49;
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Visibility timing for slide animation
  useEffect(() => {
    if (isPanelOpen) {
      setVisible(true);
    } else {
      const timeout = setTimeout(() => setVisible(false), 220);
      return () => clearTimeout(timeout);
    }
  }, [isPanelOpen]);

  if (!visible) return null;

  // Left-edge resize logic
  function startResize(e: React.MouseEvent) {
    e.preventDefault();

    const startX = e.clientX;
    const startWidth = width;

    function onMove(ev: MouseEvent) {
      const delta = startX - ev.clientX;
      let newWidth = startWidth + delta;
      newWidth = Math.max(420, Math.min(maxWidth, newWidth));

      setWidth(newWidth);
    }

    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div
      ref={panelRef}
      className="fixed h-[calc(100vh-49px)] bg-linear-to-b from-surface-700 to-surface-800 
        border-l border-surface-500/40 shadow-xl"
      style={{
        top: NAVBAR_HEIGHT,
        right: 48,
        width,
        zIndex: 19,
        transform: isPanelOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.2s ease-out",
      }}
    >
      <div className="h-full">
        <UtilityHeader
          title={title}
          onSwitchView={() => {
            detach();
            closePanel();
            openDock();
          }}
          onclose={() => {
            closePanel();
            clearView();
          }}
        />
        <div className="h-full flex overflow-auto scroll-thin">
          <div className="flex-1 overflow-auto scroll-thin h-full">{content}</div>

          <div
            className="
              absolute left-0 top-0 h-full 
              flex justify-center items-center
              w-0.5 cursor-ew-resize 
              bg-transparent
              hover:bg-surface-500/20 
              active:bg-primary-500/80
            "
            onMouseDown={startResize}
          />
        </div>
      </div>
    </div>
  );
}
