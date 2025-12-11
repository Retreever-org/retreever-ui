import { Rnd } from "react-rnd";
import { useDockStore } from "../stores/dock-store";
import { useEffect, useState } from "react";
import { useUtilityViewState } from "../stores/utility-view-store";
import { useRightPanelStore } from "../stores/right-panel-store";
import UtilityHeader from "../components/utility/UtilityHeader";

export interface FloatingDockProps {
  title: string;
  content: React.ReactNode;
}

export function FloatingDock() {
  const {
    open,
    x,
    y,
    width,
    height,
    setPosition,
    setSize,
    closeDock,
    toggleDock,
  } = useDockStore();

  const [visible, setVisible] = useState(open);
  const [docked, setDocked] = useState(false);

  const { viewMode, title, content, clearView, attach } = useUtilityViewState();
  const { openPanel } = useRightPanelStore();

  const HEADER_HEIGHT = 36;

  // open/close with animation delay
  useEffect(() => {
    if (open) setVisible(true);
    else setTimeout(() => setVisible(false), 120);
  }, [open]);

  // keyboard shortcut
  useEffect(() => {
    if (viewMode === "detached") {
      const handler = (e: KeyboardEvent) => {
        if (e.shiftKey && e.altKey && e.key.toLowerCase() === "d") {
          e.preventDefault();
          toggleDock();
        }
      };
      window.addEventListener("keydown", handler);
      return () => window.removeEventListener("keydown", handler);
    }
  }, [toggleDock]);

  if (!visible) return null;

  return (
    <Rnd
      size={{ width, height }}
      position={{ x, y }}
      dragHandleClassName="dock-header"
      minWidth={450}
      minHeight={370}
      style={{ position: "fixed", zIndex: 9999 }}
      onDrag={(_e, d) => {
        const screenH = window.innerHeight;

        // If docked and user drags upward → undock
        if (docked && d.y < screenH - HEADER_HEIGHT - 10) {
          setDocked(false);
        }
      }}
      onDragStop={(_, d) => {
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        let newX = d.x;
        let newY = d.y;

        // Prevent left/right off-screen movement
        newX = Math.max(0, Math.min(newX, screenW - width));

        // Prevent going above the screen
        newY = Math.max(0, newY);

        // Allow ONLY bottom off-screen docking
        if (newY > screenH * 0.8) {
          setDocked(true);
          setPosition(newX, screenH - HEADER_HEIGHT);
          return;
        }

        // Normal floating
        setDocked(false);
        setPosition(newX, newY);
      }}
      onResizeStop={(_, __, ref, ___, pos) => {
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        setSize(parseFloat(ref.style.width), parseFloat(ref.style.height));

        // Clamp resize position (only top and sides)
        const clampedX = Math.max(
          0,
          Math.min(pos.x, screenW - parseFloat(ref.style.width))
        );
        const clampedY = Math.max(0, Math.min(pos.y, screenH - HEADER_HEIGHT));

        setPosition(clampedX, clampedY);
      }}
    >
      <div
        className={`
          flex flex-col h-full w-full rounded-lg shadow-xl border border-surface-500/30 bg-surface-800
          ${open ? "dock-animate-in" : "dock-animate-out"}
        `}
        style={{
          height: docked ? HEADER_HEIGHT : "100%",
          transition: "height 180ms ease-out",
        }}
      >
        <UtilityHeader
          title={title}
          onSwitchView={() => {
            closeDock();
            attach();
            openPanel();
          }}
          onclose={() => {
            closeDock();
            clearView();
          }}
        />

        {/* Body (hidden when docked) */}
        {!docked && (
          <div className="flex-1 overflow-auto scroll-thin">{content}</div>
        )}
      </div>
    </Rnd>
  );
}
