import { apiRequest, ApiError } from "@/lib/api/client";
import { clientStorage } from "@/lib/storage";

export type AuthFormState = { error?: string };

async function login(formData: FormData, requireAdmin = false): Promise<AuthFormState> {
  try {
    const guestCartToken = clientStorage.getCartToken();
    const result = await apiRequest<{ data: { token: string; user: { role: string } } }>("auth/login", {
      method: "POST",
      body: JSON.stringify({
        email: formData.get("email"),
        password: formData.get("password"),
        device_name: "react-vite",
      }),
    });

    if (requireAdmin && result.data.user.role.toLowerCase() !== "admin") {
      return { error: "Administrator access is required." };
    }

    clientStorage.setAuthToken(result.data.token);

    if (guestCartToken && !requireAdmin) {
      await apiRequest("cart/merge", {
        method: "POST",
        body: JSON.stringify({ cart_token: guestCartToken }),
      }).catch(() => undefined);
      clientStorage.clearCartToken();
    }

    window.location.assign(String(formData.get("callbackUrl") || (requireAdmin ? "/admin" : "/account")));

    return {};
  } catch (error) {
    return {
      error: error instanceof ApiError && error.status === 422
        ? "Invalid email or password."
        : "Authentication service is unavailable.",
    };
  }
}

export async function authenticate(_previous: AuthFormState, formData: FormData) {
  return login(formData);
}

export async function adminAuthenticate(_previous: AuthFormState, formData: FormData) {
  return login(formData, true);
}

export async function signOutAction() {
  await apiRequest("auth/logout", { method: "POST" }).catch(() => undefined);
  clientStorage.clearAuthToken();
  window.location.assign("/");
}
