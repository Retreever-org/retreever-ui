import { useEnvVarsStore, isVariableEmpty } from "../../stores/env-vars-store";
import type { ResolvedVariable } from "../../types/env.types";
import "../../storage/env-sync";
import { DeleteIcon, WarningIcon } from "../../svgs/svgs";
import { useApiHealthStore } from "../../stores/api-state-store";

export default function EnvironmentPanel() {
  const { vars, updateValue, updateKey, deleteVar } = useEnvVarsStore();
  const { isOnline } = useApiHealthStore();

  const commitRow = (row: ResolvedVariable) => {
    const name = (row.name ?? "").trim();
    const value = (row.value ?? "").trim();
    if (isVariableEmpty({ ...row, name, value })) return;
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 p-4 bg-transparent text-surface-100">
      {!isOnline && (
        <div className="flex gap-2 items-center text-sm text-surface-200 p-1.5 border border-warn/80 rounded-lg bg-warn/10">
          <span className="text-warn"><WarningIcon /></span>
          <span>Variables might be stale, server not connected.</span>
        </div>
      )}

      <p className="text-sm text-surface-400">
        Environment Variables are best configured in your backend.
      </p>

      <div className="flex-1 overflow-auto mt-4">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-surface-200">
              <th className="px-4 py-2 border-b border-r border-surface-500/50 text-left">
                Name
              </th>
              <th className="px-4 py-2 border-b border-surface-500/50 text-left">
                Value
              </th>
              <th className="w-10 border-b border-surface-500/50" />
            </tr>
          </thead>

          <tbody>
            {vars.map((row) => {
              const empty = isVariableEmpty(row);

              return (
                <tr
                  key={row.id}
                  className="group text-surface-200 hover:bg-surface-500/5"
                >
                  {/* NAME */}
                  <td className="px-4 py-2 border-b border-r border-surface-500/50">
                    <input
                      value={row.name ?? ""}
                      placeholder="Add New Variable"
                      disabled={!row.editable || !row.local}
                      onChange={(e) =>
                        updateKey(row.id, e.currentTarget.value)
                      }
                      onBlur={() => commitRow(row)}
                      className={`w-full bg-transparent outline-none ${
                        !row.editable || !row.local
                          ? "text-surface-400 cursor-not-allowed"
                          : ""
                      }`}
                    />
                  </td>

                  {/* VALUE */}
                  <td className="px-4 py-2 border-b border-surface-500/50">
                    <input
                      value={row.value ?? ""}
                      placeholder="Variable value"
                      onChange={(e) =>
                        updateValue(row.id, e.currentTarget.value)
                      }
                      onBlur={() => commitRow(row)}
                      className="w-full bg-transparent outline-none"
                    />
                  </td>

                  {/* DELETE */}
                  <td className="px-2 border-b border-surface-500/50 text-right">
                    {row.local && !empty && (
                      <button
                        onClick={() => deleteVar(row.id)}
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
    </div>
  );
}
