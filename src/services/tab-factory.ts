import type {
  TabDoc,
  RequestKeyValueEntry,
  FormEntry,
} from "../types/editor.types";
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

  return findEndpoint(doc, methodPart.toUpperCase(), path);
}

/* ---------------- factory ---------------- */

export function buildTabDocFromEndpoint(
  ep: Endpoint,
  baseUriPrefix?: string
): TabDoc {
  const key = tabKeyForEndpoint(ep.method, ep.path);
  const url = (baseUriPrefix ? baseUriPrefix.replace(/\/$/, "") : "") + ep.path;

  const consumes = ep.consumes ?? [];
  const resolvedAll = consumes.map(resolveContentType);

  const activeResolved = resolvedAll[0] ?? {
    bodyType: "none" as const,
    rawType: undefined,
  };

  /* ---------------- headers ---------------- */

  const headers: RequestKeyValueEntry[] = (ep.headers || []).map((h) => ({
    key: h.name,
    value: "",
    editable: false,
    local: false,
    ignore: false,
  }));

  /* ---------------- query params ---------------- */

  const queryParams: RequestKeyValueEntry[] = (ep.query_params || []).map(
    (q) => ({
      key: q.name,
      value: q.default_value != null ? String(q.default_value) : "",
      editable: false,
      local: false,
      ignore: false,
    })
  );

  /* ---------------- body (derive ALL) ---------------- */

  let raw: string | undefined = undefined;
  let formData: FormEntry[] = [];
  let urlEncoded: RequestKeyValueEntry[] = [];
  let binaryFileId: string | undefined;

  // RAW (json, xml, text, etc)
  if (resolvedAll.some((r) => r.bodyType === "raw")) {
    raw = ep.request?.model;
  }

  // multipart/form-data
  if (resolvedAll.some((r) => r.bodyType === "form-data")) {
    formData = Object.keys(ep.request?.model ?? {}).map((key) => ({
      key,
      type: "text",
      value: "",
      editable: false,
      local: false,
      ignore: false,
    }));
  }

  // application/x-www-form-urlencoded
  if (resolvedAll.some((r) => r.bodyType === "x-www-form-urlencoded")) {
    urlEncoded = Object.keys(ep.request?.model ?? {}).map((key) => ({
      key,
      value: "",
      editable: false,
      local: false,
      ignore: false,
    }));
  }

  // binary → nothing to derive from schema
  if (resolvedAll.some((r) => r.bodyType === "binary")) {
    binaryFileId = undefined;
  }

  return {
    key,
    method: ep.method,
    path: ep.path,
    uiRequest: {
      url,
      headers,
      queryParams,
      consumes,

      editing: "params",
      bodyType: activeResolved.bodyType,
      rawType: activeResolved.rawType,

      body: {
        raw,
        formData,
        urlEncoded,
        binaryFileId,
      },
    },
    lastResponse: undefined,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}
