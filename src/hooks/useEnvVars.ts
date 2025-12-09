// // src/hooks/useEnvVars.ts
// import { useEffect, useState } from "react";
// import { getEnvironment } from "../api/services/get-environment-config";
// import { envStorage } from "../storage/env-storage";
// import type { Environment, ResolvedVariable } from "../types/env.types";
// import { useEnvVarsStore, isVariableEmpty } from "../stores/env-vars-store";

// // ---------------------- MERGE LOGIC ----------------------
// const mergeEnvVars = (
//   serverEnv: Environment,
//   localDB: ResolvedVariable[]
// ): ResolvedVariable[] => {
//   const result: ResolvedVariable[] = [];
//   const serverVars = serverEnv.variables;

//   // index local by name
//   // const localByName = new Map<string, ResolvedVariable>();
//   for (const v of localDB) {
//     if (!v.name) continue;
//     localByName.set(v.name, v);
//   }

//   // 1. SERVER VARIABLES
//   for (const sv of serverVars) {
//     const name = sv.name;
//     const isStatic = sv.source.value !== null; // static env var
//     const serverValue = sv.source.value ?? null;

//     const localVar = localByName.get(name);
//     const localValue = localVar?.value ?? null;

//     const finalValue = isStatic
//       ? serverValue // always override for static vars
//       : localValue ?? serverValue; // dynamic vars keep DB override if present

//     result.push({
//       name,
//       value: finalValue,
//       editable: !isStatic, // static → read-only, dynamic → editable
//     });

//     if (localVar) localByName.delete(name);
//   }

//   // 2. LOCAL-ONLY VARIABLES (NOT IN SERVER)
//   for (const [, v] of localByName) {
//     if (!v.name) continue;
//     result.push({
//       name: v.name,
//       value: v.value ?? null,
//       editable: true,
//     });
//   }

//   // 3. ENSURE ONE EMPTY ROW (UI-only)
//   const hasEmpty = result.some((v) => isVariableEmpty(v));
//   if (!hasEmpty) {
//     result.push({
//       name: null,
//       value: null,
//       editable: true,
//     });
//   }

//   return result;
// };

// // ---------------------- HOOK ----------------------
// export const useEnvVars = () => {
//   const setVars = useEnvVarsStore((s) => s.setVars);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const load = async () => {
//       try {
//         // 1. Fetch the server-defined environment schema
//         const envConfig: Environment = await getEnvironment();

//         // 2. Read user values from IndexedDB (ResolvedVariable[])
//         const localDB: ResolvedVariable[] = await envStorage.getAllResolved();

//         // 3. Merge server schema + DB values according to sync rules
//         const merged = mergeEnvVars(envConfig, localDB);

//         // 4. Update Zustand store
//         setVars(merged);

//         // 5. Write missing static server vars back to IndexedDB
//         for (const v of envConfig.variables) {
//           if (v.source.value !== null && v.source.value !== undefined) {
//             const resolved: ResolvedVariable = {
//               name: v.name,
//               value: v.source.value,
//               editable: false, // static server vars are read-only
//             };

//             await envStorage.saveResolvedVar(resolved);
//           }
//         }
//       } catch (err) {
//         console.error(err);
//         setError("Could not load environment variables.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     load();
//   }, [setVars]);

//   return { loading, error };
// };
