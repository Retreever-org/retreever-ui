import { viewingDocStore } from "../stores/viewing-doc-store";
import { useTabOrderStore } from "../stores/tab-order-store";
import { XMarkIcon } from "../svgs/svgs";

export const EndpointTabStrip = () => {
  const { activeTab, orderList } = useTabOrderStore();

  const handleSelect = (tabKey: string) => {
    const state = viewingDocStore.getState();
    const doc = state.tabDoc;

    if (doc && doc.key === tabKey) return;

    useTabOrderStore.setState({ activeTab: tabKey });
  };

  const handleCloseTab = (tabKey: string) => {
    // TODO: Implement tab close logic
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

  return (
    <div className="w-full bg-transparent relative pr-12">
      <div className="flex items-stretch overflow-x-auto overflow-y-hidden scroll-thin scroll-transparent border-b border-surface-500/30 text-[0.7rem]">
        {sortedTabs.map((tab) => {
          const isActive = activeTab === tab.tabKey;
          const method = extractMethod(tab.tabKey);

          return (
            <div
              key={tab.tabKey}
              className={`flex shrink-0 items-center border-b group py-2 cursor-pointer
                ${isActive ? " border-b-surface-300" : "border-b-transparent"}`}
            >
              <div
                onClick={() => handleSelect(tab.tabKey)}
                className={`
                  ml-4 p-1 space-x-1
                  flex items-center
                  transition-colors duration-200
                  min-w-0 flex-1
                  text-surface-200 border-r border-surface-500/30
                  ${isActive ? "opacity-100" : "opacity-65"}
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
