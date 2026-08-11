"use server";
import { apiHeaders } from "@/lib/api/headers";

export type ContactFormState = { error?: string; success?: boolean };

export async function submitContactForm(_previous: ContactFormState, formData: FormData): Promise<ContactFormState> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  const response = await fetch(`${apiUrl}/contact`, { method: "POST", headers: await apiHeaders({ "Content-Type": "application/json" }), body: JSON.stringify({ name: formData.get("name"), email: formData.get("email"), message: formData.get("message") }), cache: "no-store" });
  if (!response.ok) return { error: "Please fill in all fields with a valid email address." };
  return { success: true };
}
