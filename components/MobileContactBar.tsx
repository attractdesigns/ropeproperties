"use client";

import { useEffect, useState } from "react";
import { Phone, MessageCircle } from "lucide-react";

interface ContactProps {
  phone?: string | null;
  whatsapp?: string | null;
  context: string;
}

export const INLINE_CONTACT_ID = "inline-contact";

function useLinks({ phone, whatsapp, context }: ContactProps) {
  const waNumber = (whatsapp ?? phone ?? "").replace(/[^0-9]/g, "");
  const message = encodeURIComponent(
    `Hello, I'm interested in "${context}". Please get in touch with me.`
  );
  return {
    tel: phone ? `tel:${phone.replace(/\s/g, "")}` : null,
    wa: waNumber ? `https://wa.me/${waNumber}?text=${message}` : null,
  };
}

const btnBase =
  "flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";
const callBtn = `${btnBase} border border-line bg-bg text-ink`;
const waBtn = `${btnBase} bg-ink text-bg`;

function Buttons({ tel, wa }: { tel: string | null; wa: string | null }) {
  return (
    <div className="flex gap-2">
      {tel && (
        <a href={tel} className={callBtn}>
          <Phone size={16} className="text-accent" aria-hidden />
          Call
        </a>
      )}
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" className={waBtn}>
          <MessageCircle size={16} aria-hidden />
          WhatsApp
        </a>
      )}
    </div>
  );
}

/**
 * Call / WhatsApp in the normal flow, right under the listing summary on
 * phones. Nothing is fixed here, so it can never cover content. The sticky
 * bar below only takes over once this scrolls out of view.
 */
export function InlineContactActions(props: ContactProps) {
  const { tel, wa } = useLinks(props);
  if (!tel && !wa) return null;
  return (
    <div id={INLINE_CONTACT_ID} className="mt-5 md:hidden">
      <Buttons tel={tel} wa={wa} />
    </div>
  );
}

/**
 * Fixed bottom bar on phones. It stays hidden while the inline actions are on
 * screen (so it never covers the title, price or stats), and while a form
 * field has focus (so it never sits between the user and the keyboard).
 * Render it AFTER the footer: its spacer then guarantees the last line of
 * the page can scroll clear of the bar. Hidden on md+ where the sidebar
 * does this job.
 */
export function MobileContactBar(props: ContactProps) {
  const { tel, wa } = useLinks(props);
  // Hidden until the inline actions have scrolled UP out of view. While they are
  // still below the fold the page top (title, price, stats) is on screen and a
  // fixed bar would cover it.
  const [passedInline, setPassedInline] = useState(false);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    const anchor = document.getElementById(INLINE_CONTACT_ID);
    if (!anchor) {
      // No inline row on this page: show the bar once the reader is past the first screen.
      const onScroll = () => setPassedInline(window.scrollY > window.innerHeight * 0.6);
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      return () => window.removeEventListener("scroll", onScroll);
    }
    const io = new IntersectionObserver(
      ([entry]) => setPassedInline(!entry.isIntersecting && entry.boundingClientRect.bottom < 0),
      { threshold: 0 }
    );
    io.observe(anchor);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const isField = (el: EventTarget | null) =>
      el instanceof HTMLElement && /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName);
    const onIn = (e: FocusEvent) => isField(e.target) && setTyping(true);
    const onOut = () => setTyping(false);
    document.addEventListener("focusin", onIn);
    document.addEventListener("focusout", onOut);
    return () => {
      document.removeEventListener("focusin", onIn);
      document.removeEventListener("focusout", onOut);
    };
  }, []);

  if (!tel && !wa) return null;

  const visible = passedInline && !typing;

  return (
    <>
      {/* Spacer: bar height + home-indicator inset, so the footer's last line clears the bar. */}
      <div
        className="md:hidden"
        style={{ height: "calc(4.5rem + env(safe-area-inset-bottom))" }}
        aria-hidden
      />
      <div
        inert={!visible}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 px-4 pt-3 shadow-[0_-6px_20px_-10px_rgba(0,0,0,0.15)] backdrop-blur-md motion-safe:transition-transform motion-safe:duration-200 md:hidden ${
          visible ? "translate-y-0" : "translate-y-full"
        }`}
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      >
        <Buttons tel={tel} wa={wa} />
      </div>
    </>
  );
}
