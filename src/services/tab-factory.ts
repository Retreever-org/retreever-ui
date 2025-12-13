import type { TabDoc, RequestKeyValueEntry } from "../types/editor.types";
import type { Endpoint, RetreeverDoc } from "../types/response.types";
import { findEndpoint } from "./doc-search";
import { resolveContentType } from "../services/contentTypeResolver";

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

  const consumes = ep.consumes || [];
  const resolved =
    consumes.length > 0
      ? resolveContentType(consumes[0])
      : { bodyType: "none" as const, rawType: undefined };

  // server-defined headers
  const headers: RequestKeyValueEntry[] = (ep.headers || []).map((h) => ({
    key: h.name,
    value: "",
    editable: false, // server-defined key
    local: false,
    ignore: false,
  }));

  // server-defined query params
  const queryParams: RequestKeyValueEntry[] = (ep.query_params || []).map(
    (q) => ({
      key: q.name,
      value: q.default_value != null ? String(q.default_value) : "",
      editable: false, // server-defined key
      local: false,
      ignore: false,
    })
  );

  return {
    key,
    method,
    path,
    uiRequest: {
      url,
      headers,
      queryParams,
      body,
      consumes,

      editing: "params",
      bodyType: resolved.bodyType,
      rawType: resolved.rawType,
    },
    lastResponse: undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
