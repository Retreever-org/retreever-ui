export interface Environment {
  variables: EnvVariable[];
}

export interface EnvVariable {
  name: string;
  source: EnvSource;
}

export interface EnvSource {
  value?: string | null;      // nullable, optional
  request?: EnvRequest | null;
}

export interface EnvRequest {
  endpoints: string[];        // Java Set<String>
  method: string;             // "post", "get", etc.
  response: EnvResponse;
}

export interface EnvResponse {
  bodyAttributePath?: string | null;
  headerAttributePath?: string | null;
}


// ----------------- Resolved Type ------------------

export interface ResolvedVariable {
  id: string;
  name: string | null;
  value: string | null;
  editable: boolean;
  local: boolean;
} 