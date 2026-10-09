import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAdminUser } from "@/lib/nhost/auth-server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headerList = await headers();
  const pathname = headerList.get("x-pathname") ?? "";
  const isLoginRoute = pathname === "/admin/login";

  if (isLoginRoute) {
    return <>{children}</>;
  }

  const user = await getAdminUser();
  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-surface flex">
      <AdminSidebar userEmail={user.email} />
      <div className="flex-1 overflow-auto">
        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
