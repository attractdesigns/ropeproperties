import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Home, Search, Phone } from "lucide-react";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="pt-16">
        <section className="relative min-h-[72vh] overflow-hidden bg-surface">
          {/* Decorative diagonal strip in accent-tint for texture */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage:
                "radial-gradient(ellipse at 20% 30%, var(--accent-tint) 0%, transparent 55%), radial-gradient(ellipse at 85% 70%, var(--accent-tint) 0%, transparent 55%)",
            }}
          />
          <div className="relative mx-auto flex max-w-[1200px] flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-24 text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-accent">Lost in transit</p>
            <h1
              className="mt-4 font-display text-[clamp(5rem,18vw,12rem)] leading-none text-ink tracking-tight"
              style={{ letterSpacing: "-0.04em" }}
            >
              404
            </h1>
            <p className="mt-4 max-w-md text-base text-muted leading-relaxed">
              The page you&apos;re after has moved, sold, or never existed. Try
              one of the paths below — or tell me what you&apos;re looking for.
            </p>

            <div className="mt-10 flex flex-wrap justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-medium text-bg hover:bg-accent transition-colors"
              >
                <Home size={16} />
                Home
              </Link>
              <Link
                href="/listings"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-bg px-6 py-3 text-sm font-medium text-ink hover:border-accent hover:text-accent transition-colors"
              >
                <Search size={16} />
                Browse listings
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full border border-line bg-bg px-6 py-3 text-sm font-medium text-ink hover:border-accent hover:text-accent transition-colors"
              >
                <Phone size={16} />
                Get in touch
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
