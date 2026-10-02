"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import { REALTOR_NAME } from "@/lib/site";

const navItems = [
  { label: "Listings", href: "/listings" },
  { label: "Invest", href: "/invest" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Detect if we're on a page with a full-bleed hero (home only)
  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Transparent over hero, solid otherwise
  const transparent = isHome && !scrolled && !mobileOpen;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        transparent
          ? "bg-transparent"
          : "bg-white border-b border-line"
      )}
    >
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center" aria-label="RopeProperties home">
            <Logo variant={transparent ? "light" : "dark"} />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors",
                  transparent
                    ? "text-white/90 hover:text-white"
                    : "text-ink hover:text-accent",
                  pathname === item.href && !transparent && "text-accent"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Mobile toggle */}
          <button
            type="button"
            className="flex h-11 w-11 items-center justify-center rounded-full md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            {mobileOpen ? (
              <X className={transparent ? "text-white" : "text-ink"} size={24} />
            ) : (
              <Menu className={transparent ? "text-white" : "text-ink"} size={24} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="mobile-navigation" className="md:hidden bg-white border-b border-line shadow-lg">
          <nav aria-label="Mobile navigation" className="flex flex-col px-4 py-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex min-h-12 items-center rounded-lg px-3 text-base font-medium",
                  pathname === item.href ? "text-accent" : "text-ink"
                )}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/contact" onClick={() => setMobileOpen(false)} className="mt-3 flex min-h-12 items-center justify-center rounded-lg bg-ink px-4 text-sm font-semibold text-white">
              Speak with {REALTOR_NAME}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
