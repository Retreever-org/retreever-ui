import { useEnvVarsStore, isVariableEmpty } from "../../stores/env-vars-store";
import type { ResolvedVariable } from "../../types/env.types";
import "../../storage/env-sync";
import { DeleteIcon } from "../../svgs/svgs";

export default function EnvironmentPanel() {
  const { vars, updateValue, updateKey, deleteVar } = useEnvVarsStore();

  const commitRow = async (row: ResolvedVariable) => {
    const name = (row.name ?? "").trim();
    const value = (row.value ?? "").trim();
    const empty = isVariableEmpty({ ...row, name, value });
    if (empty) return;
  };

  const handleNameChange = (row: ResolvedVariable, nextName: string) => {
    if (!row.editable || !row.local) return; // server vars: read-only key
    const currentName = row.name ?? "";
    updateKey(currentName, nextName);
  };

  const handleValueChange = (row: ResolvedVariable, nextValue: string) => {
    const currentName = row.name ?? "";
    updateValue(currentName, nextValue);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-transparent text-surface-100">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-wide">
          Environment Variables
        </h2>

        <button
          className="px-3 py-1 rounded-md text-sm font-medium text-white
                     bg-linear-to-br from-primary-400 to-primary-500 hover:opacity-90"
        >
          Learn
        </button>
      </div>

      {/* INFO */}
      <p className="text-sm text-surface-400 leading-relaxed">
        Environment Variables are best configured in your backend. You can still
        add and manage them here, but they cannot be shared across your team.
      </p>
      <p className="text-xs text-primary-300/80 -mt-1.5">
        Learn about environment variables.
      </p>

      {/* TABLE */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-surface-200">
              <th className="text-left px-4 py-2 border-b border-r border-surface-500/50">
                Name
              </th>
              <th className="text-left px-4 py-2 border-b border-surface-500/50">
                Value
              </th>
              <th className="w-10 border-b border-surface-500/50"></th>
            </tr>
          </thead>

          <tbody>
            {vars.map((row, index) => {
              const name = row.name ?? "";
              const value = row.value ?? "";
              const empty = isVariableEmpty(row);
              const isServerVar = !row.local; // non-local = server-configured

              return (
                <tr key={index} className="group text-surface-200 hover:bg-black/20">
                  {/* NAME CELL */}
                  <td className="px-4 py-2 border-b border-r border-surface-500/50">
                    <input
                      type="text"
                      value={name}
                      placeholder="Variable name"
                      disabled={!row.editable || isServerVar}
                      onChange={(e) =>
                        handleNameChange(row, e.currentTarget.value)
                      }
                      onBlur={(e) =>
                        commitRow({ ...row, name: e.currentTarget.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          commitRow({ ...row, name: e.currentTarget.value });
                        }
                      }}
                      className={`w-full bg-transparent outline-none ${
                        !row.editable || isServerVar
                          ? "text-surface-400 cursor-not-allowed"
                          : ""
                      }`}
                    />
                  </td>

                  {/* VALUE CELL */}
                  <td className="px-4 py-2 border-b border-surface-500/50">
                    <input
                      type="text"
                      value={value}
                      placeholder="Variable value"
                      onChange={(e) =>
                        handleValueChange(row, e.currentTarget.value)
                      }
                      onBlur={(e) =>
                        commitRow({ ...row, value: e.currentTarget.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          commitRow({ ...row, value: e.currentTarget.value });
                        }
                      }}
                      className="w-full bg-transparent outline-none"
                    />
                  </td>

                  {/* DELETE BUTTON (ONLY FOR LOCAL VARS) */}
                  <td className="px-2 border-b border-surface-500/50 text-right">
                    {row.local && !empty && (
                      <button
                        onClick={() => deleteVar(name)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition"
                      >
                        <DeleteIcon/>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
