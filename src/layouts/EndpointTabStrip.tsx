import { useEffect, useRef } from "react";
import { viewingDocStore } from "../stores/viewing-doc-store";
import { useTabOrderStore } from "../stores/tab-order-store";
import { XMarkIcon } from "../svgs/svgs";
import { tabKeyToEndpoint } from "../services/tab-factory";
import { useDocStore } from "../stores/doc-store";
import { removeTabDoc } from "../storage/tab-doc-storage";

export const EndpointTabStrip = () => {
  const { activeTab, orderList, closeTab, setActiveTab } = useTabOrderStore();
  const { doc } = useDocStore();
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const handleSelect = (tabKey: string) => {
    const state = viewingDocStore.getState();
    const tabDoc = state.tabDoc;

    if (tabDoc && tabDoc.key === tabKey) return;

    const endpoint = tabKeyToEndpoint(tabKey, doc);
    if (endpoint) {
      setActiveTab(tabKey, endpoint.name);
    }
  };

  const handleCloseTab = (tabKey: string) => {
    closeTab(tabKey);
    // removing the tab-doc directly from storage
    removeTabDoc(tabKey);
  };

  const extractMethod = (tabKey: string): string => {
    return tabKey.split(":")[0] as string;
  };

  const getMethodColor = (method: string): string => {
    switch (method) {
      case "GET":
        return "text-emerald-400/90";
      case "POST":
        return "text-amber-300/90";
      case "PUT":
        return "text-primary-300";
      case "DELETE":
        return "text-rose-300";
      case "PATCH":
        return "text-violet-400";
      default:
        return "text-surface-300";
    }
  };

  const sortedTabs = [...(orderList ?? [])].sort((a, b) => a.order - b.order);

  // scroll active tab into view when activeTab/orderList changes
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

    if (offsetLeft < 0) {
      container.scrollBy({ left: offsetLeft, behavior: "smooth" });
    } else if (offsetRight > containerRect.width) {
      container.scrollBy({
        left: offsetRight - containerRect.width,
        behavior: "smooth",
      });
    }
  }, [activeTab, sortedTabs.length]);

  return (
    <div className="w-full bg-transparent relative pr-12">
      <div
        ref={scrollRef}
        className="flex items-stretch overflow-x-auto overflow-y-hidden scroll-thin scroll-transparent border-b border-surface-500/30 text-[0.7rem]"
      >
        {sortedTabs.map((tab) => {
          const isActive = activeTab === tab.tabKey;
          const method = extractMethod(tab.tabKey);

          return (
            <div
              key={tab.tabKey}
              data-tab-key={tab.tabKey}
              className={`flex shrink-0 items-center border-b group py-2 cursor-pointer
                ${isActive ? " border-b-surface-300" : "border-b-transparent"}`}
            >
              <div className="flex justify-center items-center px-1 space-x-1 border-r border-surface-500/30">
                <div
                  onClick={() => handleSelect(tab.tabKey)}
                  className={`
                  ml-5 p-1 space-x-1
                  flex items-center
                  transition-colors duration-200
                  min-w-0 flex-1
                  text-surface-200
                  ${isActive ? "opacity-100" : "opacity-65 hover:opacity-75"}
                `}
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
                </div>
                <button
                  type="button"
                  onClick={() => handleCloseTab(tab.tabKey)}
                  className={`
                      rounded-r transition-all duration-200 invisible group-hover:visible cursor-pointer
                      ${
                        isActive
                          ? "text-surface-200"
                          : "text-surface-400 hover:text-surface-200"
                      }
                    `}
                  title="Close tab"
                >
                  <XMarkIcon />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
