import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { apiRequest } from "@/lib/api/client";
import { clientStorage } from "@/lib/storage";

export type AuthUser = { id: string; name: string; email: string; role: "ADMIN" | "CUSTOMER" };
type AuthContextValue = { user: AuthUser | null; loading: boolean; login(email: string, password: string): Promise<void>; register(name: string, email: string, password: string): Promise<void>; logout(): Promise<void>; refresh(): Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = useCallback(async () => { if (!clientStorage.getAuthToken()) { setUser(null); setLoading(false); return; } try { setUser((await apiRequest<{ data: AuthUser }>("auth/me", { cache: "no-store" })).data); } catch { clientStorage.clearAuthToken(); setUser(null); } finally { setLoading(false); } }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const acceptToken = useCallback(async (result: { data: { token: string } }) => { const guestToken = clientStorage.getCartToken(); clientStorage.setAuthToken(result.data.token); if (guestToken) { await apiRequest("cart/merge", { method: "POST", body: JSON.stringify({ cart_token: guestToken }) }).catch(() => undefined); clientStorage.clearCartToken(); } await refresh(); window.dispatchEvent(new Event("storefront:refresh")); }, [refresh]);
  const value = useMemo<AuthContextValue>(() => ({ user, loading, refresh, login: async (email, password) => acceptToken(await apiRequest<{ data: { token: string } }>("auth/login", { method: "POST", body: JSON.stringify({ email, password }) })), register: async (name, email, password) => acceptToken(await apiRequest<{ data: { token: string } }>("auth/register", { method: "POST", body: JSON.stringify({ name, email, password, password_confirmation: password }) })), logout: async () => { await apiRequest("auth/logout", { method: "POST" }).catch(() => undefined); clientStorage.clearAuthToken(); setUser(null); window.dispatchEvent(new Event("storefront:refresh")); } }), [user, loading, refresh, acceptToken]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used within AuthProvider"); return value; }
