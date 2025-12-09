import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCollections, useDoc } from "../stores/doc-store";
import type { Collection } from "../types/filtered.types";
import { EndpointList } from "../components/sidebar/EndpointList";
import { CollapseAll, ExpandAll, FolderIcon, FolderOpenIcon } from "../svgs/svgs";

const Sidebar: React.FC = () => {
  const collections = useCollections();
  const doc = useDoc();

  const [openMap, setOpenMap] = useState<Record<string, boolean>>(() =>
    collections.reduce((acc, col) => {
      acc[col.name] = false;
      return acc;
    }, {} as Record<string, boolean>)
  );

  const toggleCollection = (name: string) => {
    setOpenMap((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const expandAll = () => {
    setOpenMap(() =>
      collections.reduce((acc, col) => {
        acc[col.name] = true;
        return acc;
      }, {} as Record<string, boolean>)
    );
  };

  const collapseAll = () => {
    setOpenMap(() =>
      collections.reduce((acc, col) => {
        acc[col.name] = false;
        return acc;
      }, {} as Record<string, boolean>)
    );
  };

  return (
    <div className="border-b h-full py-2 border-r border-surface-500/30 bg-transparent flex flex-col">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-linear-to-b from-surface-700 
                      to-transparent/0 backdrop-blur-sm px-4 pb-1 pt-2 mb-2">
        <div className="flex items-center gap-2 w-full">
          <button className="tracking-wider flex-1 text-left font-medium text-[0.9rem] 
                             text-surface-200 truncate hover:text-accent-500">
            {doc ? doc.name : "Application Name"}
          </button>

          <button onClick={expandAll} className="text-surface-200 hover:text-white p-1">
            <ExpandAll />
          </button>

          <button onClick={collapseAll} className="text-surface-200 hover:text-white p-1">
            <CollapseAll />
          </button>
        </div>
      </div>

      {/* Collections */}
      <div className="space-y-3 px-3 flex-1 overflow-auto bg-transparent scroll-thin">
        {collections.map((collection: Collection) => {
          const isOpen = openMap[collection.name];

          return (
            <motion.div 
              key={collection.name} 
              layout  // ← Magic: auto-animates layout shifts
            >
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
                <span className="truncate text-[0.8rem]">{collection.name}</span>
              </button>

              {/* Animated Expand/Collapse */}
              <AnimatePresence initial={false}>
                {isOpen && collection.endpoints.length > 0 && (
                  <motion.div
                    key="content"
                    layout
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
