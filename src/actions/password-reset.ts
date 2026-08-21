import { apiRequest, ApiError } from "@/lib/api/client";

export type ResetState = { error?: string; success?: boolean };

export async function requestPasswordReset(_previous: ResetState, formData: FormData): Promise<ResetState> {
  try { await apiRequest("auth/forgot-password", { method: "POST", body: JSON.stringify({ email: formData.get("email") }), cache: "no-store" }); return { success: true }; }
  catch { return { error: "Enter a valid email address." }; }
}

export async function resetPassword(_previous: ResetState, formData: FormData): Promise<ResetState> {
  const password = String(formData.get("password") ?? "");
  try { await apiRequest("auth/reset-password", { method: "POST", body: JSON.stringify({ token: formData.get("token"), email: formData.get("email"), password, password_confirmation: password }), cache: "no-store" }); return { success: true }; }
  catch (error) { return { error: error instanceof ApiError ? (error.errors ? Object.values(error.errors).flat()[0] : error.message) : "This reset link is invalid or expired." }; }
}
