import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { PageLoading } from "@/components/PageState";
export function ProtectedRoute({ children }: { children: ReactNode }) { const { user, loading } = useAuth(); const location = useLocation(); if (loading) return <PageLoading />; return user ? children : <Navigate to={`/account/login?callbackUrl=${encodeURIComponent(location.pathname + location.search)}`} replace />; }
