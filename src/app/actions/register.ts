"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiHeaders } from "@/lib/api/headers";

export type RegisterState = { error?: string };

export async function registerAccount(_previous: RegisterState, formData: FormData): Promise<RegisterState> {
  const password = String(formData.get("password") ?? "");
  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  const response = await fetch(`${baseUrl}/auth/register`, { method: "POST", headers: await apiHeaders({ "Content-Type": "application/json" }), body: JSON.stringify({
    name: formData.get("name"), email: formData.get("email"), password, password_confirmation: password,
  }), cache: "no-store" });
  const payload = await response.json().catch(() => null) as { data?: { token: string }; message?: string; errors?: Record<string, string[]> } | null;
  if (!response.ok || !payload?.data) return { error: payload?.errors ? Object.values(payload.errors)[0]?.[0] : payload?.message ?? "Registration failed." };
  (await cookies()).set("kw_api_token", payload.data.token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 30, path: "/" });
  redirect("/account");
}
