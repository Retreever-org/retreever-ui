import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCollections, useDoc } from "../stores/doc-store";
import type { Collection } from "../types/filtered.types";
import { EndpointList } from "../components/sidebar/EndpointList";
import {
  CollapseAll,
  ExpandAll,
  FolderIcon,
  FolderOpenIcon,
} from "../svgs/svgs";
import {
  loadSidebarLayout,
  saveSidebarLayout,
} from "../storage/layoutRepository";
import { useCanvasState } from "../stores/canvas-controller-store";

const MIN_WIDTH = 288; // w-72
const MAX_WIDTH_RATIO = 0.3; // 50% screen

const Sidebar: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const collections = useCollections();
  const doc = useDoc();

  const [width, setWidth] = useState(MIN_WIDTH);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  const {displayApiDoc, setDisplayApiDoc} = useCanvasState();

  // hydrate width + openMap on mount
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { width: storedWidth, openMap: storedOpenMap } =
        await loadSidebarLayout();
      if (cancelled) return;

      const clamped = Math.min(
        Math.max(MIN_WIDTH, storedWidth),
        window.innerWidth * MAX_WIDTH_RATIO
      );

      // ensure all current collections have a key
      const initialOpenMap = collections.reduce((acc, col) => {
        acc[col.name] = storedOpenMap?.[col.name] ?? false; // default closed if unknown
        return acc;
      }, {} as Record<string, boolean>);

      setWidth(clamped);
      setOpenMap(initialOpenMap);
      setIsReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [collections]);

  // persist width + openMap when either changes (debounced)
  useEffect(() => {
    if (!isReady) return;
    const id = setTimeout(() => {
      void saveSidebarLayout({ width, openMap });
    }, 200);
    return () => clearTimeout(id);
  }, [width, openMap, isReady]);

  // --- Resize Handler --- (unchanged)
  const startResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = width;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const dx = moveEvent.clientX - startX;

      const newWidth = Math.min(
        Math.max(MIN_WIDTH, startWidth + dx),
        window.innerWidth * MAX_WIDTH_RATIO
      );

      setWidth(newWidth);
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // -------- EXPAND/COLLAPSE ----------
  const toggleCollection = (name: string) =>
    setOpenMap((prev) => ({ ...prev, [name]: !prev[name] }));

  const expandAll = () =>
    setOpenMap(() =>
      collections.reduce((acc, col) => {
        acc[col.name] = true;
        return acc;
      }, {} as Record<string, boolean>)
    );

  const collapseAll = () =>
    setOpenMap(() =>
      collections.reduce((acc, col) => {
        acc[col.name] = false;
        return acc;
      }, {} as Record<string, boolean>)
    );

  if (!isReady) return null;

  if (!isReady) {
    return null; // placeholder
  }

  return (
    <div
      className="h-full border-r border-surface-500/30 bg-transparent flex flex-col relative"
      style={{ width }}
    >
      {/* Resize handle */}
      <div
        onMouseDown={startResize}
        className="absolute z-11 top-0 right-0 h-full w-0.5 cursor-e-resize 
                   hover:bg-white/5 active:bg-primary-400/80 transition-colors"
      />

      {/* Header */}
      <div className="sticky h-10 top-0 z-10 bg-surface-700 px-4 py-2 mb-2 border-b border-surface-500/30">
        <div className="flex items-center gap-2 w-full">
          <button
            type="button"
            className="tracking-wider flex-1 text-left font-medium text-[0.9rem] 
                             text-surface-200 truncate hover:text-primary-300"
            onClick={() => setDisplayApiDoc(!displayApiDoc)}
          >
            {doc ? doc.name : "Application Name"}
          </button>

          <button
            onClick={expandAll}
            className="text-surface-200 hover:text-white p-1"
          >
            <ExpandAll />
          </button>

          <button
            onClick={collapseAll}
            className="text-surface-200 hover:text-white p-1"
          >
            <CollapseAll />
          </button>
        </div>
      </div>

      {/* Collections */}
      <div className="space-y-3 px-3 flex-1 overflow-auto scroll-thin">
        {collections.map((collection: Collection) => {
          const isOpen = openMap[collection.name];

          return (
            <motion.div key={collection.name}>
              {/* Button */}
              <button
                type="button"
                onClick={() => toggleCollection(collection.name)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1 
                           text-left text-sm text-surface-100 hover:bg-white/5 
                           focus:outline-none"
              >
                {isOpen ? (
                  <span className="h-4 w-4 text-surface-200">
                    <FolderOpenIcon />
                  </span>
                ) : (
                  <span className="h-4 w-4 text-surface-200/80">
                    <FolderIcon />
                  </span>
                )}
                <span className="truncate text-[0.8rem]">
                  {collection.name}
                </span>
              </button>

              {/* Animated list */}
              <AnimatePresence initial={false}>
                {isOpen && collection.endpoints.length > 0 && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <EndpointList
                      collectionName={collection.name}
                      endpoints={collection.endpoints}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
