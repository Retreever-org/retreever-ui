import React from "react";
import { useViewingDocStore } from "../../stores/viewing-doc-store";
import type { RequestKeyValueEntry } from "../../types/editor.types";
import { CheckIcon2, DeleteIcon } from "../../svgs/svgs";
import EnvAwareInput from "./EnvAwareInput";

/* --------------------------
   Helpers
-------------------------- */

const isEmptyRow = (r: RequestKeyValueEntry) =>
  r.key.trim() === "" && r.value.trim() === "";

const ensureTrailingEmpty = (
  rows: RequestKeyValueEntry[]
): RequestKeyValueEntry[] => {
  if (rows.some(isEmptyRow)) return rows;

  return [
    ...rows,
    {
      key: "",
      value: "",
      editable: true,
      local: true,
      ignore: false,
    },
  ];
};

/* --------------------------
   Component
-------------------------- */

const RequestKeyValueEditor: React.FC = () => {
  const { tabDoc, updateUiRequest } = useViewingDocStore();
  if (!tabDoc) return null;

  const { editing, bodyType, body } = tabDoc.uiRequest;
  if (
    editing !== "headers" &&
    editing !== "params" &&
    tabDoc.uiRequest.bodyType !== "x-www-form-urlencoded"
  )
    return null;

  let sourceKey: "headers" | "queryParams" | "body.urlEncoded" | null = null;

  if (editing === "headers") sourceKey = "headers";
  else if (editing === "params") sourceKey = "queryParams";
  else if (editing === "body" && bodyType === "x-www-form-urlencoded") {
    sourceKey = "body.urlEncoded";
  }

  if (!sourceKey) return null;

  const rows =
    sourceKey === "body.urlEncoded"
      ? ensureTrailingEmpty(body.urlEncoded)
      : ensureTrailingEmpty(tabDoc.uiRequest[sourceKey]);

  const updateRows = (next: RequestKeyValueEntry[]) => {
    if (sourceKey === "body.urlEncoded") {
      updateUiRequest({
        body: {
          ...body,
          urlEncoded: ensureTrailingEmpty(next),
        },
      });
    } else {
      updateUiRequest({
        [sourceKey]: ensureTrailingEmpty(next),
      });
    }
  };

  const updateRow = (index: number, patch: Partial<RequestKeyValueEntry>) => {
    const next = rows.map((r, i) => (i === index ? { ...r, ...patch } : r));
    updateRows(next);
  };

  const deleteRow = (index: number) => {
    const next = rows.filter((_, i) => i !== index);
    updateRows(next);
  };

  return (
    <div className="flex-1 overflow-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="text-surface-300 bg-black/10">
            <th className="min-w-6 text-center px-1 py-2 border border-surface-500/40 font-medium">
              {" "}
            </th>
            <th className="text-left px-4 py-2 border border-surface-500/40 font-medium">
              Name
            </th>
            <th className="text-left px-4 py-2 border border-r-0 border-surface-500/40 font-medium">
              Value
            </th>
            <th className="w-5 border border-l-0 border-surface-500/40" />
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => {
            const disabledKey = !row.editable || !row.local;
            const empty = isEmptyRow(row);

            return (
              <tr
                key={index}
                className={`group text-surface-200 hover:bg-surface-500/5 ${
                  row.ignore ? "opacity-40" : ""
                }`}
              >
                {/* IGNORE */}
                <td className="text-center border border-surface-500/40">
                  <label className="inline-flex items-center justify-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={row.ignore}
                      disabled={row.key === "" && row.value === ""}
                      onChange={(e) =>
                        updateRow(index, { ignore: e.target.checked })
                      }
                      className="sr-only peer"
                    />

                    {!row.ignore && (row.key !== "" || row.value !== "") ? (
                      <span
                        className="
                            h-4 w-4 p-0.5 rounded-sm border border-surface-200
                            flex items-center justify-center
                            transition-colors
                           bg-surface-200 text-surface-800"
                      >
                        <CheckIcon2 />
                      </span>
                    ) : (
                      <span
                        className="
                            h-4 w-4 rounded-sm border border-surface-500/80
                            flex items-center justify-center
                            transition-colors
                        "
                      />
                    )}
                  </label>
                </td>

                {/* NAME */}
                <td className="px-4 py-2 border border-surface-500/40">
                  <input
                    type="text"
                    value={row.key + (disabledKey ? " *" : "")}
                    placeholder="Enter new key"
                    disabled={disabledKey}
                    onChange={(e) =>
                      updateRow(index, { key: e.currentTarget.value })
                    }
                    className={`w-full bg-transparent outline-none placeholder:text-surface-600 ${
                      disabledKey
                        ? "text-surface-300/90 cursor-not-allowed"
                        : " text-surface-200"
                    }`}
                  />
                </td>

                {/* VALUE */}
                <td className="px-4 py-2 border border-r-0 border-surface-500/40 relative">
                  <EnvAwareInput
                    value={row.value}
                    placeholder="value"
                    onChange={(val) => updateRow(index, { value: val })}
                  />
                </td>

                {/* DELETE */}
                <td className="px-2 border border-l-0 border-surface-500/40 text-right">
                  {row.local && !empty && (
                    <button
                      onClick={() => deleteRow(index)}
                      className="opacity-0 group-hover:opacity-100
                                 text-red-400 hover:text-red-300 transition"
                    >
                      <DeleteIcon />
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <span className="text-surface-400 px-0.5 text-xs">
        <span className="text-surface-300">Note:</span> keys with{" "}
        <span className="text-rose-400/80">*</span> are required
      </span>
    </div>
  );
};

export default RequestKeyValueEditor;
