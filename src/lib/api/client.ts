import { LOCALE_COOKIE, normalizeLocale, type Locale } from "@/lib/i18n/config";
import { clientStorage } from "@/lib/storage";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly errors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export type ApiQueryValue = string | number | boolean | null | undefined;
export type ApiQuery = Record<string, ApiQueryValue | ApiQueryValue[]>;

type ApiOptions = RequestInit & {
  locale?: Locale;
  query?: ApiQuery;
  revalidate?: number;
};

function appendQueryValue(
  params: URLSearchParams,
  key: string,
  value: ApiQueryValue,
) {
  if (value === undefined || value === null) return;

  params.append(
    key,
    typeof value === "boolean" ? (value ? "1" : "0") : String(value),
  );
}

export function serializeApiQuery(query: ApiQuery = {}): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => appendQueryValue(params, key, item));
      return;
    }

    appendQueryValue(params, key, value);
  });

  return params.toString();
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const baseUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";
  const { locale, query, revalidate, ...requestOptions } = options;
  const activeLocale = normalizeLocale(locale ?? localStorage.getItem(LOCALE_COOKIE) ?? undefined);
  const requestHeaders = new Headers(options.headers);
  requestHeaders.set("Accept", "application/json");
  requestHeaders.set("Accept-Language", activeLocale);

  if (options.body && !(options.body instanceof FormData)) requestHeaders.set("Content-Type", "application/json");
  const token = clientStorage.getAuthToken();
  if (token) requestHeaders.set("Authorization", `Bearer ${token}`);

  const queryString = serializeApiQuery(query);
  const separator = path.includes("?") ? "&" : "?";
  const requestPath = queryString ? `${path}${separator}${queryString}` : path;

  const response = await fetch(`${baseUrl}/${requestPath.replace(/^\//, "")}`, {
    ...requestOptions,
    headers: requestHeaders,
    cache: requestOptions.cache ?? (revalidate === undefined ? undefined : "default"),
  });
  const payload = await response.json().catch(() => ({ message: "The server returned an invalid response." }));
  if (!response.ok) throw new ApiError(payload.message ?? "Request failed.", response.status, payload.errors);
  return payload as T;
}
