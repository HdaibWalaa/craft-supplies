import "server-only";
import { getLocale } from "@/lib/i18n/server";

export async function apiHeaders(init?: HeadersInit): Promise<Headers> {
  const headers = new Headers(init);
  headers.set("Accept", "application/json");
  headers.set("Accept-Language", await getLocale());
  return headers;
}
