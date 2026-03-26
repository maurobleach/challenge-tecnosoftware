const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiEnvelope<TData> = {
  isSuccess?: boolean;
  message?: string;
  data?: TData;
  errors?: Array<{ message?: string }>;
};

type RequestOptions<TBody> = {
  method?: HttpMethod;
  token?: string | null;
  body?: TBody;
};

async function request<TResponse, TBody = unknown>(
  path: string,
  options: RequestOptions<TBody> = {},
): Promise<TResponse> {
  const { method = "GET", token, body } = options;

  const headers: HeadersInit = {};

  if (token) {
    // Authenticated request example: Authorization: Bearer <token>
    headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let parsedJson: ApiEnvelope<TResponse> | TResponse | undefined;
  if (text) {
    try {
      parsedJson = JSON.parse(text) as ApiEnvelope<TResponse> | TResponse;
    } catch {
      parsedJson = undefined;
    }
  }

  if (!response.ok) {
    if (parsedJson && typeof parsedJson === "object" && "errors" in parsedJson) {
      const firstError = parsedJson.errors?.[0]?.message;
      throw new Error(firstError || parsedJson.message || `Request failed with status ${response.status}`);
    }

    throw new Error(text || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return undefined as TResponse;
  }

  if (
    parsedJson &&
    typeof parsedJson === "object" &&
    !Array.isArray(parsedJson) &&
    "data" in parsedJson
  ) {
    return parsedJson.data as TResponse;
  }

  return parsedJson as TResponse;
}

export const apiClient = {
  get<TResponse>(path: string, token?: string | null) {
    return request<TResponse>(path, { method: "GET", token });
  },
  post<TResponse, TBody>(path: string, body: TBody, token?: string | null) {
    return request<TResponse, TBody>(path, { method: "POST", body, token });
  },
  patch<TResponse, TBody>(path: string, body: TBody, token?: string | null) {
    return request<TResponse, TBody>(path, { method: "PATCH", body, token });
  },
};
