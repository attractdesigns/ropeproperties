"use client";

import { Phone, MessageCircle } from "lucide-react";

interface MobileContactBarProps {
  phone?: string | null;
  whatsapp?: string | null;
  context: string;
}

/**
 * Fixed bottom bar on mobile that keeps call/WhatsApp a thumb away while
 * reading a listing. Hidden on md+ where the sidebar does this job.
 */
export function MobileContactBar({ phone, whatsapp, context }: MobileContactBarProps) {
  if (!phone && !whatsapp) return null;

  const waNumber = (whatsapp ?? phone ?? "").replace(/[^0-9]/g, "");
  const message = encodeURIComponent(
    `Hello, I'm interested in "${context}". Please get in touch with me.`
  );

  return (
    <>
      {/* Spacer so content isn't hidden under the bar on short pages */}
      <div className="h-20 md:hidden" aria-hidden />
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 px-4 py-3 shadow-[0_-6px_20px_-10px_rgba(0,0,0,0.15)] backdrop-blur-md md:hidden"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      >
        <div className="flex gap-2">
          {phone && (
            <a
              href={`tel:${phone.replace(/\s/g, "")}`}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-line bg-bg px-4 py-3 text-sm font-medium text-ink"
            >
              <Phone size={16} className="text-accent" />
              Call
            </a>
          )}
          {waNumber && (
            <a
              href={`https://wa.me/${waNumber}?text=${message}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm font-medium text-bg"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          )}
        </div>
      </div>
    </>
  );
}
