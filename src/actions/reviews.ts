import { ApiError, apiRequest } from "@/lib/api/client";

export type ReviewFormState = { error?: string; success?: boolean };

export async function submitReview(_previous: ReviewFormState, formData: FormData): Promise<ReviewFormState> {
  const productId = String(formData.get("productId") ?? "");
  const productSlug = String(formData.get("productSlug") ?? "");
  const payload = new FormData();
  payload.set("author_name", String(formData.get("authorName") ?? ""));
  payload.set("rating", String(formData.get("rating") ?? ""));
  payload.set("title", String(formData.get("title") ?? ""));
  payload.set("comment", String(formData.get("comment") ?? ""));
  try {
    await apiRequest(`products/${productId}/reviews`, { method: "POST", body: payload, cache: "no-store" });
    void productSlug; window.dispatchEvent(new Event("storefront:refresh"));
    return { success: true };
  } catch (error) {
    return { error: error instanceof ApiError && error.errors ? Object.values(error.errors).flat()[0] : "The review could not be submitted." };
  }
}
