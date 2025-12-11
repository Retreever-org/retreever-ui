import type { RetreeverDoc, Endpoint } from "../types/response.types";

/**
 * Finds an endpoint inside a RetreeverDoc using method + path.
 * 
 * @param doc     Full Retreever documentation object
 * @param method  HTTP method ("GET", "POST", etc.)
 * @param path    Exact endpoint path (as emitted by backend)
 * @returns       The matching Endpoint or null if not found
 */
export function findEndpoint(
  doc: RetreeverDoc | null,
  method: string,
  path: string
): Endpoint | null {
  if (!doc) return null;

  for (const group of doc.groups) {
    for (const ep of group.endpoints) {
      if (ep.method === method && ep.path === path) {
        return ep;
      }
    }
  }

  return null;
}
