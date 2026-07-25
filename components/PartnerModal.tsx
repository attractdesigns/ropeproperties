"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X, MessageCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getStorageUrl } from "@/lib/storage";
import type { PartnerCompany } from "@/lib/types";

interface PartnerModalProps {
  partner: PartnerCompany;
  /** Trigger label, defaults to "Learn more". */
  triggerLabel?: string;
}

/**
 * A "Learn more" button that opens a modal with the partner's full details.
 * Keeps prospects on-site instead of sending them to the partner's website.
 */
export function PartnerModal({ partner, triggerLabel = "Learn more" }: PartnerModalProps) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  const logoUrl = getStorageUrl(partner.logo_path);

  // Close on Escape, lock body scroll while open, and focus the close button.
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Focus the close button shortly after the modal mounts.
    const t = setTimeout(() => closeBtnRef.current?.focus(), 50);

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1 text-sm text-accent hover:text-accent-deep transition-colors"
      >
        {triggerLabel} <ArrowRight size={12} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="partner-modal-title"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Panel */}
          <div
            ref={dialogRef}
            className="relative bg-white border border-line max-w-md w-full p-6 max-h-[90vh] overflow-y-auto"
          >
            <button
              ref={closeBtnRef}
              type="button"
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 p-1 text-muted hover:text-ink transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Logo */}
            {logoUrl ? (
              <div className="relative h-16 mb-4">
                <Image
                  src={logoUrl}
                  alt={partner.name}
                  fill
                  sizes="300px"
                  className="object-contain object-left"
                />
              </div>
            ) : (
              <p className="font-display text-2xl text-ink mb-4">{partner.name}</p>
            )}

            <h3 id="partner-modal-title" className="font-display text-xl text-ink">
              {partner.name}
            </h3>

            {partner.description && (
              <p className="mt-3 text-muted leading-relaxed">{partner.description}</p>
            )}

            {/* Conversion CTA — keeps the prospect on-site. */}
            <div className="mt-6 pt-4 border-t border-line flex flex-wrap gap-3">
              <Link
                href={`/contact?subject=${encodeURIComponent(`Enquiry about ${partner.name}`)}`}
                className="inline-flex items-center gap-2 bg-ink text-white px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
              >
                Ask me about {partner.name}
                <ArrowRight size={14} />
              </Link>
              <a
                href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2348000000000"}?text=${encodeURIComponent(
                  `Hello, I'd like to know more about ${partner.name}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 border border-line text-ink px-4 py-2 text-sm font-medium hover:border-accent hover:text-accent transition-colors"
              >
                <MessageCircle size={14} />
                WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}