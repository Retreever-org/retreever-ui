import React from "react";
import type { EndpointSummary } from "../../types/filtered.types";
import { useTabOrderStore } from "../../stores/tab-order-store";
import { tabKeyForEndpoint } from "../../services/tab-factory";

interface EndpointListProps {
  collectionName: string;
  endpoints: EndpointSummary[];
}

export const EndpointList: React.FC<EndpointListProps> = ({
  collectionName,
  endpoints,
}) => {
  const { setActiveTab } = useTabOrderStore();

  const handleClick = (name: string, method: string, path: string) => {
      const key = tabKeyForEndpoint(method, path);
      setActiveTab(key, name);
  };

  return (
    <div className="mt-1 space-y-2">
      {endpoints.map((endpoint) => {
        const methodColor =
          endpoint.method === "GET"
            ? "text-emerald-400/90"
            : endpoint.method === "POST"
            ? "text-amber-300/90"
            : endpoint.method === "PUT"
            ? "text-primary-300"
            : endpoint.method === "DELETE"
            ? "text-rose-300"
            : endpoint.method === "PATCH"
            ? "text-violet-400"
            : "text-surface-300";

        return (
          <div
            key={`${collectionName}-${endpoint.method}-${endpoint.path}`}
            className="flex items-center rounded-md px-6 py-0.5 text-[0.8rem] text-surface-200 hover:bg-white/5 cursor-pointer"
            onClick={() => handleClick(endpoint.name, endpoint.method, endpoint.path)}
          >
            {/* Fixed-width method column */}
            <span
              className={`w-12 text-right tracking-tighter font-mono text-[0.7rem] font-semibold uppercase ${methodColor} p-0.5`}
            >
              {endpoint.method}
            </span>

            {/* Endpoint name */}
            <span className="ml-2 truncate whitespace-nowrap">
              {endpoint.name}
            </span>
          </div>
        );
      })}
    </div>
  );
};
