import type { TabDoc } from "../types/editor.types";
import type { Endpoint } from "../types/response.types";

export const tabKeyForEndpoint = (method: string, path: string) =>
  `TAB::${method.toUpperCase()}::${encodeURIComponent(path)}`;

export function buildTabDocFromEndpoint(ep: Endpoint, baseUriPrefix?: string): TabDoc {
  const path = ep.path;
  const method = ep.method;
  const key = tabKeyForEndpoint(method, path);

  const url = (baseUriPrefix ? baseUriPrefix.replace(/\/$/, "") : "") + path;

  let body = "";
  if (ep.request?.example_model) {
    try {
      body = typeof ep.request.example_model === "string"
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
      headers: (ep.headers || []).map(h => ({ k: h.name, v: "" })),
      queryParams: (ep.query_params || []).map(q => ({ k: q.name, v: String(q.default_value ?? "") })),
      body,
      consumes: ep.consumes || [],
    },
    lastResponse: undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

