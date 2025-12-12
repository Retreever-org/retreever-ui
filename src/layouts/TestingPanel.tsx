import React from "react";
import { useViewingDocStore } from "../stores/viewing-doc-store";
import { SecuredIcon, UnSecuredIcon } from "../svgs/svgs";
import Request from "../components/canvas/Request";

const TestingPanel: React.FC = () => {
  const { endpoint, tabDoc } = useViewingDocStore();

  if (!endpoint || !tabDoc) {
    return <div className="p-4 text-sm text-red-500">Invalid Endpoint</div>;
  }

  const isSecured = endpoint.secured;

  return (
    <section className="flex flex-col gap-4 p-4 bg-transparent text-white rounded-md">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="w-full flex items-center gap-2 pb-3 px-4">
          {isSecured ? (
            <span
              className="w-4 h-4 inline-flex items-center text-xs font-medium text-emerald-300/60"
              title="Secured endpoint"
            >
              <SecuredIcon />
            </span>
          ) : (
            <span
              className="w-4 h-4 inline-flex items-center text-xs font-medium text-surface-400"
              title="Secured endpoint"
            >
              <UnSecuredIcon />
            </span>
          )}
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-surface-100 leading-5 truncate lowercase">
              / {endpoint.name.replaceAll(" ", "-")}
            </h3>
          </div>
        </div>
      </div>

      {/* Method + URL + Send */}
      <Request />

      {/* View switches */}
      <div className="border-b  border-surface-500/50">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {}}
            className="px-3 py-1.5 text-xs font-medium rounded-t-md text-slate-100"
          >
            Params
          </button>
          <button
            type="button"
            onClick={() => {}}
            className="px-3 py-1.5 text-xs font-medium rounded-t-md text-slate-300"
          >
            Headers
          </button>
          {endpoint.method.toLocaleUpperCase() !== "GET" &&
            endpoint.method.toLocaleUpperCase() !== "DELETE" && (
              <button
                type="button"
                onClick={() => {}}
                className="px-3 py-1.5 text-xs font-medium rounded-t-md text-slate-300"
              >
                Body
              </button>
            )}
        </div>
      </div>
    </section>
  );
};

export default TestingPanel;
