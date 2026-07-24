"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Home, Mail, Users, LogOut, TrendingUp, Handshake } from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Listings", href: "/admin/listings", icon: Home },
  { label: "Investments", href: "/admin/investments", icon: TrendingUp },
  { label: "Inquiries", href: "/admin/inquiries", icon: Mail },
  { label: "Agents", href: "/admin/agents", icon: Users },
  { label: "Partners", href: "/admin/partners", icon: Handshake },
];

export function AdminSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="w-60 bg-white border-r border-line flex flex-col shrink-0">
      <div className="p-6 border-b border-line">
        <Link href="/admin">
          <Logo />
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/admin" && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent-tint text-accent-deep"
                  : "text-ink hover:bg-surface"
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-line">
        <p className="text-xs text-muted mb-2 truncate">{userEmail}</p>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-ink hover:text-accent transition-colors w-full"
        >
          <LogOut size={18} />
          Log out
        </button>
      </div>
    </aside>
  );
}