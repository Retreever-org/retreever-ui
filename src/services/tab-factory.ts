import type { TabDoc } from "../types/editor.types";
import type { Endpoint, RetreeverDoc } from "../types/response.types";
import { findEndpoint } from "./doc-search";

export const tabKeyForEndpoint = (method: string, path: string) =>
  `${method.toUpperCase()}:${path}`;

export function tabKeyToEndpoint(
  key: string,
  doc: RetreeverDoc | null
): Endpoint | null {
  const [methodPart, path] = key.split(":", 2);
  if (!methodPart || !path) return null;

  const method = methodPart.toUpperCase();

  const endpoint = findEndpoint(doc, method, path);

  return endpoint;
}

export function buildTabDocFromEndpoint(
  ep: Endpoint,
  baseUriPrefix?: string
): TabDoc {
  const path = ep.path;
  const method = ep.method;
  const key = tabKeyForEndpoint(method, path);

  const url = (baseUriPrefix ? baseUriPrefix.replace(/\/$/, "") : "") + path;

  let body = "";
  if (ep.request?.example_model) {
    try {
      body =
        typeof ep.request.example_model === "string"
          ? ep.request.example_model
          : JSON.stringify(ep.request.example_model, null, 2);
    } catch {
      body = String(ep.request.example_model);
    }
  }

  return {
    key,
    method,
    path,
    uiRequest: {
      url,
      headers: (ep.headers || []).map((h) => ({ k: h.name, v: "" })),
      queryParams: (ep.query_params || []).map((q) => ({
        k: q.name,
        v: String(q.default_value ?? ""),
      })),
      body,
      consumes: ep.consumes || [],
    },
    lastResponse: undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
