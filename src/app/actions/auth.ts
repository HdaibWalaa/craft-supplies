"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiHeaders } from "@/lib/api/headers";

export type AuthFormState = { error?: string };

async function login(formData: FormData, requireAdmin = false): Promise<AuthFormState> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  const response = await fetch(`${baseUrl}/auth/login`, { method: "POST", headers: await apiHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ email: formData.get("email"), password: formData.get("password"), device_name: "nextjs" }), cache: "no-store" });
  const payload = await response.json().catch(() => null) as { data?: { token: string; user: { role: string } }; message?: string } | null;
  if (!response.ok || !payload?.data) return { error: response.status === 422 ? "Invalid email or password." : "Authentication service is unavailable." };
  if (requireAdmin && payload.data.user.role !== "admin") return { error: "Administrator access is required." };
  const cookieStore = await cookies();
  cookieStore.set("kw_api_token", payload.data.token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/" });
  const guestToken = cookieStore.get("cart_token")?.value;
  if (guestToken) await fetch(`${baseUrl}/cart/merge`, { method: "POST", headers: await apiHeaders({ "Content-Type": "application/json", Authorization: `Bearer ${payload.data.token}` }), body: JSON.stringify({ guest_token: guestToken }), cache: "no-store" });
  redirect(String(formData.get("callbackUrl") || (requireAdmin ? "/admin" : "/account")));
}

export async function authenticate(_previous: AuthFormState, formData: FormData) { return login(formData); }
export async function adminAuthenticate(_previous: AuthFormState, formData: FormData) { return login(formData, true); }

export async function signOutAction() {
  const cookieStore = await cookies(); const token = cookieStore.get("kw_api_token")?.value;
  if (token) {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
    await fetch(`${baseUrl}/auth/logout`, { method: "POST", headers: await apiHeaders({ Authorization: `Bearer ${token}` }), cache: "no-store" }).catch(() => undefined);
  }
  cookieStore.delete("kw_api_token"); redirect("/");
}
