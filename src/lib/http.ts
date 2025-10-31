// src/lib/http.ts

// ====== Base URL ======
// Ưu tiên NEXT_PUBLIC_API_BASE. Nếu không có: trên browser dùng origin hiện tại,
// còn trên SSR/build fallback http://localhost:3000
export const API_BASE =
  (typeof process !== "undefined" && process.env.NEXT_PUBLIC_API_BASE) ||
  (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

// ====== Token header ======
function readToken() {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("token") ??
    sessionStorage.getItem("token") ??
    null
  );
}

function authHeader() {
  const t = readToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

// ====== Helpers ======
function withTimeout(ms: number) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return { signal: controller.signal, clear: () => clearTimeout(id) };
}

async function safeJson<T>(res: Response): Promise<T | null> {
  // 204 No Content hoặc content-type không phải JSON -> trả null
  const type = res.headers.get("content-type") || "";
  if (res.status === 204 || !type.toLowerCase().includes("application/json")) return null;
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// Ghép URL an toàn. Cho phép truyền absolute URL.
function joinUrl(base: string, path: string) {
  if (!path) throw new Error("HTTP request needs a valid path (got: " + String(path) + ")");
  if (/^https?:\/\//i.test(path)) return path; // absolute -> dùng luôn
  const b = base.replace(/\/+$/, "");
  const p = path.replace(/^\/+/, "");
  return `${b}/${p}`;
}

function isFormLike(body: any) {
  return typeof FormData !== "undefined" && body instanceof FormData;
}
function isBlobLike(body: any) {
  return typeof Blob !== "undefined" && body instanceof Blob;
}
function isArrayBufferLike(body: any) {
  return typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer;
}
function isURLSearchParamsLike(body: any) {
  return typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams;
}

async function throwHttpError(path: string, res: Response) {
  // Cố gắng đọc JSON trước; nếu không được, fallback text
  let parsed: any = null;
  let msg: string | undefined;

  try {
    parsed = await res.clone().json();
    msg = parsed?.message ?? parsed?.error;
    if (Array.isArray(msg)) msg = msg.join(", ");
  } catch {
    // ignore
  }
  if (!msg) {
    try {
      const text = await res.text();
      msg = text && text.trim().length ? text.trim() : undefined;
    } catch {
      // ignore
    }
  }

  const err = new Error(
    msg || `HTTP ${res.status} when calling ${path}`
  ) as any;
  err.status = res.status;
  err.body = parsed;
  throw err;
}

// ====== Core request ======
async function request<T>(
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  path: string,
  body?: any,
  init?: RequestInit,
  timeoutMs = 20000
) {
  const { signal, clear } = withTimeout(timeoutMs);

  try {
    const url = joinUrl(API_BASE, path);

    // Xác định kiểu body để set header & serialize đúng cách
    const isForm = isFormLike(body);
    const isBlob = isBlobLike(body);
    const isABuf = isArrayBufferLike(body);
    const isQS = isURLSearchParamsLike(body);
    const shouldSerializeToJson = body !== undefined && !isForm && !isBlob && !isABuf && !isQS;

    const headers: HeadersInit = {
      ...(shouldSerializeToJson ? { "Content-Type": "application/json" } : {}), // KHÔNG set khi FormData/Blob/ArrayBuffer/URLSearchParams
      ...authHeader(),
      ...(init?.headers || {}),
    };

    const res = await fetch(url, {
      method,
      cache: "no-store",
      // credentials: "include", // bật nếu dùng cookie
      headers,
      body:
        body === undefined
          ? undefined
          : shouldSerializeToJson
          ? JSON.stringify(body)
          : body, // giữ nguyên FormData/Blob/ArrayBuffer/URLSearchParams
      signal,
      ...init,
    });

    if (!res.ok) {
      await throwHttpError(path, res);
    }

    const json = await safeJson<T>(res);
    return json as T;
  } finally {
    clear();
  }
}

// ====== Public API ======
export async function httpGet<T>(path: string, init?: RequestInit) {
  return request<T>("GET", path, undefined, init);
}
export async function httpPost<T>(path: string, body?: any, init?: RequestInit) {
  return request<T>("POST", path, body, init);
}
export async function httpPut<T>(path: string, body?: any, init?: RequestInit) {
  return request<T>("PUT", path, body, init);
}
export async function httpPatch<T>(path: string, body?: any, init?: RequestInit) {
  return request<T>("PATCH", path, body, init);
}
export async function httpDelete<T>(path: string, init?: RequestInit) {
  return request<T>("DELETE", path, undefined, init);
}
