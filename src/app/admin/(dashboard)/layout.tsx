import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-cream-100">
      <AdminSidebar adminName={session?.user?.name ?? "Admin"} />
      <main className="flex-1 overflow-y-auto p-6 sm:p-8 lg:p-10">{children}</main>
    </div>
  );
}
