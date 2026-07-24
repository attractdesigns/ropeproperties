import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="pt-16 min-h-[60vh] flex items-center">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-6xl text-accent">404</h1>
          <p className="mt-4 text-lg text-muted">
            The page you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block bg-ink text-white px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </main>
      <Footer />
    </>
  );
}