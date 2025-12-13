import type { BodyType, RawBodyType } from "../types/editor.types";

export function resolveContentType(
  contentType: string
): { bodyType: BodyType; rawType?: RawBodyType } {
  const ct = contentType.toLowerCase();

  // form types
  if (ct.includes("multipart/form-data")) {
    return { bodyType: "form-data" };
  }

  if (ct.includes("application/x-www-form-urlencoded")) {
    return { bodyType: "x-www-form-urlencoded" };
  }

  // raw types
  if (ct.includes("application/json")) {
    return { bodyType: "raw", rawType: "JSON" };
  }

  if (ct.includes("application/xml") || ct.includes("text/xml")) {
    return { bodyType: "raw", rawType: "XML" };
  }

  if (ct.includes("text/html")) {
    return { bodyType: "raw", rawType: "HTML" };
  }

  if (ct.includes("application/javascript") || ct.includes("text/javascript")) {
    return { bodyType: "raw", rawType: "JavaScript" };
  }

  if (ct.startsWith("text/")) {
    return { bodyType: "raw", rawType: "text" };
  }

  // binary / octet-stream / images / pdf / etc
  if (
    ct.includes("octet-stream") ||
    ct.startsWith("image/") ||
    ct.includes("pdf") ||
    ct.includes("zip")
  ) {
    return { bodyType: "binary" };
  }

  // fallback
  return { bodyType: "raw", rawType: "text" };
}
