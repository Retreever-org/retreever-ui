import type { HttpMethod } from "./response.types";

export interface TabDoc {
  key: string;
  method: HttpMethod;
  path: string;

  uiRequest: {
    url: string;
    headers: Array<{ k: string; v: string }>;
    queryParams: Array<{ k: string; v: string }>;
    body: string;
    consumes: string[];
  };

  lastResponse?: {
    status?: number;
    headers?: Record<string, string>;
    body?: string;
    timeMs?: number;
    timestamp?: number;
  };

  createdAt: number;
  updatedAt: number;
}

export type KeyOrderMap = Record<string, number>;
