import type { Metadata } from "next";
import { LoginForm } from "@/components/LoginForm";
import { adminAuthenticate } from "@/app/actions/auth";

export const metadata: Metadata = { title: "Admin Login" };

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-walnut-950 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-cream-50 p-8 shadow-2xl">
        <h1 className="font-display text-2xl font-semibold text-ink-900">Admin Login</h1>
        <p className="mt-1 text-sm text-ink-500">Kiln &amp; Wick store management</p>
        <div className="mt-6">
          <LoginForm action={adminAuthenticate} callbackUrl={callbackUrl} />
        </div>
        <p className="mt-6 text-center text-xs text-ink-400">
          Demo admin: admin@craftsupply.test / Admin123!
        </p>
      </div>
    </div>
  );
}
