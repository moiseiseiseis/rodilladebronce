// src/lib/api/client.ts

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api/v1";

export class ApiError extends Error {
  status?: number;
  data?: unknown;

  constructor(message: string, status?: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

function getTokenFromStorage(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem("sk_token");
  } catch (err) {
    console.warn("[API] Error leyendo token de localStorage:", err);
    return null;
  }
}

interface ApiFetchOptions extends RequestInit {
  auth?: boolean;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const { auth = true, headers, ...rest } = options;

  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;

  const token = auth ? getTokenFromStorage() : null;

  const finalHeaders: HeadersInit = {
    Accept: "application/json",
    ...(rest.body ? { "Content-Type": "application/json" } : {}),
    ...(headers || {}),
    ...(auth && token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };

  console.debug("[API] Request:", {
    baseUrl: API_BASE_URL,
    url,
    method: rest.method || "GET",
    auth,
  });

  let res: Response;

  try {
    res = await fetch(url, {
      ...rest,
      headers: finalHeaders,
    });
  } catch (error: any) {
    console.error("[API] Network error al llamar al backend:", {
      url,
      error,
    });

    throw new ApiError(
      "No se pudo conectar con el servidor. Verifica que el backend NestJS esté corriendo y que API_BASE_URL sea correcta.",
      undefined,
      { originalError: String(error) }
    );
  }

  const contentType = res.headers.get("content-type");
  const isJson = contentType && contentType.includes("application/json");

  const data = isJson ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    console.error("[API] Error response:", {
      url,
      status: res.status,
      data,
    });

    if (res.status === 401) {
      throw new ApiError("No autorizado", 401, data);
    }

    throw new ApiError(
      data && (data.message || data.error)
        ? String(data.message || data.error)
        : `Error HTTP ${res.status}`,
      res.status,
      data
    );
  }

  return data as T;
}
