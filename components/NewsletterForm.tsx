"use client";

import { useState, type FormEvent } from "react";
import { Mail, Check } from "lucide-react";

/**
 * Light-touch newsletter signup. Deliberately UI-only for now — wire to your
 * ESP (Mailchimp, Resend audiences, Buttondown) by posting the email to an
 * API route from onSubmit. Keeps the footer honest in the meantime.
 */
export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "pending" | "done" | "error">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email) return;
    setState("pending");
    try {
      // Replace with real endpoint; keeping fetch here so wiring is one line later.
      await new Promise((r) => setTimeout(r, 400));
      setState("done");
      setEmail("");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="inline-flex items-center gap-2 text-sm text-accent">
        <Check size={16} /> You&apos;re on the list.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <Mail size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-11 w-full rounded-lg border border-line bg-bg pl-9 pr-3 text-sm text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>
      <button
        type="submit"
        disabled={state === "pending"}
        className="h-11 rounded-lg bg-ink px-4 text-sm font-medium text-bg hover:bg-accent transition-colors disabled:opacity-60"
      >
        {state === "pending" ? "…" : "Subscribe"}
      </button>
    </form>
  );
}
