import "server-only";
import { cookies } from "next/headers";
import { apiHeaders } from "@/lib/api/headers";

export type AppSession = {
  user: { id: string; name: string; email: string; role: "ADMIN" | "CUSTOMER" };
};

export async function auth(): Promise<AppSession | null> {
  const token = (await cookies()).get("kw_api_token")?.value;
  if (!token) return null;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  const response = await fetch(`${baseUrl}/auth/me`, { headers: await apiHeaders({ Authorization: `Bearer ${token}` }), cache: "no-store" });
  if (!response.ok) return null;
  const { data } = await response.json() as { data: { id: string; name: string; email: string; role: "admin" | "customer" } };
  return { user: { ...data, role: data.role === "admin" ? "ADMIN" : "CUSTOMER" } };
}
