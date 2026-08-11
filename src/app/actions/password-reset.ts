"use server";
import { apiHeaders } from "@/lib/api/headers";

export type ResetState = { error?: string; success?: boolean };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export async function requestPasswordReset(_previous: ResetState, formData: FormData): Promise<ResetState> {
  const response = await fetch(`${apiUrl}/auth/forgot-password`, { method: "POST", headers: await apiHeaders({ "Content-Type": "application/json" }), body: JSON.stringify({ email: formData.get("email") }), cache: "no-store" });
  if (!response.ok) return { error: "Enter a valid email address." };
  return { success: true };
}

export async function resetPassword(_previous: ResetState, formData: FormData): Promise<ResetState> {
  const password = String(formData.get("password") ?? "");
  const response = await fetch(`${apiUrl}/auth/reset-password`, { method: "POST", headers: await apiHeaders({ "Content-Type": "application/json" }), body: JSON.stringify({
    token: formData.get("token"), email: formData.get("email"), password, password_confirmation: password,
  }), cache: "no-store" });
  const payload = await response.json().catch(() => null) as { message?: string; errors?: Record<string, string[]> } | null;
  if (!response.ok) return { error: payload?.errors ? Object.values(payload.errors)[0]?.[0] : payload?.message ?? "This reset link is invalid or expired." };
  return { success: true };
}
