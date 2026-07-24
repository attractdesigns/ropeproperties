import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-surface flex">
      <AdminSidebar userEmail={user.email ?? "Admin"} />
      <div className="flex-1 overflow-auto">
        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}