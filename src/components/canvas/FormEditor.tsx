import React, { useEffect, useState } from "react";
import { useViewingDocStore } from "../../stores/viewing-doc-store";
import type { FormEntry } from "../../types/editor.types";
import { CheckIcon2, DeleteIcon } from "../../svgs/svgs";
import EnvAwareInput from "./EnvAwareInput";
import DropDown from "../form/DropDown";
import FileUploadInput from "../form/FileUploadInput";

/* ---------------- helpers ---------------- */

const isEmptyRow = (r: FormEntry) =>
  r.key.trim() === "" && r.value.trim() === "";

const ensureTrailingEmpty = (rows: FormEntry[]): FormEntry[] => {
  if (rows.some(isEmptyRow)) return rows;

  return [
    ...rows,
    {
      key: "",
      type: "text",
      value: "",
      editable: true,
      local: true,
      ignore: false,
    },
  ];
};

/* ---------------- component ---------------- */

const FormEditor: React.FC = () => {
  const [multipleRowsEmpty, setMultipleRowsEmpty] = useState<boolean>(false);
  const { tabDoc, updateUiRequest } = useViewingDocStore();
  if (!tabDoc) return null;

  const { editing, bodyType, body } = tabDoc.uiRequest;
  if (editing !== "body" || bodyType !== "form-data") return null;

  const rows = ensureTrailingEmpty(body.formData ?? []);

  useEffect(() => {
    const normalized = ensureTrailingEmpty(body.formData ?? []);
    if (normalized !== body.formData) {
      updateUiRequest({
        body: {
          ...body,
          formData: normalized,
        },
      });
    }
  }, []);

  useEffect(() => {
    const emptyRowCount = rows.filter(isEmptyRow).length;
    setMultipleRowsEmpty(emptyRowCount > 1);
  }, [rows]);

  const updateRows = (next: FormEntry[]) => {
    updateUiRequest({
      body: {
        ...body,
        formData: ensureTrailingEmpty(next),
      },
    });
  };

  const updateRow = (index: number, patch: Partial<FormEntry>) => {
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
          <tr className="text-surface-300">
            <th className="w-6 border border-surface-500/40" />
            <th className="font-medium px-4 py-2 border border-r-0 border-surface-500/40 text-left">
              Name
            </th>
            <th className="px-2 py-2 border border-l-0 border-surface-500/40 w-20" />
            <th className="font-medium px-4 py-2 border border-r-0 border-surface-500/40 text-left">
              Value
            </th>
            <th className="w-6 border border-l-0 border-surface-500/40" />
          </tr>
        </thead>

        <tbody>
          {rows.map((row, index) => {
            const disabledKey = !row.editable || !row.local;
            const empty = isEmptyRow(row);

            return (
              <tr
                key={index}
                className={`group hover:bg-surface-500/5 ${
                  row.ignore ? "opacity-40" : ""
                }`}
              >
                {/* ENABLE */}
                <td className="text-center border border-surface-500/40 px-4">
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
                    disabled={disabledKey}
                    placeholder="field name"
                    onChange={(e) =>
                      updateRow(index, { key: e.currentTarget.value })
                    }
                    className="w-full bg-transparent outline-none text-surface-200 placeholder:text-surface-600"
                  />
                </td>

                {/* TYPE */}
                <td className="px-2 py-2 border border-surface-500/40">
                  <DropDown
                    value={row.type}
                    onChange={(type) => {
                      console.log("Selected Type: ", type);
                      updateRow(index, { type, value: "" });
                    }}
                    disabled={isEmptyRow(row)}
                  />
                </td>

                {/* VALUE */}
                <td className="px-4 border border-r-0 border-surface-500/40">
                  {row.type === "text" ? (
                    <EnvAwareInput
                      value={row.value}
                      placeholder="value"
                      onChange={(val) => updateRow(index, { value: val })}
                    />
                  ) : (
                    <FileUploadInput
                      value={row.value}
                      onChange={(val) => updateRow(index, { value: val })}
                    />
                  )}
                </td>

                {/* DELETE */}
                <td className="border border-l-0 border-surface-500/40 text-right px-2">
                  {row.local && (!empty || multipleRowsEmpty) && (
                    <button
                      onClick={() => deleteRow(index)}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
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
    </div>
  );
};

export default FormEditor;
