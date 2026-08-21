import { apiRequest } from "@/lib/api/client";
import { clientStorage } from "@/lib/storage";
export type AppSession = { user: { id: string; name: string; email: string; role: "ADMIN" | "CUSTOMER" } };
export async function auth(): Promise<AppSession | null> { if (!clientStorage.getAuthToken()) return null; try { const { data } = await apiRequest<{ data: { id: string; name: string; email: string; role: "admin" | "customer" | "ADMIN" | "CUSTOMER" } }>("auth/me", { cache: "no-store" }); return { user: { ...data, role: data.role.toLowerCase() === "admin" ? "ADMIN" : "CUSTOMER" } }; } catch { return null; } }
