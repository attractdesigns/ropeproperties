import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// Set NEXT_PUBLIC_WHATSAPP_NUMBER (digits only, e.g. 2348012345678).
// TODO: client to supply the real number — the fallback is a placeholder.
const WHATSAPP_NUMBER =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "2348000000000";

interface WhatsAppButtonProps {
  phone?: string;
  message?: string;
  className?: string;
  label?: string;
  variant?: "solid" | "outline";
}

export function WhatsAppButton({
  phone = WHATSAPP_NUMBER,
  message,
  className,
  label = "WhatsApp",
  variant = "outline",
}: WhatsAppButtonProps) {
  const href = `https://wa.me/${phone}${message ? `?text=${encodeURIComponent(message)}` : ""}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
        variant === "solid"
          ? "bg-accent text-white hover:bg-accent-deep"
          : "border border-line text-ink hover:border-accent hover:text-accent",
        className
      )}
    >
      <MessageCircle size={16} />
      {label}
    </a>
  );
}