// File: src/components/EndpointTabStrip.tsx
import React, { useEffect, useRef, useState } from "react";
import { viewingDocStore } from "../stores/viewing-doc-store";
import { useTabOrderStore } from "../stores/tab-order-store";
import { XMarkIcon } from "../svgs/svgs";
import { tabKeyToEndpoint } from "../services/tab-factory";
import { useDocStore } from "../stores/doc-store";
import {
  clearAllTabDocs,
  clearOtherTabs,
  getAllTabDoc,
  getTabDoc,
  removeTabDoc,
} from "../storage/tab-doc-storage";
import {
  extractMethod,
  getMethodColor,
  sortTabs,
  calculateMenuPosition,
} from "../components/canvas/EndpointTabUtil";
import { deleteAllFiles, deleteFile } from "../storage/file-storage";

export const EndpointTabStrip: React.FC = () => {
  const {
    activeTab,
    orderList,
    closeTab,
    setActiveTab,
    closeOthers,
    closeAll,
  } = useTabOrderStore();
  const { doc } = useDocStore();

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Context menu state
  const [ctx, setCtx] = useState<{
    visible: boolean;
    left: number;
    top: number;
    tabKey: string | null;
  }>({ visible: false, left: 0, top: 0, tabKey: null });

  const menuRef = useRef<HTMLDivElement | null>(null);

  // -------------------------------- Click Handlers -------------------------------------

  const handleSelect = (tabKey: string) => {
    const state = viewingDocStore.getState();
    const tabDoc = state.tabDoc;
    if (tabDoc && tabDoc.key === tabKey) return;
    const endpoint = tabKeyToEndpoint(tabKey, doc);
    if (endpoint) setActiveTab(tabKey, endpoint.name);
  };

  const deleteFilesInTabDoc = async (tabKey: string) => {
    const td = await getTabDoc(tabKey);
    if (td) {
      const form = td.uiRequest.body.formData;
      if (form) {
        form
          .filter((f) => f.type === "file")
          .forEach(async (f) => {
            try {
              const fileIds: string[] = f.value ? JSON.parse(f.value) : [];
              for (const fileId of fileIds) {
                await deleteFile(fileId);
              }
            } catch {
              // ignore errors
            }
          });
      }
    }
  }

  const handleCloseTab = async (tabKey: string) => {
    deleteFilesInTabDoc(tabKey);
    closeTab(tabKey);
    removeTabDoc(tabKey); // removes from DB directly
  };

  const closeCTxMenu = () => setCtx({ ...ctx, visible: false });

  // default/context handlers — intentionally empty (wired to receive tabKey)
  const onCtxClose = (tabKey: string | null) => {
    if (tabKey) handleCloseTab(tabKey);
    closeCTxMenu();
  };

  const onCtxCloseOther = (tabKey: string | null) => {
    // delete files in other tabs
    getAllTabDoc().then((all) => {
      all.filter((td) => td.key !== tabKey).forEach(async (td) => {
        await deleteFilesInTabDoc(td.key);
        removeTabDoc(td.key); // removes from DB directly
      });
    })
    if (tabKey) {
      closeOthers(tabKey);
      clearOtherTabs(tabKey); // removes from DB directly
    }
    closeCTxMenu();
  };

  const onCtxCloseAll = () => {
    deleteAllFiles();
    closeAll();
    clearAllTabDocs();
    closeCTxMenu();
  };

  const sortedTabs = sortTabs(orderList);

  // -------------------------------- Side Effects --------------------------------------
  // scroll active tab into view
  useEffect(() => {
    if (!activeTab) return;
    const container = scrollRef.current;
    if (!container) return;

    const el = container.querySelector<HTMLDivElement>(
      `[data-tab-key="${CSS.escape(activeTab)}"]`
    );
    if (!el) return;

    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();

    const offsetLeft = elRect.left - containerRect.left;
    const offsetRight = offsetLeft + elRect.width;

    if (offsetLeft < 0)
      container.scrollBy({ left: offsetLeft, behavior: "smooth" });
    else if (offsetRight > containerRect.width)
      container.scrollBy({
        left: offsetRight - containerRect.width,
        behavior: "smooth",
      });
  }, [activeTab, sortedTabs.length]);

  useEffect(() => {
    const onWindowClick = (e: MouseEvent) => {
      if (!ctx.visible) return;
      if (!menuRef.current) return;
      if (e.target instanceof Node && !menuRef.current.contains(e.target)) {
        setCtx({ visible: false, left: 0, top: 0, tabKey: null });
      }
    };

    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape")
        setCtx({ visible: false, left: 0, top: 0, tabKey: null });
    };

    window.addEventListener("click", onWindowClick);
    window.addEventListener("keydown", onEscape);
    return () => {
      window.removeEventListener("click", onWindowClick);
      window.removeEventListener("keydown", onEscape);
    };
  }, [ctx.visible]);

  // ------------------------------ Context Menu --------------------------------------

  const handleContextMenu = (e: React.MouseEvent, tabKey: string) => {
    e.preventDefault();
    e.stopPropagation();

    const container = containerRef.current ?? scrollRef.current;
    if (!container) return;

    const target = e.currentTarget as HTMLElement;
    const pos = calculateMenuPosition(container, target, {
      menuWidth: 180,
      gap: 6,
    });

    setCtx({ visible: true, left: pos.left, top: pos.top, tabKey });
  };

  // --------------------------------- UI Component ---------------------------------
  return (
    <div className="w-full bg-transparent relative" ref={containerRef}>
      <div
        ref={scrollRef}
        className="flex h-10 items-stretch overflow-x-auto overflow-y-hidden scroll-thin scroll-transparent border-b border-surface-500/30 text-[0.7rem]"
      >
        {sortedTabs.map((tab) => {
          const isActive = activeTab === tab.tabKey;
          const method = extractMethod(tab.tabKey);

          return (
            <div
              key={tab.tabKey}
              data-tab-key={tab.tabKey}
              onContextMenu={(e) => handleContextMenu(e, tab.tabKey)}
              className={`flex shrink-0 items-center border-b group py-2 cursor-pointer ${
                isActive ? " border-b-surface-300" : "border-b-transparent"
              }`}
            >
              <div className="flex justify-center items-center px-1 space-x-1 border-r border-surface-500/30 cursor-pointer">
                <button
                  type="button"
                  onClick={() => handleSelect(tab.tabKey)}
                  className={`ml-5 p-1 space-x-1 flex items-center transition-colors duration-200 min-w-0 flex-1 text-surface-200 cursor-pointer ${
                    isActive ? "opacity-100" : "opacity-65 hover:opacity-75"
                  }`}
                >
                  <span
                    className={`font-mono tracking-tighter font-bold shrink-0 w-max ${getMethodColor(
                      method
                    )}`}
                  >
                    {method}
                  </span>

                  <span className="relative z-10 truncate max-w-48 block">
                    {tab.name}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCloseTab(tab.tabKey)}
                  className={`rounded-r transition-all duration-200 invisible group-hover:visible cursor-pointer ${
                    isActive
                      ? "text-surface-200"
                      : "text-surface-400 hover:text-surface-200"
                  }`}
                  title="Close tab"
                >
                  <XMarkIcon />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Context menu card */}
      {ctx.visible && ctx.tabKey && (
        <div
          ref={menuRef}
          style={{ left: ctx.left, top: ctx.top }}
          className={`text-xs absolute z-50 bg-black/30 backdrop-blur-md border border-surface-500/30 rounded-md shadow-lg`}
        >
          <div className="flex flex-col space-y-1 py-1 min-w-48">
            <CtxButton onClick={() => onCtxClose(ctx.tabKey)}>Close</CtxButton>
            <CtxButton onClick={() => onCtxCloseOther(ctx.tabKey)}>
              Close Other
            </CtxButton>
            <CtxButton onClick={() => onCtxCloseAll()}>Close All</CtxButton>
          </div>
        </div>
      )}
    </div>
  );
};

// small presentational button to keep markup DRY
const CtxButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  children,
  ...props
}) => (
  <button
    {...props}
    type="button"
    className="text-surface-300 hover:text-surface-200 mx-0.5 hover:bg-surface-500/10 rounded-sm text-left p-2 transition"
  >
    {children}
  </button>
);
