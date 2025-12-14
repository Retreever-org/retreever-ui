import React from "react";
import { useViewingDocStore } from "../stores/viewing-doc-store";
import { SecuredIcon, UnSecuredIcon } from "../svgs/svgs";
import Request from "../components/canvas/Request";
import RequestInputController from "./RequestInputController";
import RequestKeyValueEditor from "../components/canvas/RequestKeyValueEditor";
import FormEditor from "../components/canvas/FormEditor";
import CodeEditor from "../components/canvas/CodeEditor";
import ResponsePanel from "./ResponsePanel";

const TestingPanel: React.FC = () => {
  const { endpoint, tabDoc } = useViewingDocStore();

  if (!endpoint || !tabDoc) {
    return <div className="p-4 text-sm text-red-500">Invalid Endpoint</div>;
  }

  const isSecured = endpoint.secured;

  return (
    <section className="relative h-full flex flex-col gap-4 p-4 bg-transparent text-white rounded-md">
      {/* Title row */}
      <div className="flex items-center justify-between">
        <div className="w-full flex items-center gap-2 pb-3 px-1">
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
      <RequestInputController />

      {/* Key-Value Editor - renders only for headers, params, and form-urlencoded body */}
      <RequestKeyValueEditor />

      {/* Form Editor - renders only for body of type form-data */}
      <FormEditor />

      {tabDoc.uiRequest.bodyType === "raw" &&
        tabDoc.uiRequest.editing === "body" && <CodeEditor />}

      <ResponsePanel />
    </section>
  );
};

export default TestingPanel;
