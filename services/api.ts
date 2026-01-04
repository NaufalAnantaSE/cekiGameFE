type ApiOptions = {
  auth?: boolean;
  token?: string | null;
  headers?: Record<string, string>;
};

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

function getApiBaseUrl(): string {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!base) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL belum di-set. Tambahkan di .env.local atau environment hosting.",
    );
  }
  return base.replace(/\/$/, "");
}

function getTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("ceki.token");
}

async function apiRequest<T>(
  method: HttpMethod,
  path: string,
  body?: unknown,
  options: ApiOptions = {},
): Promise<T> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? "" : "/"}${path}`;

  const wantsAuth = options.auth !== false;
  const token = options.token ?? (wantsAuth ? getTokenFromStorage() : null);

  const headers: Record<string, string> = {
    Accept: "application/json",
    ...(options.headers ?? {}),
  };

  const hasBody = body !== undefined && body !== null;
  if (hasBody) {
    headers["Content-Type"] = "application/json";
  }
  if (wantsAuth && token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: hasBody ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const contentType = res.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");

  if (!res.ok) {
    let details = "";
    if (isJson) {
      try {
        const json = await res.json();
        details = typeof json === "string" ? json : JSON.stringify(json);
      } catch {
        details = "";
      }
    } else {
      try {
        details = await res.text();
      } catch {
        details = "";
      }
    }
    const message = details
      ? `API ${res.status} ${res.statusText}: ${details}`
      : `API ${res.status} ${res.statusText}`;
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }
  if (!isJson) {
    return (await res.text()) as unknown as T;
  }
  return (await res.json()) as T;
}

export function apiGet<T>(path: string, options?: ApiOptions) {
  return apiRequest<T>("GET", path, undefined, options);
}

export function apiPost<T>(path: string, body?: unknown, options?: ApiOptions) {
  return apiRequest<T>("POST", path, body ?? {}, options);
}

export function apiPatch<T>(path: string, body?: unknown, options?: ApiOptions) {
  return apiRequest<T>("PATCH", path, body ?? {}, options);
}

export function apiDelete<T>(path: string, options?: ApiOptions) {
  return apiRequest<T>("DELETE", path, undefined, options);
}
